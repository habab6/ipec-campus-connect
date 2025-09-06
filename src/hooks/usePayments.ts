import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Payment } from '@/types';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convertir les données de la DB vers le format frontend
      const frontendPayments: Payment[] = (data || []).map((p: any) => ({
        id: p.id,
        studentId: p.student_id,
        amount: p.amount,
        dueDate: p.due_date,
        paidDate: p.paid_date,
        status: p.status,
        type: p.type,
        description: p.description,
        method: p.method,
        invoiceNumber: p.invoice_number,
        invoiceDate: p.invoice_date,
        academicYear: p.academic_year,
        studyYear: p.study_year
      }));
      setPayments(frontendPayments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (paymentData: Omit<Payment, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          student_id: paymentData.studentId,
          amount: paymentData.amount,
          due_date: paymentData.dueDate,
          paid_date: paymentData.paidDate,
          status: paymentData.status,
          type: paymentData.type,
          description: paymentData.description,
          method: paymentData.method,
          invoice_number: paymentData.invoiceNumber,
          invoice_date: paymentData.invoiceDate,
          academic_year: paymentData.academicYear,
          study_year: paymentData.studyYear
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchPayments();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création du paiement');
    }
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    try {
      const dbUpdates: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        switch (key) {
          case 'studentId': dbUpdates.student_id = value; break;
          case 'dueDate': dbUpdates.due_date = value; break;
          case 'paidDate': dbUpdates.paid_date = value; break;
          case 'invoiceNumber': dbUpdates.invoice_number = value; break;
          case 'invoiceDate': dbUpdates.invoice_date = value; break;
          case 'academicYear': dbUpdates.academic_year = value; break;
          case 'studyYear': dbUpdates.study_year = value; break;
          default: (dbUpdates as any)[key] = value;
        }
      });

      const { data, error } = await supabase
        .from('payments')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchPayments();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du paiement');
    }
  };

  const getPaymentsByStudentId = async (studentId: string): Promise<Payment[]> => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;
      
      // Convertir les données de la DB vers le format frontend
      const frontendPayments: Payment[] = (data || []).map((p: any) => ({
        id: p.id,
        studentId: p.student_id,
        amount: p.amount,
        dueDate: p.due_date,
        paidDate: p.paid_date,
        status: p.status,
        type: p.type,
        description: p.description,
        method: p.method,
        invoiceNumber: p.invoice_number,
        invoiceDate: p.invoice_date,
        academicYear: p.academic_year,
        studyYear: p.study_year
      }));
      return frontendPayments;
    } catch (err) {
      console.error('Erreur lors de la récupération des paiements:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    updatePayment,
    getPaymentsByStudentId
  };
}