import { Student } from "@/types";
import { COUNTRIES } from "./countries";
import { COUNTRY_NAME_TO_CODE } from "./countryCodes";

// Prix des programmes
export const PROGRAM_PRICES = {
  'BBA': 5000,
  'MBA': 6000,
  'MBA Complémentaire': 3000
} as const;

export const REGISTRATION_FEE = 500; // Frais de dossier unique

// Durée des programmes en années
export const PROGRAM_DURATION = {
  'BBA': 3,
  'MBA': 2,
  'MBA Complémentaire': 1,
} as const;

// Fonction pour obtenir les options d'années d'étude selon le programme
export const getStudyYearOptions = (program: 'BBA' | 'MBA' | 'MBA Complémentaire' | '') => {
  if (!program) return [];
  const duration = PROGRAM_DURATION[program];
  return Array.from({ length: duration }, (_, i) => i + 1);
};

// Spécialités business
export const BUSINESS_SPECIALTIES = [
  'Management des entreprises',
  'Marketing & créativité',
  'Economie & Finance',
  'Logistique',
  'Etudes Européennes et relations internationales',
  'Informatique de gestion'
];

// Pays disponibles - utilise la liste complète
export { COUNTRIES };

// Codes pays (pour la référence)
export const COUNTRY_CODES: Record<string, string> = {
  'Belgique': 'BE',
  'France': 'FR',
  'Allemagne': 'DE',
  'Pays-Bas': 'NL',
  'Luxembourg': 'LU',
  'Suisse': 'CH',
  'Espagne': 'ES',
  'Italie': 'IT',
  'Portugal': 'PT',
  'Royaume-Uni': 'UK',
  'Autre': 'XX'
};

/**
 * Génère une référence unique pour l'étudiant
 * Format: InitialesNom + DDMMYY + /IPEC/ + AnnéeInscription + / + CodePays
 * Exemple: DJ961201/IPEC/25/BE
 */
export const generateStudentReference = (
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  countryOfBirth: string,
  registrationYear: number
): string => {
  // Récupérer les initiales (première lettre du prénom + première lettre du nom)
  const initials = `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  
  // Convertir la date de naissance au format DDMMYY
  const birthDate = new Date(dateOfBirth);
  const day = String(birthDate.getDate()).padStart(2, '0');
  const month = String(birthDate.getMonth() + 1).padStart(2, '0');
  const year = String(birthDate.getFullYear()).slice(-2);
  const birthFormatted = `${year}${month}${day}`;
  
  // Année d'inscription sur 2 chiffres
  const regYear = String(registrationYear).slice(-2);
  
  // Code pays
  const countryCode = COUNTRY_NAME_TO_CODE[countryOfBirth] || 'XX';
  
  return `${initials}${birthFormatted}/IPEC/${regYear}/${countryCode}`;
};

/**
 * Vérifie si un étudiant peut s'inscrire au MBA Complémentaire
 */
export const canEnrollMBAComplementaire = (hasMBA2Diploma: boolean): boolean => {
  return hasMBA2Diploma === true;
};