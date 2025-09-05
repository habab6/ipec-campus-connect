import { Student, Payment } from '@/types';

// Solution alternative : convertir le PDF en image, puis overlay le texte
// Ceci est la seule approche qui fonctionne vraiment dans le navigateur
// pour remplacer du texte par des placeholders dans un PDF existant

// Fonction pour charger et convertir le PDF template en base64
const loadPdfAsBase64 = async (templatePath: string): Promise<string> => {
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Failed to load PDF template: ${templatePath}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  return base64;
};

// Configuration des placeholders avec leurs positions approximatives
// Vous devrez ajuster ces positions selon votre template PDF réel
const PLACEHOLDERS_CONFIG = {
  '{numeroDocument}': { x: 120, y: 50 },
  '{dateDocument}': { x: 120, y: 70 },
  '{nomEtudiant}': { x: 120, y: 90 },
  '{dateNaissance}': { x: 120, y: 110 },
  '{lieuNaissance}': { x: 120, y: 130 },
  '{adresse}': { x: 120, y: 150 },
  '{telephone}': { x: 120, y: 170 },
  '{email}': { x: 120, y: 190 },
  '{programme}': { x: 120, y: 210 },
  '{niveauEtudes}': { x: 120, y: 230 },
  '{anneeInscription}': { x: 120, y: 250 },
};

// Fonction pour remplir le PDF avec vos balises personnalisées
export const fillRegistrationPdfWithPlaceholders = async (student: Student, templatePath: string = '/templates/attestation-template.pdf'): Promise<Uint8Array> => {
  console.log('🎯 Utilisation des balises placeholders dans le PDF !');
  
  try {
    // Charger le PDF template
    const pdfBase64 = await loadPdfAsBase64(templatePath);
    
    // Préparer les données de remplacement
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const documentNumber = `ATT-${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${Date.now().toString().slice(-4)}`;

    const replacements = {
      '{numeroDocument}': documentNumber,
      '{dateDocument}': currentDate,
      '{nomEtudiant}': `${student.firstName} ${student.lastName}`,
      '{dateNaissance}': student.dateOfBirth || '',
      '{lieuNaissance}': student.countryOfBirth || '',
      '{adresse}': student.address || '',
      '{telephone}': student.phone || '',
      '{email}': student.email || '',
      '{programme}': student.program || '',
      '{niveauEtudes}': student.program || '',
      '{anneeInscription}': new Date().getFullYear().toString(),
    };

    console.log('📋 Remplacement des balises:');
    Object.entries(replacements).forEach(([placeholder, value]) => {
      console.log(`   ${placeholder} → "${value}"`);
    });

    // IMPORTANT: Cette approche nécessite un service backend ou une API
    // pour le remplacement réel des balises dans le PDF
    // Pour l'instant, on simule le processus
    
    // Simulation : on retourne le PDF original avec un message
    const originalPdfBytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
    
    console.log('⚠️  SIMULATION: Le PDF original est retourné sans modification');
    console.log('💡 Pour un vrai remplacement de balises, il faut:');
    console.log('   1. Un service backend avec une bibliothèque comme PyPDF ou iText');
    console.log('   2. Ou utiliser une API externe comme PDFShift/DocRaptor');
    console.log('   3. Ou créer le PDF depuis zéro avec les positions exactes');
    
    return originalPdfBytes;
    
  } catch (error) {
    console.error('Erreur lors du remplissage du PDF:', error);
    throw new Error('Impossible de remplir le PDF avec les balises. Le remplacement de texte dans les PDFs existants nécessite un service backend.');
  }
};

// Fonction temporaire pour les factures
export const fillInvoicePdfWithPlaceholders = async (student: Student, payment: Payment, templatePath: string = '/templates/facture-template.pdf'): Promise<Uint8Array> => {
  console.log('🧾 Génération de facture avec balises (simulation)');
  return fillRegistrationPdfWithPlaceholders(student, templatePath);
};

// Fonction temporaire pour les avoirs
export const fillCreditNotePdf = async (student: Student, payment: Payment, reason: string, templatePath: string = '/templates/avoir-template.pdf'): Promise<Uint8Array> => {
  console.log('📄 Génération d\'avoir avec balises (simulation)');
  return fillRegistrationPdfWithPlaceholders(student, templatePath);
};

// Fonction pour télécharger les templates
export const downloadAttestationTemplate = () => {
  const link = document.createElement('a');
  link.href = '/templates/attestation-template.pdf';
  link.download = 'attestation-template.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

// SOLUTION RECOMMANDÉE: Créer une API backend
export const createBackendSolution = () => {
  console.log(`
🚀 SOLUTION RECOMMANDÉE pour les balises {placeholder}:

1. Créer une API backend (Node.js/Python/PHP) avec:
   - PyPDF2/PyPDF4 (Python)
   - PDFtk (Command line)
   - iText (Java)
   - pdf-lib + pdf2pic (Node.js)

2. Ou utiliser une API externe:
   - PDFShift.io
   - DocRaptor
   - Documint
   - PDF.co

3. Workflow:
   Frontend → API avec template + données → API remplace balises → PDF final

Exemple d'API Node.js:
/api/fill-pdf
POST { studentData, templateType }
→ PDF with placeholders replaced
  `);
};

console.log('ℹ️  Lancez createBackendSolution() pour voir la solution recommandée');