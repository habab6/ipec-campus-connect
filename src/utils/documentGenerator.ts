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
  const currentDate = new Date();
  const documentNumber = `ATT-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}-${currentDate.getTime().toString().slice(-4)}`;
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attestation d'Inscription - IPEC</title>
    <style>
        @page {
            size: A4;
            margin: 1.5cm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.3; 
            color: #000;
            font-size: 10pt;
        }
        
        .header {
            text-align: center;
            margin-bottom: 0.8cm;
            padding-bottom: 0.3cm;
            border-bottom: 1px solid #000;
        }
        
        .logo {
            font-size: 18pt;
            font-weight: bold;
            color: #000;
            margin-bottom: 3px;
        }
        
        .institution {
            font-size: 11pt;
            margin-bottom: 8px;
        }
        
        .document-title {
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .document-number {
            font-size: 9pt;
        }
        
        .date-location {
            text-align: right;
            margin: 0.3cm 0;
            font-size: 10pt;
        }
        
        .certification {
            text-align: justify;
            font-size: 10pt;
            line-height: 1.4;
            margin-bottom: 0.5cm;
        }
        
        .student-details {
            margin: 0.4cm 0;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 2px;
            font-size: 10pt;
        }
        
        .label {
            font-weight: bold;
            width: 3cm;
            flex-shrink: 0;
        }
        
        .value {
            flex-grow: 1;
        }
        
        .program-section {
            text-align: center;
            margin: 0.4cm 0;
            padding: 8px;
            background: #f5f5f5;
        }
        
        .program-title {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 3px;
        }
        
        .program-details {
            font-size: 10pt;
        }
        
        .validity-text {
            text-align: center;
            font-style: italic;
            margin: 0.4cm 0;
            font-size: 10pt;
        }
        
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 0.6cm;
        }
        
        .signature-block {
            text-align: center;
            width: 5cm;
        }
        
        .signature-line {
            border-bottom: 1px solid #000;
            height: 1cm;
            margin-bottom: 5px;
        }
        
        .signature-label {
            font-size: 9pt;
        }
        
        .footer {
            text-align: center;
            margin-top: 0.5cm;
            padding-top: 0.3cm;
            border-top: 1px solid #ccc;
            font-size: 9pt;
        }
        
        @media print {
            body { margin: 0; padding: 0; }
            .signature-section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">IPEC</div>
        <div class="institution">Institut Privé des Études Commerciales</div>
        <h1 class="document-title">Attestation d'Inscription</h1>
        <div class="document-number">N° ${documentNumber}</div>
    </div>
    
    <div class="date-location">
        Bruxelles, le ${currentDate.toLocaleDateString('fr-FR')}
    </div>
    
    <div class="certification">
        Je soussigné, Directeur de l'Institut Privé des Études Commerciales (IPEC), 
        certifie que <strong>${student.firstName} ${student.lastName}</strong>${student.dateOfBirth ? `, né(e) le ${new Date(student.dateOfBirth).toLocaleDateString('fr-FR')}` : ''}${student.countryOfBirth ? ` à ${student.countryOfBirth}` : ''}, 
        est dûment inscrit(e) dans notre établissement pour l'année académique ${student.registrationYear}-${student.registrationYear + 1}.
    </div>
    
    <div class="student-details">
        <div class="detail-row">
            <span class="label">Nom :</span>
            <span class="value">${student.firstName} ${student.lastName}</span>
        </div>
        <div class="detail-row">
            <span class="label">Référence :</span>
            <span class="value">${student.reference}</span>
        </div>
        <div class="detail-row">
            <span class="label">Email :</span>
            <span class="value">${student.email}</span>
        </div>
        <div class="detail-row">
            <span class="label">Inscription :</span>
            <span class="value">${new Date(student.registrationDate).toLocaleDateString('fr-FR')}</span>
        </div>
        <div class="detail-row">
            <span class="label">Statut :</span>
            <span class="value">${student.status}</span>
        </div>
    </div>
    
    <div class="program-section">
        <div class="program-title">${student.program}</div>
        <div class="program-details">
            ${student.specialty ? `${student.specialty} • ` : ''}${student.studyYear}${student.studyYear === 1 ? 'ère' : 'ème'} année
        </div>
    </div>
    
    <div class="certification">
        L'étudiant(e) suit régulièrement les cours et est en règle avec les exigences administratives.
    </div>
    
    <div class="validity-text">
        Cette attestation est délivrée pour servir et valoir ce que de droit.
    </div>
    
    <div class="signature-section">
        <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">Cachet de l'Institution</div>
        </div>
        <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-label">Le Directeur</div>
        </div>
    </div>
    
    <div class="footer">
        <strong>Institut Privé des Études Commerciales - Bruxelles</strong>
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
            <p>Date: ${payment.invoiceDate ? new Date(payment.invoiceDate).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}</p>
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