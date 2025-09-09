import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Student } from '@/types';

export function useAcademicYearManagement() {
  const [loading, setLoading] = useState(false);

  const getCurrentAcademicYear = async () => {
    const { data } = await supabase
      .from('academic_years')
      .select('year')
      .eq('is_current', true)
      .single();
    
    if (data?.year) {
      return data.year;
    }
    
    // If no current academic year is set, create one based on current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11
    
    // Academic year starts in September (month 8)
    let academicYear;
    if (currentMonth >= 8) { // September to December
      academicYear = `${currentYear}-${currentYear + 1}`;
    } else { // January to August
      academicYear = `${currentYear - 1}-${currentYear}`;
    }
    
    return academicYear;
  };

  const getNextAcademicYear = (currentYear: string) => {
    const [startYear] = currentYear.split('-');
    const nextStartYear = parseInt(startYear) + 1;
    return `${nextStartYear}-${nextStartYear + 1}`;
  };

  const promoteToNextYear = async (studentId: string) => {
    try {
      setLoading(true);
      
      // Get current student data
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // Utiliser l'année académique actuelle de l'étudiant comme base
      const nextAcademicYear = getNextAcademicYear(student.academic_year);
      
      let nextStudyYear = student.study_year + 1;
      let nextProgram = student.program;

      // Logique de progression selon le programme actuel
      if (student.program === 'BBA') {
        if (student.study_year === 3) {
          // BBA3 → MBA1
          nextProgram = 'MBA';
          nextStudyYear = 1;
        }
      } else if (student.program === 'MBA') {
        if (student.study_year === 2) {
          // MBA2 → MBA Complémentaire 1
          nextProgram = 'MBA Complémentaire';
          nextStudyYear = 1;
        }
      }
      // MBA Complémentaire reste en année 1 (pas de progression possible)

      // Update student academic history - mark current year as passed
      await supabase
        .from('student_academic_history')
        .insert({
          student_id: studentId,
          academic_year: student.academic_year,
          study_year: student.study_year,
          program: student.program,
          specialty: student.specialty,
          status: 'Réussi',
          passed_to_next_year: true
        });

      // Update student to next year/program
      const { error: updateError } = await supabase
        .from('students')
        .update({
          study_year: nextStudyYear,
          academic_year: nextAcademicYear,
          program: nextProgram
        })
        .eq('id', studentId);

      if (updateError) throw updateError;

      // Create new academic history entry for new year
      await supabase
        .from('student_academic_history')
        .insert({
          student_id: studentId,
          academic_year: nextAcademicYear,
          study_year: nextStudyYear,
          program: nextProgram,
          specialty: student.specialty,
          status: 'En cours',
          passed_to_next_year: false
        });

      // Generate new minerval payment for next year
      await generateMinervalPayment(studentId, nextAcademicYear, nextStudyYear, nextProgram);

      // Generate new registration attestation
      await generateRegistrationAttestation(studentId, nextAcademicYear, nextStudyYear, nextProgram, student.specialty);

      return { success: true };
    } catch (error) {
      console.error('Erreur lors du passage à l\'année supérieure:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const archiveStudent = async (studentId: string, reason: string = 'Abandon d\'études') => {
    try {
      console.log('Début archivage étudiant:', studentId);
      setLoading(true);
      
      // Get current student data
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) {
        console.error('Erreur récupération étudiant:', studentError);
        throw studentError;
      }

      console.log('Données étudiant récupérées:', student);

      // Update student academic history - mark current year as archived
      console.log('Insertion historique académique...');
      const { error: historyError } = await supabase
        .from('student_academic_history')
        .insert({
          student_id: studentId,
          academic_year: student.academic_year,
          study_year: student.study_year,
          program: student.program,
          specialty: student.specialty,
          status: reason,
          passed_to_next_year: false
        });

      if (historyError) {
        console.error('Erreur insertion historique:', historyError);
        throw historyError;
      }

      // Update student status to archived
      console.log('Mise à jour statut étudiant...');
      const { error: updateError } = await supabase
        .from('students')
        .update({
          status: 'Archivé'
        })
        .eq('id', studentId);

      if (updateError) {
        console.error('Erreur mise à jour statut:', updateError);
        throw updateError;
      }

      console.log('Archivage réussi');

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'archivage:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const repeatYear = async (studentId: string) => {
    try {
      setLoading(true);
      
      // Get current student data
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      const currentAcademicYear = await getCurrentAcademicYear();
      const nextAcademicYear = getNextAcademicYear(currentAcademicYear);

      // Update student academic history - mark current year as repeated
      await supabase
        .from('student_academic_history')
        .insert({
          student_id: studentId,
          academic_year: student.academic_year,
          study_year: student.study_year,
          program: student.program,
          specialty: student.specialty,
          status: 'Redoublant',
          passed_to_next_year: false
        });

      // Update student academic year but keep same study year
      const { error: updateError } = await supabase
        .from('students')
        .update({
          academic_year: nextAcademicYear
        })
        .eq('id', studentId);

      if (updateError) throw updateError;

      // Create new academic history entry for repeated year
      await supabase
        .from('student_academic_history')
        .insert({
          student_id: studentId,
          academic_year: nextAcademicYear,
          study_year: student.study_year, // Same study year
          program: student.program,
          specialty: student.specialty,
          status: 'En cours',
          passed_to_next_year: false
        });

      // Generate new minerval payment for repeated year
      await generateMinervalPayment(studentId, nextAcademicYear, student.study_year, student.program);

      // Generate new registration attestation
      await generateRegistrationAttestation(studentId, nextAcademicYear, student.study_year, student.program, student.specialty);

      return { success: true };
    } catch (error) {
      console.error('Erreur lors du redoublement:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateMinervalPayment = async (
    studentId: string, 
    academicYear: string, 
    studyYear: number, 
    program: string
  ) => {
    // Check if payment already exists for this exact combination
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .eq('academic_year', academicYear)
      .eq('study_year', studyYear)
      .eq('type', 'Minerval')
      .single();

    // If payment already exists, don't create a duplicate
    if (existingPayment) {
      console.log('Minerval payment already exists for this year/program combination');
      return existingPayment;
    }

    // Calculate minerval amount based on program and year
    let amount = 5000; // BBA par défaut
    if (program === 'MBA') amount = 6000;
    if (program === 'MBA Complémentaire') amount = 3000;

    const { data: newPayment, error } = await supabase
      .from('payments')
      .insert({
        student_id: studentId,
        amount: amount,
        due_date: new Date(new Date().getFullYear(), 9, 30).toISOString().split('T')[0], // October 30th
        status: 'En attente',
        type: 'Minerval',
        description: `Minerval ${program} - Année ${studyYear} (${academicYear})`,
        academic_year: academicYear,
        study_year: studyYear
      })
      .select()
      .single();

    if (error) throw error;
    return newPayment;
  };

  const generateRegistrationAttestation = async (
    studentId: string,
    academicYear: string,
    studyYear: number,
    program: string,
    specialty: string
  ) => {
    // Check if attestation already exists for this exact combination
    const { data: existingAttestation } = await supabase
      .from('registration_attestations')
      .select('*')
      .eq('student_id', studentId)
      .eq('academic_year', academicYear)
      .eq('study_year', studyYear)
      .eq('program', program)
      .single();

    // If attestation already exists, don't create a duplicate
    if (existingAttestation) {
      console.log('Attestation already exists for this year/program combination');
      return existingAttestation;
    }

    // Generate unique attestation number with INSC-timestamp format
    const number = `INSC-${Date.now()}`;

    const { data: newAttestation, error } = await supabase
      .from('registration_attestations')
      .insert({
        student_id: studentId,
        number: number,
        academic_year: academicYear,
        study_year: studyYear,
        program: program,
        specialty: specialty
      })
      .select()
      .single();

    if (error) throw error;
    return newAttestation;
  };

  const getStudentAcademicHistory = async (studentId: string) => {
    const { data, error } = await supabase
      .from('student_academic_history')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  return {
    loading,
    promoteToNextYear,
    repeatYear,
    archiveStudent,
    getStudentAcademicHistory,
    getCurrentAcademicYear
  };
}
