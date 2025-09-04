import { PDFDocument, PDFForm, PDFTextField, rgb, StandardFonts } from 'pdf-lib';

export const createAttestationTemplate = async (): Promise<Uint8Array> => {
  // Créer un nouveau document PDF
  const pdfDoc = await PDFDocument.create();
  
  // Ajouter une page A4
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 en points
  const { width, height } = page.getSize();
  
  // Charger une police
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // En-tête avec logo (placeholder)
  page.drawText('IPEC', {
    x: 50,
    y: height - 80,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Institut Privé d\'Enseignement Commercial', {
    x: 50,
    y: height - 110,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('123 Avenue de l\'Education, 1000 Bruxelles', {
    x: 50,
    y: height - 130,
    size: 10,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  // Titre du document
  page.drawText('ATTESTATION D\'INSCRIPTION', {
    x: 150,
    y: height - 200,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  
  // Obtenir le formulaire
  const form = pdfDoc.getForm();
  
  // Créer les champs de formulaire
  let yPosition = height - 250;
  
  // Numéro de document
  page.drawText('N° Document:', {
    x: 50,
    y: yPosition,
    size: 11,
    font: boldFont,
  });
  
  const numeroDocumentField = form.createTextField('numeroDocument');
  numeroDocumentField.setText('');
  numeroDocumentField.addToPage(page, {
    x: 150,
    y: yPosition - 5,
    width: 200,
    height: 20,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  yPosition -= 40;
  
  // Date du document
  page.drawText('Date:', {
    x: 50,
    y: yPosition,
    size: 11,
    font: boldFont,
  });
  
  const dateDocumentField = form.createTextField('dateDocument');
  dateDocumentField.setText('');
  dateDocumentField.addToPage(page, {
    x: 150,
    y: yPosition - 5,
    width: 200,
    height: 20,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  yPosition -= 60;
  
  // Texte de certification
  page.drawText('Je soussigné, Directeur de l\'IPEC, certifie par la présente que :', {
    x: 50,
    y: yPosition,
    size: 11,
    font: font,
  });
  
  yPosition -= 40;
  
  // Nom de l'étudiant
  page.drawText('Nom et Prénom:', {
    x: 50,
    y: yPosition,
    size: 11,
    font: boldFont,
  });
  
  const nomEtudiantField = form.createTextField('nomEtudiant');
  nomEtudiantField.setText('');
  nomEtudiantField.addToPage(page, {
    x: 170,
    y: yPosition - 5,
    width: 300,
    height: 20,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  yPosition -= 30;
  
  // Date de naissance
  page.drawText('Né(e) le:', {
    x: 50,
    y: yPosition,
    size: 11,
    font: boldFont,
  });
  
  const dateNaissanceField = form.createTextField('dateNaissance');
  dateNaissanceField.setText('');
  dateNaissanceField.addToPage(page, {
    x: 120,
    y: yPosition - 5,
    width: 120,
    height: 20,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  page.drawText('à:', {
    x: 260,
    y: yPosition,
    size: 11,
    font: boldFont,
  });
  
  const lieuNaissanceField = form.createTextField('lieuNaissance');
  lieuNaissanceField.setText('');
  lieuNaissanceField.addToPage(page, {
    x: 280,
    y: yPosition - 5,
    width: 200,
    height: 20,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  yPosition -= 30;
  
  // Adresse
  page.drawText('Adresse:', {
    x: 50,
    y: yPosition,
    size: 11,
    font: boldFont,
  });
  
  const adresseField = form.createTextField('adresse');
  adresseField.setText('');
  adresseField.addToPage(page, {
    x: 120,
    y: yPosition - 5,
    width: 350,
    height: 20,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  yPosition -= 30;
  
  // Téléphone
  page.drawText('Téléphone:', {
    x: 50,
    y: yPosition,
    size: 11,
    font: boldFont,
  });
  
  const telephoneField = form.createTextField('telephone');
  telephoneField.setText('');
  telephoneField.addToPage(page, {
    x: 130,
    y: yPosition - 5,
    width: 150,
    height: 20,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  page.drawText('Email:', {
    x: 300,
    y: yPosition,
    size: 11,
    font: boldFont,
  });
  
  const emailField = form.createTextField('email');
  emailField.setText('');
  emailField.addToPage(page, {
    x: 340,
    y: yPosition - 5,
    width: 200,
    height: 20,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  yPosition -= 50;
  
  // Programme d'études
  page.drawText('Est régulièrement inscrit(e) en:', {
    x: 50,
    y: yPosition,
    size: 11,
    font: font,
  });
  
  yPosition -= 30;
  
  page.drawText('Programme:', {
    x: 50,
    y: yPosition,
    size: 11,
    font: boldFont,
  });
  
  const programmeField = form.createTextField('programme');
  programmeField.setText('');
  programmeField.addToPage(page, {
    x: 130,
    y: yPosition - 5,
    width: 200,
    height: 20,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  page.drawText('Niveau:', {
    x: 350,
    y: yPosition,
    size: 11,
    font: boldFont,
  });
  
  const niveauEtudesField = form.createTextField('niveauEtudes');
  niveauEtudesField.setText('');
  niveauEtudesField.addToPage(page, {
    x: 400,
    y: yPosition - 5,
    width: 150,
    height: 20,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  yPosition -= 30;
  
  // Année d'inscription
  page.drawText('Pour l\'année académique:', {
    x: 50,
    y: yPosition,
    size: 11,
    font: boldFont,
  });
  
  const anneeInscriptionField = form.createTextField('anneeInscription');
  anneeInscriptionField.setText('');
  anneeInscriptionField.addToPage(page, {
    x: 220,
    y: yPosition - 5,
    width: 100,
    height: 20,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });
  
  yPosition -= 60;
  
  // Texte de validité
  page.drawText('Cette attestation est délivrée pour servir et valoir ce que de droit.', {
    x: 50,
    y: yPosition,
    size: 11,
    font: font,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 80;
  
  // Signature
  page.drawText('Fait à Bruxelles, le _______________', {
    x: 50,
    y: yPosition,
    size: 11,
    font: font,
  });
  
  page.drawText('Le Directeur', {
    x: 400,
    y: yPosition,
    size: 11,
    font: boldFont,
  });
  
  page.drawText('_______________________', {
    x: 380,
    y: yPosition - 60,
    size: 11,
    font: font,
  });
  
  return await pdfDoc.save();
};

// Fonction pour télécharger le template
export const downloadAttestationTemplate = async () => {
  const pdfBytes = await createAttestationTemplate();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'attestation-template.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};