import { supabase } from '@/integrations/supabase/client';
import { Student } from '@/types';
import { fillRegistrationPdfWithPositions } from './positionPdfFiller';

// Générer les deux attestations lors de la création d'un étudiant
export const createStudentAttestations = async (student: Student): Promise<void> => {
  try {
    console.log('🎓 DEBUT - Création des attestations pour:', student.firstName, student.lastName);
    console.log('🎓 Student ID:', student.id);

    // 1. Créer l'attestation d'inscription
    const inscriptionNumber = `INSC-${Date.now()}`;
    const inscriptionAttestation = {
      student_id: student.id,
      number: inscriptionNumber,
      academic_year: student.academicYear,
      study_year: student.studyYear,
      generate_date: new Date().toISOString().split('T')[0],
      program: student.program,
      specialty: student.specialty,
      student_full_name: `${student.firstName} ${student.lastName}`,
      student_reference: student.reference,
      student_nationality: student.nationality,
      student_birth_city: student.cityOfBirth,
      student_birth_country: student.countryOfBirth,
      student_birth_date: student.dateOfBirth,
      registration_date: student.registrationDate,
      is_duplicate: false,
      notes: null
    };

    // 2. Créer l'attestation de préadmission
    const preadmissionNumber = `PRE-${Date.now() + 1}`;
    const preadmissionAttestation = {
      student_id: student.id,
      number: preadmissionNumber,
      academic_year: student.academicYear,
      study_year: student.studyYear,
      generate_date: new Date().toISOString().split('T')[0],
      program: student.program,
      specialty: student.specialty,
      student_full_name: `${student.firstName} ${student.lastName}`,
      student_reference: student.reference,
      student_nationality: student.nationality,
      student_birth_city: student.cityOfBirth,
      student_birth_country: student.countryOfBirth,
      student_birth_date: student.dateOfBirth,
      registration_date: student.registrationDate,
      is_duplicate: false,
      notes: 'Attestation de préadmission'
    };

    // Insérer les deux attestations en base
    console.log('📝 Insertion attestation inscription:', inscriptionAttestation);
    const { error: inscriptionError } = await supabase
      .from('registration_attestations')
      .insert([inscriptionAttestation]);

    if (inscriptionError) {
      console.error('❌ Erreur création attestation inscription:', inscriptionError);
      throw inscriptionError;
    }
    console.log('✅ Attestation inscription créée');

    console.log('📝 Insertion attestation préadmission:', preadmissionAttestation);
    const { error: preadmissionError } = await supabase
      .from('registration_attestations')
      .insert([preadmissionAttestation]);

    if (preadmissionError) {
      console.error('❌ Erreur création attestation préadmission:', preadmissionError);
      throw preadmissionError;
    }
    console.log('✅ Attestation préadmission créée');

    console.log('✅ Attestations créées avec succès');
    console.log('📋 Inscription:', inscriptionNumber);
    console.log('📋 Préadmission:', preadmissionNumber);

  } catch (error) {
    console.error('❌ Erreur lors de la création des attestations:', error);
    throw new Error('Impossible de créer les attestations automatiques');
  }
};

// Fonction pour générer le PDF de préadmission
export const generatePreadmissionPdf = async (student: Student, attestationNumber: string): Promise<Uint8Array> => {
  try {
    // Utilise le template de préadmission
    return await fillRegistrationPdfWithPositions(
      student, 
      attestationNumber, 
      '/templates/preadm-template.pdf'
    );
  } catch (error) {
    console.error('Erreur génération PDF préadmission:', error);
    throw new Error('Impossible de générer le PDF de préadmission');
  }
};