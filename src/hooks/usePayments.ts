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
        .select(`
          *,
          payment_installments (
            id,
            amount,
            paid_date,
            method
          )
        `)
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
        studyYear: p.study_year,
        installments: p.payment_installments?.map((inst: any) => ({
          id: inst.id,
          amount: inst.amount,
          paidDate: inst.paid_date,
          method: inst.method
        })) || undefined,
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
      console.log('Données de paiement à insérer:', paymentData);
      
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

      console.log('Réponse Supabase:', { data, error });

      if (error) {
        console.error('Erreur Supabase détaillée:', error);
        throw error;
      }
      
      await fetchPayments();
      return data;
    } catch (err) {
      console.error('Erreur dans createPayment:', err);
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
        .select(`
          *,
          payment_installments (
            id,
            amount,
            paid_date,
            method
          )
        `)
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
        studyYear: p.study_year,
        installments: p.payment_installments?.map((inst: any) => ({
          id: inst.id,
          amount: inst.amount,
          paidDate: inst.paid_date,
          method: inst.method
        })) || undefined,
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

  
  // Fonction pour récupérer les attestations d'un étudiant
  const getAttestationsByStudentId = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('registration_attestations')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des attestations:', error);
      return [];
    }
  };

  // Fonction pour créer une attestation
  const createAttestation = async (attestationData: any) => {
    try {
      const { data, error } = await supabase
        .from('registration_attestations')
        .insert([attestationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'attestation:', error);
      throw error;
    }
  };

  // Fonction pour récupérer les factures d'un étudiant
  const getInvoicesByStudentId = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      return [];
    }
  };

  // Fonction pour créer une facture
  const createInvoice = async (invoiceData: any) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      throw error;
    }
  };

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    updatePayment,
    getPaymentsByStudentId,
    getAttestationsByStudentId,
    createAttestation,
    getInvoicesByStudentId,
    createInvoice
  };
}