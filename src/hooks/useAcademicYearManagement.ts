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
    return data?.year || '2024-2025';
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

      const currentAcademicYear = await getCurrentAcademicYear();
      const nextAcademicYear = getNextAcademicYear(currentAcademicYear);
      const nextStudyYear = student.study_year + 1;

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

      // Update student to next year
      const { error: updateError } = await supabase
        .from('students')
        .update({
          study_year: nextStudyYear,
          academic_year: nextAcademicYear
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
          program: student.program,
          specialty: student.specialty,
          status: 'En cours',
          passed_to_next_year: false
        });

      // Generate new minerval payment for next year
      await generateMinervalPayment(studentId, nextAcademicYear, nextStudyYear, student.program);

      // Generate new registration attestation
      await generateRegistrationAttestation(studentId, nextAcademicYear, nextStudyYear, student.program, student.specialty);

      return { success: true };
    } catch (error) {
      console.error('Erreur lors du passage à l\'année supérieure:', error);
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
    // Calculate minerval amount based on program and year
    let amount = 5000; // BBA par défaut
    if (program === 'MBA') amount = 6000;
    if (program === 'MBA Complémentaire') amount = 3000;

    const { error } = await supabase
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
      });

    if (error) throw error;
  };

  const generateRegistrationAttestation = async (
    studentId: string,
    academicYear: string,
    studyYear: number,
    program: string,
    specialty: string
  ) => {
    // Generate unique attestation number
    const { count } = await supabase
      .from('registration_attestations')
      .select('*', { count: 'exact', head: true });

    const number = `ATT-${String((count || 0) + 1).padStart(4, '0')}`;

    const { error } = await supabase
      .from('registration_attestations')
      .insert({
        student_id: studentId,
        number: number,
        academic_year: academicYear,
        study_year: studyYear,
        program: program,
        specialty: specialty
      });

    if (error) throw error;
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
    getStudentAcademicHistory,
    getCurrentAcademicYear
  };
}
