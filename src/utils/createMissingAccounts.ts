import { supabase } from '@/integrations/supabase/client';

export const createAccountForExistingStudent = async (studentReference: string) => {
  try {
    // Récupérer les données de l'étudiant
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('reference', studentReference)
      .single();

    if (studentError || !student) {
      throw new Error('Étudiant non trouvé');
    }

    // Vérifier si un compte existe déjà
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('student_reference', studentReference)
      .maybeSingle();

    if (existingProfile) {
      console.log('Un compte existe déjà pour cet étudiant');
      return { success: true, message: 'Compte déjà existant' };
    }

    // Créer le compte via la fonction Edge
    const { data, error } = await supabase.functions.invoke('create-student-account', {
      body: {
        studentId: student.id,
        email: student.email,
        reference: student.reference,
        firstName: student.first_name,
        lastName: student.last_name
      }
    });

    if (error) {
      console.error('Erreur lors de l\'appel de la fonction Edge:', error);
      throw error;
    }

    if (!data.success) {
      console.error('Erreur retournée par la fonction:', data.error);
      throw new Error(data.error);
    }

    console.log('Compte créé avec succès pour l\'étudiant:', studentReference);
    return data;

  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    throw error;
  }
};

// Fonction pour créer tous les comptes manquants
export const createAllMissingAccounts = async () => {
  try {
    // Récupérer tous les étudiants
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, reference, email, first_name, last_name');

    if (studentsError) {
      throw studentsError;
    }

    // Récupérer tous les profils existants
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('student_reference');

    if (profilesError) {
      throw profilesError;
    }

    const existingReferences = profiles?.map(p => p.student_reference) || [];
    const studentsWithoutAccounts = students?.filter(s => !existingReferences.includes(s.reference)) || [];

    console.log(`${studentsWithoutAccounts.length} étudiants sans compte trouvés`);

    const results = [];
    for (const student of studentsWithoutAccounts) {
      try {
        const result = await createAccountForExistingStudent(student.reference);
        results.push({ student: student.reference, success: true, result });
      } catch (error) {
        console.error(`Erreur pour ${student.reference}:`, error);
        results.push({ student: student.reference, success: false, error: error.message });
      }
    }

    return results;

  } catch (error) {
    console.error('Erreur lors de la création des comptes manquants:', error);
    throw error;
  }
};