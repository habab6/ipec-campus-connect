import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Student, DbStudent } from '@/types';
import { dbStudentToStudent, studentToDbStudent } from '@/utils/dataTransforms';
import { createStudentAttestations } from '@/utils/attestationGenerator';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const students = (data as DbStudent[] || []).map(dbStudentToStudent);
      setStudents(students);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des étudiants');
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      console.log('Création étudiant avec données:', studentData);
      const dbStudentData = studentToDbStudent(studentData);
      console.log('Données transformées pour DB:', dbStudentData);
      
      const { data, error } = await supabase
        .from('students')
        .insert([dbStudentData])
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase lors de la création:', error);
        throw error;
      }
      
      console.log('Étudiant créé dans Supabase:', data);
      const createdStudent = dbStudentToStudent(data as DbStudent);
      
      // Créer automatiquement les deux attestations
      try {
        await createStudentAttestations(createdStudent);
        console.log('✅ Attestations automatiques créées');
      } catch (attestationError) {
        console.error('⚠️ Erreur création attestations (étudiant créé):', attestationError);
        // Ne pas faire échouer la création de l'étudiant si les attestations échouent
      }
      
      await fetchStudents(); // Refresh list
      return createdStudent;
    } catch (err) {
      console.error('Erreur complète:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création de l\'étudiant');
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      // Convert camelCase updates to snake_case
      const dbUpdates: Partial<DbStudent> = {};
      Object.entries(updates).forEach(([key, value]) => {
        switch (key) {
          case 'firstName': dbUpdates.first_name = value as string; break;
          case 'lastName': dbUpdates.last_name = value as string; break;
          case 'dateOfBirth': dbUpdates.date_of_birth = value as string; break;
          case 'cityOfBirth': dbUpdates.city_of_birth = value as string; break;
          case 'countryOfBirth': dbUpdates.country_of_birth = value as string; break;
          case 'identityNumber': dbUpdates.identity_number = value as string; break;
          case 'studyYear': dbUpdates.study_year = value as number; break;
          case 'academicYear': dbUpdates.academic_year = value as string; break;
          case 'registrationDate': dbUpdates.registration_date = value as string; break;
          case 'registrationYear': dbUpdates.registration_year = value as number; break;
          case 'hasMBA2Diploma': dbUpdates.has_mba2_diploma = value as boolean; break;
          default: (dbUpdates as any)[key] = value;
        }
      });

      const { data, error } = await supabase
        .from('students')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchStudents(); // Refresh list
      return dbStudentToStudent(data as DbStudent);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'étudiant');
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchStudents(); // Refresh list
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'étudiant');
    }
  };

  const getStudentById = async (id: string): Promise<Student | null> => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? dbStudentToStudent(data as DbStudent) : null;
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'étudiant:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentById
  };
}