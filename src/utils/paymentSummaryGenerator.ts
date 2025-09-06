import { Student, Payment } from "@/types";

export const generatePaymentSummaryPdf = (student: Student, payments: Payment[]): string => {
  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = payments.filter(p => p.status === 'Payé').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'En attente').reduce((sum, payment) => sum + payment.amount, 0);
  const overdueAmount = payments.filter(p => p.status === 'En retard').reduce((sum, payment) => sum + payment.amount, 0);

  const sortedPayments = [...payments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Récapitulatif des Paiements - ${student.firstName} ${student.lastName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
        }
        .student-info {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        .summary-card {
          background-color: #fff;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          padding: 15px;
          text-align: center;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #495057;
          font-size: 14px;
          text-transform: uppercase;
        }
        .summary-card .amount {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
        }
        .summary-card.paid .amount { color: #28a745; }
        .summary-card.pending .amount { color: #ffc107; }
        .summary-card.overdue .amount { color: #dc3545; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #dee2e6;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        .status {
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
          font-weight: bold;
        }
        .status.paid { background-color: #d4edda; color: #155724; }
        .status.pending { background-color: #fff3cd; color: #856404; }
        .status.overdue { background-color: #f8d7da; color: #721c24; }
        .status.refunded { background-color: #d1ecf1; color: #0c5460; }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #6c757d;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>IPEC Bruxelles</h1>
        <h2>Récapitulatif des Paiements</h2>
        <p>Document généré le ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <div class="student-info">
        <h3>Informations de l'étudiant</h3>
        <p><strong>Nom:</strong> ${student.firstName} ${student.lastName}</p>
        <p><strong>Référence:</strong> ${student.reference}</p>
        <p><strong>Programme:</strong> ${student.program} - ${student.studyYear}ème année</p>
        <p><strong>Spécialité:</strong> ${student.specialty}</p>
        <p><strong>Année académique:</strong> ${student.academicYear}</p>
        <p><strong>Email:</strong> ${student.email}</p>
      </div>

      <div class="summary">
        <div class="summary-card">
          <h3>Total à payer</h3>
          <div class="amount">${totalAmount}€</div>
        </div>
        <div class="summary-card paid">
          <h3>Montant payé</h3>
          <div class="amount">${paidAmount}€</div>
        </div>
        <div class="summary-card pending">
          <h3>En attente</h3>
          <div class="amount">${pendingAmount}€</div>
        </div>
        <div class="summary-card overdue">
          <h3>En retard</h3>
          <div class="amount">${overdueAmount}€</div>
        </div>
      </div>

      <h3>Détail des paiements</h3>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Description</th>
            <th>Montant</th>
            <th>Échéance</th>
            <th>Date de paiement</th>
            <th>Statut</th>
            <th>Méthode</th>
          </tr>
        </thead>
        <tbody>
          ${sortedPayments.map(payment => `
            <tr>
              <td>${payment.type}</td>
              <td>${payment.description}</td>
              <td>${payment.amount}€</td>
              <td>${new Date(payment.dueDate).toLocaleDateString('fr-FR')}</td>
              <td>${payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('fr-FR') : '-'}</td>
              <td>
                <span class="status ${
                  payment.status === 'Payé' ? 'paid' :
                  payment.status === 'En attente' ? 'pending' :
                  payment.status === 'En retard' ? 'overdue' :
                  'refunded'
                }">${payment.status}</span>
              </td>
              <td>${payment.method || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${payments.some(p => p.installments && p.installments.length > 0) ? `
        <h3>Détail des échéances</h3>
        ${payments.filter(p => p.installments && p.installments.length > 0).map(payment => `
          <h4>${payment.description}</h4>
          <table>
            <thead>
              <tr>
                <th>Montant</th>
                <th>Date de paiement</th>
                <th>Méthode</th>
              </tr>
            </thead>
            <tbody>
              ${payment.installments!.map(installment => `
                <tr>
                  <td>${installment.amount}€</td>
                  <td>${new Date(installment.paidDate).toLocaleDateString('fr-FR')}</td>
                  <td>${installment.method}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `).join('')}
      ` : ''}

      <div class="footer">
        <p>IPEC Bruxelles - Institut Privé d'Enseignement Commercial</p>
        <p>Ce document a été généré automatiquement le ${new Date().toLocaleString('fr-FR')}</p>
      </div>
    </body>
    </html>
  `;
};

export const downloadPaymentSummary = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};