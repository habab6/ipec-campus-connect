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
  const year = new Date().getFullYear();
  const studentCode = student.reference.split('-')[0] || student.id.slice(0, 4).toUpperCase();
  return `ATT-${year}-${studentCode}-${student.studyYear}`;
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

    // Positions pour la facture (ajustez selon votre template)
    const invoicePositions = {
      numeroFacture: { x: 120, y: 100 },
      dateFacture: { x: 400, y: 100 },
      nomClient: { x: 120, y: 200 },
      montant: { x: 400, y: 300 },
    };

    const invoiceData = {
      numeroFacture: invoiceNumberToUse,
      dateFacture: currentDate,
      nomClient: `${student.firstName} ${student.lastName}`,
      montant: `${payment.amount} €`,
    };

    Object.entries(invoiceData).forEach(([fieldName, value]) => {
      const position = invoicePositions[fieldName as keyof typeof invoicePositions];
      if (position) {
        firstPage.drawText(value, {
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
export const fillCreditNotePdf = async (student: Student, payment: Payment, reason: string): Promise<Uint8Array> => {
  throw new Error('Avoir pas encore implémenté avec positions x,y');
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
