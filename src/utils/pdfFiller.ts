import { PDFDocument, PDFForm, PDFTextField, rgb } from 'pdf-lib';
import { Student, Payment } from '@/types';

// Load Questrial font
const loadQuestrialFont = async (): Promise<Uint8Array> => {
  try {
    const response = await fetch('/fonts/Questrial-Regular.ttf');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  } catch (error) {
    console.error('Error loading Questrial font:', error);
    throw error;
  }
};

// Utility function to load PDF from public folder
const loadPdfTemplate = async (templatePath: string): Promise<ArrayBuffer> => {
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Failed to load PDF template: ${templatePath}`);
  }
  return response.arrayBuffer();
};

// Fill registration document PDF
export const fillRegistrationPdf = async (student: Student, templatePath: string = '/templates/attestation-template.pdf'): Promise<Uint8Array> => {
  try {
    const existingPdfBytes = await loadPdfTemplate(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    // Embed Questrial font
    let questrialFont;
    try {
      const questrialFontBytes = await loadQuestrialFont();
      questrialFont = await pdfDoc.embedFont(questrialFontBytes);
      console.log('Questrial font loaded successfully');
    } catch (error) {
      console.warn('Failed to load Questrial font, using Helvetica:', error);
      questrialFont = await pdfDoc.embedFont('Helvetica');
    }

    // Current date for the document
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const documentNumber = `ATT-${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${Date.now().toString().slice(-4)}`;

    // Common field mappings - adjust these field names to match your PDF form fields
    const fieldMappings = {
      'numeroDocument': documentNumber,
      'dateDocument': currentDate,
      'nomEtudiant': `${student.firstName} ${student.lastName}`,
      'dateNaissance': student.dateOfBirth || '',
      'lieuNaissance': student.countryOfBirth || '',
      'adresse': student.address || '',
      'telephone': student.phone || '',
      'email': student.email || '',
      'programme': student.program || '',
      'niveauEtudes': student.program || '',
      'anneeInscription': new Date().getFullYear().toString(),
    };

    // Fill the form fields
    Object.entries(fieldMappings).forEach(([fieldName, value]) => {
      try {
        const field = form.getTextField(fieldName);
        field.setText(value);
        // Set font only (size will be determined by PDF template)
        field.updateAppearances(questrialFont);
        field.setFontSize(12);
        console.log(`Field '${fieldName}' filled with Questrial font size 12`);
      } catch (error) {
        console.warn(`Field '${fieldName}' not found in PDF template`);
      }
    });

    // Flatten the form to prevent further editing
    form.flatten();

    return await pdfDoc.save();
  } catch (error) {
    console.error('Error filling registration PDF:', error);
    throw new Error('Impossible de remplir le PDF d\'attestation. Vérifiez que le template existe.');
  }
};

// Fill invoice PDF
export const fillInvoicePdf = async (student: Student, payment: Payment, templatePath: string = '/templates/facture-template.pdf'): Promise<Uint8Array> => {
  try {
    const existingPdfBytes = await loadPdfTemplate(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    const currentDate = new Date().toLocaleDateString('fr-FR');
    const invoiceNumber = `IPEC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;

    const fieldMappings = {
      'numeroFacture': invoiceNumber,
      'dateFacture': currentDate,
      'nomClient': `${student.firstName} ${student.lastName}`,
      'adresseClient': student.address || '',
      'telephoneClient': student.phone || '',
      'emailClient': student.email || '',
      'designation': payment.description || 'Frais de scolarité',
      'montant': payment.amount.toString(),
      'tva': '0',
      'montantTotal': payment.amount.toString(),
      'dateEcheance': payment.dueDate || '',
    };

    Object.entries(fieldMappings).forEach(([fieldName, value]) => {
      try {
        const field = form.getTextField(fieldName);
        field.setText(value);
      } catch (error) {
        console.warn(`Field '${fieldName}' not found in PDF template`);
      }
    });

    form.flatten();
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error filling invoice PDF:', error);
    throw new Error('Impossible de remplir le PDF de facture. Vérifiez que le template existe.');
  }
};

// Fill credit note PDF
export const fillCreditNotePdf = async (student: Student, payment: Payment, reason: string, templatePath: string = '/templates/avoir-template.pdf'): Promise<Uint8Array> => {
  try {
    const existingPdfBytes = await loadPdfTemplate(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    const currentDate = new Date().toLocaleDateString('fr-FR');
    const creditNoteNumber = `CN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;

    const fieldMappings = {
      'numeroAvoir': creditNoteNumber,
      'dateAvoir': currentDate,
      'nomClient': `${student.firstName} ${student.lastName}`,
      'adresseClient': student.address || '',
      'telephoneClient': student.phone || '',
      'emailClient': student.email || '',
      'designation': payment.description || 'Remboursement frais de scolarité',
      'montant': payment.amount.toString(),
      'montantTotal': payment.amount.toString(),
      'motifRemboursement': reason,
      'factureOriginale': payment.invoiceNumber || '',
    };

    Object.entries(fieldMappings).forEach(([fieldName, value]) => {
      try {
        const field = form.getTextField(fieldName);
        field.setText(value);
      } catch (error) {
        console.warn(`Field '${fieldName}' not found in PDF template`);
      }
    });

    form.flatten();
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error filling credit note PDF:', error);
    throw new Error('Impossible de remplir le PDF d\'avoir. Vérifiez que le template existe.');
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