import { Student, Payment, Document } from "@/types";

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  return `IPEC-${year}${month}-${timestamp.toString().slice(-6)}`;
};

export const generateCreditNoteNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  return `CN-${year}${month}-${timestamp.toString().slice(-6)}`;
};

export const generateRegistrationDocument = (student: Student): string => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document d'inscription - IPEC Bruxelles</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
        .content { margin: 20px 0; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; color: #374151; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">IPEC BRUXELLES</div>
        <h1>Document d'Inscription</h1>
        <p>Institut de Formation d'Excellence</p>
    </div>
    
    <div class="content">
        <h2>Informations de l'étudiant</h2>
        <div class="field"><span class="label">Nom complet:</span> ${student.firstName} ${student.lastName}</div>
        <div class="field"><span class="label">Email:</span> ${student.email}</div>
        <div class="field"><span class="label">Téléphone:</span> ${student.phone || 'Non renseigné'}</div>
        <div class="field"><span class="label">Date de naissance:</span> ${student.dateOfBirth || 'Non renseignée'}</div>
        <div class="field"><span class="label">Adresse:</span> ${student.address || 'Non renseignée'}</div>
        <div class="field"><span class="label">Programme:</span> ${student.program}</div>
        <div class="field"><span class="label">Spécialité:</span> ${student.specialty || 'Non définie'}</div>
        <div class="field"><span class="label">Date d'inscription:</span> ${new Date(student.registrationDate).toLocaleDateString('fr-FR')}</div>
        <div class="field"><span class="label">Statut:</span> ${student.status}</div>
        
        ${student.notes ? `<div class="field"><span class="label">Notes:</span> ${student.notes}</div>` : ''}
    </div>
    
    <div class="footer">
        <p>Ce document certifie l'inscription de l'étudiant mentionné ci-dessus.</p>
        <p><strong>IPEC Bruxelles</strong> - Institut de Formation d'Excellence</p>
        <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
    </div>
</body>
</html>
  `;
};

export const generateInvoice = (student: Student, payment: Payment): string => {
  const invoiceNumber = payment.invoiceNumber || generateInvoiceNumber();
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${invoiceNumber} - IPEC Bruxelles</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
        .invoice-info { text-align: right; }
        .billing-info { display: flex; justify-content: space-between; margin: 20px 0; }
        .billing-section { width: 45%; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-table th, .invoice-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        .invoice-table th { background-color: #f3f4f6; }
        .total { text-align: right; font-size: 18px; font-weight: bold; color: #2563eb; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="logo">IPEC BRUXELLES</div>
            <p>Institut de Formation d'Excellence<br>
            Bruxelles, Belgique</p>
        </div>
        <div class="invoice-info">
            <h1>FACTURE</h1>
            <p><strong>N° ${invoiceNumber}</strong></p>
            <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
            <p>Échéance: ${new Date(payment.dueDate).toLocaleDateString('fr-FR')}</p>
        </div>
    </div>
    
    <div class="billing-info">
        <div class="billing-section">
            <h3>Facturé à:</h3>
            <p><strong>${student.firstName} ${student.lastName}</strong><br>
            ${student.email}<br>
            ${student.phone || ''}<br>
            ${student.address || ''}</p>
        </div>
        <div class="billing-section">
            <h3>Émetteur:</h3>
            <p><strong>IPEC Bruxelles</strong><br>
            Institut de Formation d'Excellence<br>
            Bruxelles, Belgique</p>
        </div>
    </div>
    
    <table class="invoice-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Programme</th>
                <th>Montant</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${payment.description}</td>
                <td>${payment.type}</td>
                <td>${student.program}</td>
                <td>${payment.amount}€</td>
            </tr>
        </tbody>
    </table>
    
    <div class="total">
        <p>Total à payer: ${payment.amount}€</p>
    </div>
    
    <div class="footer">
        <p>Merci de votre confiance. Paiement dû avant le ${new Date(payment.dueDate).toLocaleDateString('fr-FR')}.</p>
        <p><strong>IPEC Bruxelles</strong> - Excellence en formation</p>
    </div>
</body>
</html>
  `;
};

export const generateCreditNote = (student: Student, payment: Payment, reason: string): string => {
  const creditNumber = generateCreditNoteNumber();
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Note de crédit ${creditNumber} - IPEC Bruxelles</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
        .credit-info { text-align: right; }
        .credit-note { color: #dc2626; font-weight: bold; }
        .billing-info { display: flex; justify-content: space-between; margin: 20px 0; }
        .billing-section { width: 45%; }
        .credit-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .credit-table th, .credit-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        .credit-table th { background-color: #fef2f2; }
        .total { text-align: right; font-size: 18px; font-weight: bold; color: #dc2626; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="logo">IPEC BRUXELLES</div>
            <p>Institut de Formation d'Excellence<br>
            Bruxelles, Belgique</p>
        </div>
        <div class="credit-info">
            <h1 class="credit-note">NOTE DE CRÉDIT</h1>
            <p><strong>N° ${creditNumber}</strong></p>
            <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
            <p>Facture originale: ${payment.invoiceNumber || 'N/A'}</p>
        </div>
    </div>
    
    <div class="billing-info">
        <div class="billing-section">
            <h3>Crédité à:</h3>
            <p><strong>${student.firstName} ${student.lastName}</strong><br>
            ${student.email}<br>
            ${student.phone || ''}<br>
            ${student.address || ''}</p>
        </div>
        <div class="billing-section">
            <h3>Émetteur:</h3>
            <p><strong>IPEC Bruxelles</strong><br>
            Institut de Formation d'Excellence<br>
            Bruxelles, Belgique</p>
        </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background-color: #fef2f2; border-left: 4px solid #dc2626;">
        <h3>Motif du remboursement:</h3>
        <p>${reason}</p>
    </div>
    
    <table class="credit-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Programme</th>
                <th>Montant remboursé</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${payment.description}</td>
                <td>${payment.type}</td>
                <td>${student.program}</td>
                <td>-${payment.amount}€</td>
            </tr>
        </tbody>
    </table>
    
    <div class="total">
        <p>Total remboursé: ${payment.amount}€</p>
    </div>
    
    <div class="footer">
        <p>Cette note de crédit annule la facture originale et confirme le remboursement.</p>
        <p><strong>IPEC Bruxelles</strong> - Excellence en formation</p>
    </div>
</body>
</html>
  `;
};

export const downloadDocument = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};