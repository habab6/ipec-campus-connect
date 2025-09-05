import { generate } from '@pdfme/generator';
import { Template, BLANK_PDF } from '@pdfme/common';
import { Student, Payment } from '@/types';

// Utility function to load PDF from public folder as base64
const loadPdfTemplate = async (templatePath: string): Promise<string> => {
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Failed to load PDF template: ${templatePath}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  return `data:application/pdf;base64,${base64}`;
};

// Create template configuration for pdfme  
const createRegistrationTemplate = async (templatePath: string): Promise<any> => {
  const basePdf = await loadPdfTemplate(templatePath);
  
  return {
    basePdf,
    schemas: [
      [
        // Chaque champ doit avoir un nom unique avec ses propriétés
        {
          name: 'numeroDocument',
          type: 'text',
          position: { x: 120, y: 50 },
          width: 150,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'dateDocument',
          type: 'text',
          position: { x: 120, y: 70 },
          width: 100,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'nomEtudiant',
          type: 'text',
          position: { x: 120, y: 90 },
          width: 200,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'dateNaissance',
          type: 'text',
          position: { x: 120, y: 110 },
          width: 100,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'lieuNaissance',
          type: 'text',
          position: { x: 120, y: 130 },
          width: 150,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'adresse',
          type: 'text',
          position: { x: 120, y: 150 },
          width: 250,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'telephone',
          type: 'text',
          position: { x: 120, y: 170 },
          width: 150,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'email',
          type: 'text',
          position: { x: 120, y: 190 },
          width: 200,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'programme',
          type: 'text',
          position: { x: 120, y: 210 },
          width: 150,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'niveauEtudes',
          type: 'text',
          position: { x: 120, y: 230 },
          width: 150,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'anneeInscription',
          type: 'text',
          position: { x: 120, y: 250 },
          width: 100,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
      ]
    ]
  };
};

// Fill registration document PDF with pdfme
export const fillRegistrationPdfWithPdfme = async (student: Student, templatePath: string = '/templates/attestation-template.pdf'): Promise<Uint8Array> => {
  try {
    const template = await createRegistrationTemplate(templatePath);
    
    // Current date for the document
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const documentNumber = `ATT-${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${Date.now().toString().slice(-4)}`;

    // Input data to fill the template
    const inputs = [
      {
        numeroDocument: documentNumber,
        dateDocument: currentDate,
        nomEtudiant: `${student.firstName} ${student.lastName}`,
        dateNaissance: student.dateOfBirth || '',
        lieuNaissance: student.countryOfBirth || '',
        adresse: student.address || '',
        telephone: student.phone || '',
        email: student.email || '',
        programme: student.program || '',
        niveauEtudes: student.program || '',
        anneeInscription: new Date().getFullYear().toString(),
      }
    ];

    console.log('Generating PDF with pdfme and inputs:', inputs[0]);

    const pdf = await generate({ template, inputs });
    return new Uint8Array(pdf);
  } catch (error) {
    console.error('Error filling registration PDF with pdfme:', error);
    throw new Error('Impossible de générer le PDF avec pdfme. Vérifiez le template et les positions.');
  }
};

// Create template for invoice
const createInvoiceTemplate = async (templatePath: string): Promise<any> => {
  const basePdf = await loadPdfTemplate(templatePath);
  
  return {
    basePdf,
    schemas: [
      [
        {
          name: 'numeroFacture',
          type: 'text',
          position: { x: 120, y: 50 },
          width: 150,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'dateFacture',
          type: 'text',
          position: { x: 120, y: 70 },
          width: 100,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'nomClient',
          type: 'text',
          position: { x: 120, y: 90 },
          width: 200,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'adresseClient',
          type: 'text',
          position: { x: 120, y: 110 },
          width: 250,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'telephoneClient',
          type: 'text',
          position: { x: 120, y: 130 },
          width: 150,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'emailClient',
          type: 'text',
          position: { x: 120, y: 150 },
          width: 200,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'designation',
          type: 'text',
          position: { x: 50, y: 200 },
          width: 200,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'montant',
          type: 'text',
          position: { x: 300, y: 200 },
          width: 100,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'montantTotal',
          type: 'text',
          position: { x: 300, y: 250 },
          width: 100,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
        {
          name: 'dateEcheance',
          type: 'text',
          position: { x: 120, y: 170 },
          width: 100,
          height: 15,
          fontSize: 12,
          fontName: 'NotoSerifJP-Regular',
        },
      ]
    ]
  };
};

// Fill invoice PDF with pdfme
export const fillInvoicePdfWithPdfme = async (student: Student, payment: Payment, templatePath: string = '/templates/facture-template.pdf'): Promise<Uint8Array> => {
  try {
    const template = await createInvoiceTemplate(templatePath);
    
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const invoiceNumber = `IPEC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;

    const inputs = [
      {
        numeroFacture: invoiceNumber,
        dateFacture: currentDate,
        nomClient: `${student.firstName} ${student.lastName}`,
        adresseClient: student.address || '',
        telephoneClient: student.phone || '',
        emailClient: student.email || '',
        designation: payment.description || 'Frais de scolarité',
        montant: payment.amount.toString(),
        montantTotal: payment.amount.toString(),
        dateEcheance: payment.dueDate || '',
      }
    ];

    const pdf = await generate({ template, inputs });
    return new Uint8Array(pdf);
  } catch (error) {
    console.error('Error filling invoice PDF with pdfme:', error);
    throw new Error('Impossible de générer la facture avec pdfme.');
  }
};

// Download PDF utility
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