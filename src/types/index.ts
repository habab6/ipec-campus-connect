export interface Student {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  countryOfBirth: string;
  address: string;
  program: 'BBA' | 'MBA' | 'MBA Complémentaire';
  studyYear: number;
  specialty: string;
  notes: string;
  registrationDate: string;
  registrationYear: number;
  status: 'Actif' | 'Inactif' | 'Suspendu';
  hasMBA2Diploma?: boolean; // Pour MBA Complémentaire
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'En attente' | 'Payé' | 'En retard' | 'Remboursé';
  type: 'Frais de dossier' | 'Minerval' | 'Frais mensuel' | 'Matériel' | 'Examen' | 'Autre';
  description: string;
  method?: 'Espèces' | 'Carte' | 'Virement' | 'Chèque';
  invoiceNumber?: string;
  invoiceDate?: string; // Date de génération de la facture
  installments?: PaymentInstallment[]; // Pour les paiements échelonnés
}

export interface PaymentInstallment {
  id: string;
  amount: number;
  paidDate: string;
  method: 'Espèces' | 'Carte' | 'Virement' | 'Chèque';
}

export interface Document {
  id: string;
  studentId: string;
  type: 'Facture' | 'Document inscription' | 'Note de crédit' | 'Reçu';
  number: string;
  date: string;
  amount?: number;
  status: 'Brouillon' | 'Envoyé' | 'Payé';
  content: any;
}

export interface CreditNote {
  id: string;
  originalInvoiceId: string;
  studentId: string;
  amount: number;
  reason: string;
  date: string;
  number: string;
}