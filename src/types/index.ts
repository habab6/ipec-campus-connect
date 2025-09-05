export interface Student {
  id: string;
  reference: string;
  // Informations personnelles
  civilite: 'M.' | 'Mme' | 'Mlle' | 'Mx';
  firstName: string;
  lastName: string;
  // Informations de naissance
  dateOfBirth: string;
  cityOfBirth: string;
  countryOfBirth: string;
  nationality: string;
  // Documents d'identité
  identityNumber: string; // Numéro d'identité ou passeport
  // Contact
  phone: string;
  email: string;
  address: string;
  // Informations académiques
  program: 'BBA' | 'MBA' | 'MBA Complémentaire';
  studyYear: number;
  specialty: string;
  academicYear: string; // Ex: "2024-2025"
  // Système
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