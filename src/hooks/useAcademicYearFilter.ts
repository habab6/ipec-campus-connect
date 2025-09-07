import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAcademicYearFilter() {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [academicYears, setAcademicYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchAcademicYears = async () => {
      // Récupérer les années académiques réellement utilisées par les étudiants
      const { data: studentYears } = await supabase
        .from('students')
        .select('academic_year')
        .not('academic_year', 'is', null);
      
      const { data: paymentYears } = await supabase
        .from('payments')
        .select('academic_year')
        .not('academic_year', 'is', null);
      
      // Combiner et dédupliquer les années
      const allYears = new Set<string>();
      studentYears?.forEach(item => allYears.add(item.academic_year));
      paymentYears?.forEach(item => allYears.add(item.academic_year));
      
      setAcademicYears(Array.from(allYears).sort().reverse());
    };

    fetchAcademicYears();
  }, []);

  return {
    selectedYear,
    setSelectedYear,
    academicYears
  };
}