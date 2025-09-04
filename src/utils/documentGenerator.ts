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
    <title>Attestation d'Inscription - IPEC Bruxelles</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Inter', sans-serif; 
            line-height: 1.6; 
            color: #1f2937;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .document-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
            color: white;
            padding: 40px 50px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
            opacity: 0.1;
        }
        
        .logo {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1;
        }
        
        .institution-name {
            font-size: 18px;
            font-weight: 400;
            margin-bottom: 25px;
            opacity: 0.95;
            position: relative;
            z-index: 1;
        }
        
        .document-title {
            font-size: 28px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .document-subtitle {
            font-size: 16px;
            font-weight: 300;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .document-info {
            background: #f8fafc;
            padding: 20px 50px;
            border-bottom: 3px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .document-number {
            font-weight: 600;
            color: #1e40af;
            font-size: 14px;
        }
        
        .document-date {
            font-size: 14px;
            color: #6b7280;
        }
        
        .content {
            padding: 50px;
        }
        
        .certification-text {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border-left: 5px solid #10b981;
            padding: 25px;
            margin-bottom: 40px;
            border-radius: 0 8px 8px 0;
            font-size: 16px;
            line-height: 1.8;
            color: #065f46;
        }
        
        .student-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-section {
            background: #f9fafb;
            padding: 25px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .section-title::before {
            content: '●';
            color: #3b82f6;
            font-size: 12px;
        }
        
        .field {
            margin-bottom: 15px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .label {
            font-weight: 500;
            color: #6b7280;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .value {
            font-weight: 600;
            color: #1f2937;
            font-size: 15px;
        }
        
        .program-highlight {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border: 2px solid #3b82f6;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
        }
        
        .program-title {
            font-size: 20px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 8px;
        }
        
        .program-details {
            color: #1e40af;
            font-weight: 500;
        }
        
        .footer {
            background: #f8fafc;
            padding: 40px 50px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin: 40px 0 20px 0;
            align-items: flex-end;
        }
        
        .signature-box {
            text-align: center;
            width: 200px;
        }
        
        .signature-line {
            border-bottom: 2px solid #1e40af;
            margin-bottom: 10px;
            height: 60px;
        }
        
        .signature-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .institution-footer {
            font-weight: 600;
            color: #1e40af;
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .footer-text {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-actif {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }
        
        .status-inactif {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }
        
        .status-suspendu {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fed7aa;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .document-container {
                box-shadow: none;
                border-radius: 0;
            }
        }
        
        @media (max-width: 768px) {
            .student-info {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .signature-section {
                flex-direction: column;
                gap: 30px;
                align-items: center;
            }
            
            .content, .header, .document-info, .footer {
                padding-left: 25px;
                padding-right: 25px;
            }
        }
    </style>
</head>
<body>
    <div class="document-container">
        <div class="header">
            <div class="logo">IPEC BRUXELLES</div>
            <div class="institution-name">Institut Privé d'Enseignement Complémentaire</div>
            <h1 class="document-title">Attestation d'Inscription</h1>
            <div class="document-subtitle">Document Officiel</div>
        </div>
        
        <div class="document-info">
            <div class="document-number">N° ${documentNumber}</div>
            <div class="document-date">Délivrée le ${currentDate.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</div>
        </div>
        
        <div class="content">
            <div class="certification-text">
                <strong>Je soussigné, Directeur de l'Institut Privé d'Enseignement Complémentaire (IPEC) de Bruxelles, certifie par la présente que :</strong>
            </div>
            
            <div class="student-info">
                <div class="info-section">
                    <h3 class="section-title">Informations Personnelles</h3>
                    <div class="field">
                        <span class="label">Nom complet</span>
                        <span class="value">${student.firstName} ${student.lastName}</span>
                    </div>
                    <div class="field">
                        <span class="label">Date de naissance</span>
                        <span class="value">${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('fr-FR') : 'Non renseignée'}</span>
                    </div>
                    <div class="field">
                        <span class="label">Pays de naissance</span>
                        <span class="value">${student.countryOfBirth || 'Non renseigné'}</span>
                    </div>
                    <div class="field">
                        <span class="label">Adresse</span>
                        <span class="value">${student.address || 'Non renseignée'}</span>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3 class="section-title">Informations de Contact</h3>
                    <div class="field">
                        <span class="label">Adresse e-mail</span>
                        <span class="value">${student.email}</span>
                    </div>
                    <div class="field">
                        <span class="label">Téléphone</span>
                        <span class="value">${student.phone || 'Non renseigné'}</span>
                    </div>
                    <div class="field">
                        <span class="label">Numéro de référence</span>
                        <span class="value">${student.reference}</span>
                    </div>
                    <div class="field">
                        <span class="label">Statut actuel</span>
                        <span class="value">
                            <span class="status-badge status-${student.status.toLowerCase()}">${student.status}</span>
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="program-highlight">
                <div class="program-title">${student.program}</div>
                <div class="program-details">
                    ${student.specialty ? `Spécialité: ${student.specialty} • ` : ''}
                    Année d'études: ${student.studyYear}${student.studyYear === 1 ? 'ère' : 'ème'}
                    ${student.hasMBA2Diploma ? ' • Titulaire du diplôme MBA 2' : ''}
                </div>
            </div>
            
            <div class="info-section">
                <h3 class="section-title">Informations d'Inscription</h3>
                <div class="field">
                    <span class="label">Date d'inscription</span>
                    <span class="value">${new Date(student.registrationDate).toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
                <div class="field">
                    <span class="label">Année académique</span>
                    <span class="value">${student.registrationYear}-${student.registrationYear + 1}</span>
                </div>
                ${student.notes ? `
                <div class="field">
                    <span class="label">Observations</span>
                    <span class="value">${student.notes}</span>
                </div>` : ''}
            </div>
            
            <div style="margin: 40px 0; padding: 20px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 0 8px 8px 0;">
                <p style="font-style: italic; color: #854d0e; font-size: 15px;">
                    <strong>est dûment inscrit(e)</strong> dans notre établissement et suit régulièrement les cours du programme mentionné ci-dessus.
                </p>
            </div>
            
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-label">Cachet de l'Institution</div>
                </div>
                <div class="signature-box">
                    <div class="signature-line"></div>
                    <div class="signature-label">Signature du Directeur</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="institution-footer">IPEC BRUXELLES</div>
            <div class="footer-text">
                Institut Privé d'Enseignement Complémentaire<br>
                Excellence • Innovation • Formation de Qualité<br>
                Bruxelles, Belgique
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
                Ce document est généré électroniquement et constitue une attestation officielle d'inscription.
            </div>
        </div>
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