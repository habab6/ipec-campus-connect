import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Student, Payment, RegistrationAttestation, Invoice } from '@/types';

// Configuration des positions pour chaque champ
// Ajustez ces coordonnées selon votre template PDF
const FIELD_POSITIONS = {
  numeroDocument: { x: 425, y: 38.5 },       // Position du numéro de document
  dateDocument: { x: 160, y: 547.5 },          // Position de la date
  civilite: { x: 120, y: 700 },              // Position civilité (M./Mme/Mlle/Mx)
  nomComplet: { x: 210, y: 274.9 },            // Position nom complet
  dateNaissance: { x: 210, y: 291.2 },         // Position date de naissance
  villeNaissance: { x: 210, y: 650 },        // Position ville de naissance
  paysNaissance: { x: 210, y: 650 },         // Position pays de naissance
  nationalite: { x: 210, y: 308.4 },           // Position nationalité
  numeroIdentite: { x: 210, y: 324.3 },        // Position numéro d'identité/passeport
  telephone: { x: 210, y: 600 },             // Position téléphone
  email: { x: 210, y: 550 },                 // Position email
  adresse: { x: 210, y: 500 },               // Position adresse complète
  programme: { x: 290, y: 450 },             // Position programme d'études
  niveau: { x: 210, y: 450 },                // Position niveau (1ère, 2ème...)
  specialite: { x: 210, y: 400 },            // Position spécialité
  anneeAcademique: { x: 210, y: 400 },       // Position année académique
  dateInscription: { x: 210, y: 350 },       // Position date d'inscription
};

// Charger le PDF template
const loadPdfTemplate = async (templatePath: string): Promise<ArrayBuffer> => {
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Failed to load PDF template: ${templatePath}`);
  }
  return response.arrayBuffer();
};

// Charger la police Questrial
const loadQuestrialFont = async (): Promise<Uint8Array> => {
  try {
    const response = await fetch('/fonts/Questrial-Regular-v2.ttf');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    console.error('Error loading Questrial font:', error);
    throw error;
  }
};

// Générer un numéro d'attestation unique
const generateAttestationNumber = (student: Student): string => {
  // Déterminer le suffixe selon le programme
  let programSuffix = '';
  if (student.program === 'BBA') {
    programSuffix = 'B';
  } else if (student.program === 'MBA') {
    programSuffix = 'M';
  } else if (student.program === 'MBA Complémentaire') {
    programSuffix = 'MC';
  }
  
  return `ATT-${student.reference}-${student.studyYear}-${programSuffix}`;
};

// Remplir le PDF avec positionnement x,y
export const fillRegistrationPdfWithPositions = async (student: Student, attestationNumber?: string, templatePath: string = '/templates/attestation-template.pdf'): Promise<Uint8Array> => {
  try {
    console.log('📍 Génération PDF avec positionnement x,y');
    
    // Charger le PDF template
    const existingPdfBytes = await loadPdfTemplate(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Enregistrer fontkit pour les polices personnalisées
    pdfDoc.registerFontkit(fontkit);
    
    // Obtenir la première page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();
    
    // Charger la police Questrial
    let font;
    try {
      const questrialFontBytes = await loadQuestrialFont();
      font = await pdfDoc.embedFont(questrialFontBytes);
      console.log('✅ Police Questrial chargée avec succès');
    } catch (error) {
      console.warn('⚠️  Questrial non trouvée, utilisation de Helvetica:', error);
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }
    
    // Préparer les données avec tous les nouveaux champs
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const documentNumber = attestationNumber || generateAttestationNumber(student);
    
    // Formatage du niveau d'études
    const formatNiveau = (studyYear: number) => {
      if (studyYear === 1) return "1ère année";
      if (studyYear === 2) return "2ème année";
      return `${studyYear}ème année`;
    };

    const fieldData = {
      numeroDocument: documentNumber,
      dateDocument: currentDate,
      civilite: student.civilite || '',
      nomComplet: `${student.firstName} ${student.lastName}`,
      dateNaissance: new Date(student.dateOfBirth).toLocaleDateString('fr-FR') || '',
      villeNaissance: student.cityOfBirth || '',
      paysNaissance: student.countryOfBirth || '',
      nationalite: student.nationality || '',
      numeroIdentite: student.identityNumber || '',
      telephone: student.phone || '',
      email: student.email || '',
      adresse: student.address || '',
      programme: student.program || '',
      niveau: formatNiveau(student.studyYear),
      specialite: student.specialty || '',
      anneeAcademique: student.academicYear || '',
      dateInscription: new Date(student.registrationDate).toLocaleDateString('fr-FR') || '',
    };

    // Ajouter le texte à chaque position
    Object.entries(fieldData).forEach(([fieldName, value]) => {
      const position = FIELD_POSITIONS[fieldName as keyof typeof FIELD_POSITIONS];
      if (position && value) {
        console.log(`✏️  ${fieldName}: "${value}" à (${position.x}, ${position.y})`);
        
        firstPage.drawText(value, {
          x: position.x,
          y: height - position.y, // PDF coordonnées inversées (0,0 en bas à gauche)
          size: 12,
          font: font,
          color: rgb(0, 0, 0), // Noir
        });
      }
    });

    console.log('💡 Positions actuelles:');
    console.table(FIELD_POSITIONS);
    console.log('🔧 Pour ajuster, modifiez FIELD_POSITIONS dans le fichier');

    return await pdfDoc.save();
  } catch (error) {
    console.error('Erreur lors du remplissage PDF avec positions:', error);
    throw new Error('Impossible de générer le PDF avec positions x,y.');
  }
};

// Générer un numéro de facture unique
const generateInvoiceNumber = (student: Student, payment: Payment): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const studentCode = student.reference.split('-')[0] || student.id.slice(0, 4).toUpperCase();
  const typeCode = payment.type === 'Frais de dossier' ? 'FD' : 
                   payment.type === 'Minerval' ? 'MIN' : 'FAC';
  return `IPEC-${year}${month}-${studentCode}-${typeCode}`;
};

// Version pour les factures
export const fillInvoicePdfWithPositions = async (student: Student, payment: Payment, invoiceNumber?: string, templatePath: string = '/templates/facture-template.pdf'): Promise<Uint8Array> => {
  try {
    const existingPdfBytes = await loadPdfTemplate(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();
    
    // Charger la police Questrial
    let font;
    try {
      const questrialFontBytes = await loadQuestrialFont();
      font = await pdfDoc.embedFont(questrialFontBytes);
    } catch (error) {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    const currentDate = new Date().toLocaleDateString('fr-FR');
    const invoiceNumberToUse = invoiceNumber || generateInvoiceNumber(student, payment);

    // Positions pour la facture - utilise les mêmes positions que les attestations
    const invoicePositions = {
      numeroDocument: FIELD_POSITIONS.numeroDocument,
      dateDocument: FIELD_POSITIONS.dateDocument,
      civilite: FIELD_POSITIONS.civilite,
      nomComplet: FIELD_POSITIONS.nomComplet,
      dateNaissance: FIELD_POSITIONS.dateNaissance,
      villeNaissance: FIELD_POSITIONS.villeNaissance,
      paysNaissance: FIELD_POSITIONS.paysNaissance,
      nationalite: FIELD_POSITIONS.nationalite,
      numeroIdentite: FIELD_POSITIONS.numeroIdentite,
      telephone: FIELD_POSITIONS.telephone,
      email: FIELD_POSITIONS.email,
      adresse: FIELD_POSITIONS.adresse,
      programme: FIELD_POSITIONS.programme,
      niveau: FIELD_POSITIONS.niveau,
      specialite: FIELD_POSITIONS.specialite,
      anneeAcademique: FIELD_POSITIONS.anneeAcademique,
      dateInscription: FIELD_POSITIONS.dateInscription,
      montant: { x: 400, y: 300 },
      typeFacture: { x: 120, y: 320 },
    };

    // Utiliser l'année académique du paiement, pas celle actuelle de l'étudiant
    const academicYear = payment.academicYear || student.academicYear;
    const studyYear = payment.studyYear || student.studyYear;

    const invoiceData = {
      numeroDocument: invoiceNumberToUse,
      dateDocument: currentDate,
      civilite: student.civilite,
      nomComplet: `${student.firstName} ${student.lastName}`,
      dateNaissance: new Date(student.dateOfBirth).toLocaleDateString('fr-FR'),
      villeNaissance: student.cityOfBirth,
      paysNaissance: student.countryOfBirth,
      nationalite: student.nationality,
      numeroIdentite: student.identityNumber,
      telephone: student.phone,
      email: student.email,
      adresse: student.address,
      programme: student.program,
      niveau: studyYear === 1 ? '1ère année' : `${studyYear}ème année`,
      specialite: student.specialty,
      anneeAcademique: academicYear,
      dateInscription: new Date(student.registrationDate).toLocaleDateString('fr-FR'),
      montant: `${payment.amount} €`,
      typeFacture: payment.type,
    };

    console.log('📍 Génération facture PDF avec positionnement x,y');
    console.log('✅ Police Questrial chargée avec succès');

    Object.entries(invoiceData).forEach(([fieldName, value]) => {
      const position = invoicePositions[fieldName as keyof typeof invoicePositions];
      if (position) {
        console.log(`✏️  ${fieldName}: "${value}" à (${position.x}, ${position.y})`);
        firstPage.drawText(String(value), {
          x: position.x,
          y: height - position.y,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
    });

    return await pdfDoc.save();
  } catch (error) {
    console.error('Erreur facture:', error);
    throw new Error('Impossible de générer la facture.');
  }
};

// Fonction temporaire pour les avoirs
export const fillCreditNotePdf = async (student: Student, payment: Payment, reason: string, originalInvoiceNumber?: string): Promise<Uint8Array> => {
  try {
    console.log('Génération du PDF de note de crédit pour:', student.firstName, student.lastName);
    
    // Charger le template PDF
    const templateBytes = await loadPdfTemplate('/templates/facture-template.pdf');
    
    // Créer le document PDF
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    // Charger la police personnalisée
    const fontBytes = await loadQuestrialFont();
    const customFont = await pdfDoc.embedFont(fontBytes);
    
    // Utiliser le numéro de facture fourni ou récupérer depuis le paiement
    let invoiceNumber = originalInvoiceNumber || payment.invoiceNumber || 'FACTURE-INCONNUE';
    
    // Si toujours pas de numéro, construire un basique
    if (!originalInvoiceNumber && (!payment.invoiceNumber || payment.invoiceNumber.trim() === '')) {
      const typeCode = payment.type === 'Frais de dossier' ? 'FD' : 
                       payment.type === 'Minerval' ? 'MIN' : 'FAC';
      invoiceNumber = `IPEC-${new Date().getFullYear()}-${typeCode}`;
    }
    
    const creditNoteNumber = `${invoiceNumber}-NC`;
    
    // Titre "NOTE DE CRÉDIT" (remplacer le titre facture)
    firstPage.drawText('NOTE DE CRÉDIT', {
      x: 200,
      y: 750,
      size: 16,
      font: customFont,
      color: rgb(0.8, 0.1, 0.1), // Rouge pour la note de crédit
    });
    
    // Numéro de la note de crédit
    firstPage.drawText(`N° ${creditNoteNumber}`, {
      x: FIELD_POSITIONS.numeroDocument.x,
      y: FIELD_POSITIONS.numeroDocument.y,
      size: 12,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    
    // Date d'émission
    const currentDate = new Date().toLocaleDateString('fr-FR');
    firstPage.drawText(`Date: ${currentDate}`, {
      x: FIELD_POSITIONS.dateDocument.x,
      y: FIELD_POSITIONS.dateDocument.y,
      size: 10,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    
    // Informations de l'étudiant
    firstPage.drawText(`${student.firstName} ${student.lastName}`, {
      x: FIELD_POSITIONS.nomComplet.x,
      y: FIELD_POSITIONS.nomComplet.y,
      size: 12,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    
    firstPage.drawText(`Réf: ${student.reference}`, {
      x: FIELD_POSITIONS.nomComplet.x,
      y: FIELD_POSITIONS.nomComplet.y - 20,
      size: 10,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    
    // Facture d'origine (très important !)
    firstPage.drawText(`Facture d'origine: ${invoiceNumber}`, {
      x: FIELD_POSITIONS.nomComplet.x,
      y: FIELD_POSITIONS.nomComplet.y - 40,
      size: 11,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    
    // Type de paiement remboursé
    firstPage.drawText(`Type: ${payment.type}`, {
      x: FIELD_POSITIONS.nomComplet.x,
      y: FIELD_POSITIONS.nomComplet.y - 60,
      size: 11,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    
    // Montant remboursé (en rouge et plus visible)
    firstPage.drawText(`MONTANT REMBOURSÉ: ${payment.amount}€`, {
      x: FIELD_POSITIONS.nomComplet.x,
      y: FIELD_POSITIONS.nomComplet.y - 90,
      size: 14,
      font: customFont,
      color: rgb(0.8, 0.1, 0.1),
    });
    
    // Motif du remboursement
    firstPage.drawText('MOTIF DU REMBOURSEMENT:', {
      x: FIELD_POSITIONS.nomComplet.x,
      y: FIELD_POSITIONS.nomComplet.y - 120,
      size: 11,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    
    // Découper le motif en plusieurs lignes si nécessaire
    const maxLineLength = 60; // Nombre approximatif de caractères par ligne
    const reasonLines = [];
    let currentLine = '';
    const words = reason.split(' ');
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxLineLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) reasonLines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) reasonLines.push(currentLine);
    
    // Afficher chaque ligne du motif
    reasonLines.forEach((line, index) => {
      firstPage.drawText(line, {
        x: FIELD_POSITIONS.nomComplet.x,
        y: FIELD_POSITIONS.nomComplet.y - 140 - (index * 15),
        size: 10,
        font: customFont,
        color: rgb(0, 0, 0),
      });
    });
    
    console.log('PDF de note de crédit généré avec succès');
    console.log('Facture d\'origine utilisée:', invoiceNumber);
    console.log('Numéro de note de crédit:', creditNoteNumber);
    
    return await pdfDoc.save();
  } catch (error) {
    console.error('Erreur lors de la génération du PDF de note de crédit:', error);
    throw new Error(`Impossible de générer la note de crédit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};


// Fonction de téléchargement
export const downloadPdf = (pdfBytes: Uint8Array, filename: string) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Fonction utile pour trouver les bonnes positions
export const debugPositions = () => {
  console.log(`
🎯 GUIDE POUR AJUSTER LES POSITIONS:

1. Ouvrez votre PDF template
2. Mesurez approximativement où placer chaque champ
3. Ajustez les valeurs dans FIELD_POSITIONS
4. Testez et réajustez

📏 Système de coordonnées PDF:
- (0, 0) = coin en bas à gauche
- x augmente vers la droite
- y augmente vers le haut
- Page A4 ≈ 595 x 842 points

💡 Astuce: Commencez avec de grandes valeurs y (750, 700, 650...)
et ajustez progressivement.
  `);
};

// Fonction pour combiner une facture et sa note de crédit en un seul PDF
export const combineInvoiceAndCreditNotePdf = async (
  student: Student, 
  payment: Payment, 
  invoiceNumber: string,
  creditNote: any
): Promise<Uint8Array> => {
  try {
    // Générer la facture
    const invoicePdfBytes = await fillInvoicePdfWithPositions(student, payment, invoiceNumber);
    
    // Générer la note de crédit
    const creditNotePdfBytes = await fillCreditNotePdf(student, payment, creditNote.reason, invoiceNumber);
    
    // Créer un nouveau document PDF
    const combinedPdf = await PDFDocument.create();
    
    // Charger les deux PDFs
    const invoicePdf = await PDFDocument.load(invoicePdfBytes);
    const creditNotePdf = await PDFDocument.load(creditNotePdfBytes);
    
    // Copier toutes les pages de la facture
    const invoicePages = await combinedPdf.copyPages(invoicePdf, invoicePdf.getPageIndices());
    invoicePages.forEach((page) => combinedPdf.addPage(page));
    
    // Copier toutes les pages de la note de crédit
    const creditNotePages = await combinedPdf.copyPages(creditNotePdf, creditNotePdf.getPageIndices());
    creditNotePages.forEach((page) => combinedPdf.addPage(page));
    
    // Retourner le PDF combiné
    return await combinedPdf.save();
  } catch (error) {
    console.error('Erreur lors de la combinaison des PDFs:', error);
    throw error;
  }
};
