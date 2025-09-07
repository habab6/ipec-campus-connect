import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useStudents } from '@/hooks/useStudents';
import { usePayments } from '@/hooks/usePayments';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, ArrowLeft, CreditCard, Receipt, FileCheck, Eye, Euro } from "lucide-react";
import { Student, Payment, RegistrationAttestation, Invoice } from "@/types";
import { 
  generateRegistrationDocument, 
  generateInvoice, 
  generateCreditNote, 
  downloadDocument,
  generateCreditNoteNumber
} from "@/utils/documentGenerator";
import { fillRegistrationPdfWithPositions, fillInvoicePdfWithPositions, fillCreditNotePdf, downloadPdf } from "@/utils/positionPdfFiller";
import { generatePaymentSummaryPdf, downloadPaymentSummary } from "@/utils/paymentSummaryGenerator";
import { AttestationDisplay } from "@/components/AttestationDisplay";

const DocumentGeneration = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { toast } = useToast();
  const { getStudentById } = useStudents();
  const { 
    getPaymentsByStudentId, 
    getAttestationsByStudentId, 
    createAttestation, 
    getInvoicesByStudentId, 
    createInvoice,
    updatePayment 
  } = usePayments();
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [creditNoteReason, setCreditNoteReason] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showCreditNoteForm, setShowCreditNoteForm] = useState(false);
  const [attestations, setAttestations] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState<{
    isOpen: boolean;
    paymentId: string;
    amount: string;
    method: string;
    paidDate: string;
  }>({
    isOpen: false,
    paymentId: '',
    amount: '',
    method: '',
    paidDate: new Date().toISOString().split('T')[0]
  });
  const [installmentDialog, setInstallmentDialog] = useState<{
    isOpen: boolean;
    paymentId: string;
    amount: string;
    method: string;
    paidDate: string;
  }>({
    isOpen: false,
    paymentId: '',
    amount: '',
    method: '',
    paidDate: new Date().toISOString().split('T')[0]
  });
  const [manualInvoiceDialog, setManualInvoiceDialog] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false
  });

  useEffect(() => {
    console.log('DocumentGeneration useEffect triggered - studentId:', studentId);
    
    const loadStudentData = async () => {
      if (!studentId) return;
      
      try {
        console.log('Chargement des données pour l\'étudiant:', studentId);
        
        // Charger l'étudiant depuis Supabase
        const foundStudent = await getStudentById(studentId);
        console.log('Étudiant trouvé:', foundStudent);
        
        if (foundStudent) {
          setStudent(foundStudent);
          
          // Charger les paiements depuis Supabase
          const paymentsData = await getPaymentsByStudentId(studentId);
          console.log('Paiements trouvés:', paymentsData);
          setPayments(paymentsData);

          // Charger les attestations depuis Supabase
          const attestationsData = await getAttestationsByStudentId(studentId);
          console.log('Attestations trouvées:', attestationsData);
          setAttestations(attestationsData);

          // Charger les factures depuis Supabase
          const invoicesData = await getInvoicesByStudentId(studentId);
          console.log('Factures trouvées:', invoicesData);
          setInvoices(invoicesData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();

    // Configurer Supabase Realtime pour écouter les changements
    const setupRealtime = async () => {
      if (!studentId) return;
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Écouter les nouveaux paiements
      const paymentsChannel = supabase
        .channel('payments-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'payments',
            filter: `student_id=eq.${studentId}`
          },
          async (payload) => {
            console.log('Nouveau paiement détecté:', payload.new);
            // Recharger les paiements
            const updatedPayments = await getPaymentsByStudentId(studentId);
            setPayments(updatedPayments);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'payments',
            filter: `student_id=eq.${studentId}`
          },
          async (payload) => {
            console.log('Paiement mis à jour:', payload.new);
            // Recharger les paiements
            const updatedPayments = await getPaymentsByStudentId(studentId);
            setPayments(updatedPayments);
          }
        )
        .subscribe();

      // Écouter les nouvelles factures
      const invoicesChannel = supabase
        .channel('invoices-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'invoices',
            filter: `student_id=eq.${studentId}`
          },
          async (payload) => {
            console.log('Nouvelle facture détectée:', payload.new);
            // Recharger les factures
            const updatedInvoices = await getInvoicesByStudentId(studentId);
            setInvoices(updatedInvoices);
          }
        )
        .subscribe();

      // Écouter les nouvelles attestations
      const attestationsChannel = supabase
        .channel('attestations-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'registration_attestations',
            filter: `student_id=eq.${studentId}`
          },
          async (payload) => {
            console.log('Nouvelle attestation détectée:', payload.new);
            // Recharger les attestations
            const updatedAttestations = await getAttestationsByStudentId(studentId);
            setAttestations(updatedAttestations);
          }
        )
        .subscribe();

      // Cleanup function pour désabonner les channels
      return () => {
        supabase.removeChannel(paymentsChannel);
        supabase.removeChannel(invoicesChannel);
        supabase.removeChannel(attestationsChannel);
      };
    };

    const cleanup = setupRealtime();

    // Retourner la fonction de cleanup
    return () => {
      cleanup.then(cleanupFn => {
        if (cleanupFn) cleanupFn();
      });
    };
  }, [studentId]); // Supprimé les fonctions des dépendances pour éviter la boucle infinie

  const generateAttestationNumber = async (): Promise<string> => {
    // Use the same logic as the academic year management hook
    const { supabase } = await import('@/integrations/supabase/client');
    const { count } = await supabase
      .from('registration_attestations')
      .select('*', { count: 'exact', head: true });
    return `ATT-${String((count || 0) + 1).padStart(4, '0')}`;
  };

  const getCurrentAttestationKey = () => {
    if (!student) return null;
    return `${student.id}-${student.academicYear}-${student.studyYear}`;
  };

  const getCurrentAttestation = () => {
    return attestations.find(a => 
      a.student_id === student?.id && 
      a.academic_year === student?.academicYear && 
      a.study_year === student?.studyYear
    );
  };

  const generateRegistrationDoc = async (isDuplicate = false) => {
    if (!student) return;
    
    try {
      let attestation = getCurrentAttestation();
      
      // Si c'est une première génération, créer l'attestation dans Supabase
      if (!attestation && !isDuplicate) {
        const attestationNumber = await generateAttestationNumber();
        const newAttestationData = {
          student_id: student.id,
          number: attestationNumber,
          academic_year: student.academicYear,
          study_year: student.studyYear,
          program: student.program,
          specialty: student.specialty,
          generate_date: student.registrationDate
        };
        
        const createdAttestation = await createAttestation(newAttestationData);
        setAttestations(prev => [...prev, createdAttestation]);
        attestation = createdAttestation;
      }
      
      if (!attestation) return;
      
      const pdfBytes = await fillRegistrationPdfWithPositions(student, attestation.number);
      const filename = isDuplicate 
        ? `duplicata-attestation-${student.firstName}-${student.lastName}-${attestation.number}.pdf`
        : `attestation-inscription-${student.firstName}-${student.lastName}-${attestation.number}.pdf`;
      downloadPdf(pdfBytes, filename);
      
      toast({
        title: isDuplicate ? "Duplicata téléchargé" : "Attestation générée",
        description: isDuplicate 
          ? `Duplicata de l'attestation ${attestation.number} téléchargé.`
          : `Attestation ${attestation.number} générée avec succès.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer le document",
        variant: "destructive",
      });
    }
  };

  const generateInvoiceNumber = async (student: Student, payment: Payment): Promise<string> => {
    // Use the same logic for unique invoice numbers
    const { supabase } = await import('@/integrations/supabase/client');
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });
    
    const year = new Date().getFullYear();
    const invoiceCount = (count || 0) + 1;
    const typeCode = payment.type === 'Frais de dossier' ? 'FD' : 
                     payment.type === 'Minerval' ? 'MIN' : 'FAC';
    return `IPEC-${year}-${String(invoiceCount).padStart(4, '0')}-${typeCode}`;
  };

  const getInvoiceKey = (payment: Payment) => {
    if (!student) return null;
    // Les frais de dossier sont uniques par étudiant
    if (payment.type === 'Frais de dossier') {
      return `${student.id}-${payment.type}`;
    }
    // Les autres frais sont par année académique
    return `${student.id}-${payment.type}-${student.academicYear}-${student.studyYear}`;
  };

  const getExistingInvoice = (payment: Payment) => {
    if (payment.type === 'Frais de dossier') {
      return invoices.find(i => 
        i.student_id === student?.id && 
        i.type === payment.type
      );
    }
    
    return invoices.find(i => 
      i.student_id === student?.id && 
      i.type === payment.type &&
      i.academic_year === payment.academicYear &&
      i.study_year === payment.studyYear
    );
  };

  const generateInvoiceDoc = async (payment: Payment, isDuplicate = false) => {
    if (!student) return;
    
    try {
      let invoice = getExistingInvoice(payment);
      
      // Si c'est une première génération, créer la facture dans Supabase
      if (!invoice && !isDuplicate) {
        const invoiceNumber = await generateInvoiceNumber(student, payment);
        const newInvoiceData = {
          student_id: student.id,
          payment_id: payment.id,
          number: invoiceNumber,
          amount: payment.amount,
          type: payment.type,
          academic_year: payment.academicYear,
          study_year: payment.studyYear,
          generate_date: student.registrationDate
        };
        
        const createdInvoice = await createInvoice(newInvoiceData);
        setInvoices(prev => [...prev, createdInvoice]);
        invoice = createdInvoice;
      }
      
      if (!invoice) return;
      
      const invoiceNumber = invoice.number || 'SANS-NUMERO';
      const pdfBytes = await fillInvoicePdfWithPositions(student, payment, invoiceNumber);
      const filename = isDuplicate 
        ? `duplicata-facture-${student.firstName}-${student.lastName}-${invoiceNumber}.pdf`
        : `facture-${student.firstName}-${student.lastName}-${invoiceNumber}.pdf`;
      downloadPdf(pdfBytes, filename);
      
      toast({
        title: isDuplicate ? "Duplicata téléchargé" : "Facture générée",
        description: isDuplicate 
          ? `Duplicata de la facture ${invoiceNumber} téléchargé.`
          : `Facture ${invoiceNumber} générée pour ${payment.amount}€.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer la facture",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = async () => {
    if (!paymentDialog.amount || !paymentDialog.method) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payment = payments.find(p => p.id === paymentDialog.paymentId);
      if (!payment) return;

      await updatePayment(paymentDialog.paymentId, {
        status: 'Payé' as const,
        paidDate: paymentDialog.paidDate,
        method: paymentDialog.method as "Espèces" | "Virement"
      });

      // Recharger les données
      if (studentId) {
        const updatedPayments = await getPaymentsByStudentId(studentId);
        setPayments(updatedPayments);
      }

      setPaymentDialog({
        isOpen: false,
        paymentId: '',
        amount: '',
        method: '',
        paidDate: new Date().toISOString().split('T')[0]
      });

      toast({
        title: "Paiement enregistré",
        description: "Paiement enregistré avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement.",
        variant: "destructive",
      });
    }
  };

  const addInstallment = async () => {
    if (!installmentDialog.amount || !installmentDialog.method) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    // Validation : vérifier que le montant ne dépasse pas ce qui reste à payer
    const amount = parseFloat(installmentDialog.amount);
    const payment = payments.find(p => p.id === installmentDialog.paymentId);
    if (!payment) return;

    const currentInstallments = payment.installments || [];
    const totalAlreadyPaid = currentInstallments.reduce((sum, inst) => sum + inst.amount, 0);
    const remainingAmount = payment.amount - totalAlreadyPaid;

    if (amount > remainingAmount) {
      toast({
        title: "Montant trop élevé",
        description: `Le montant saisi (${amount}€) dépasse ce qui reste à payer (${remainingAmount}€).`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Ajouter le paiement
      await supabase.from('payment_installments').insert({
        payment_id: installmentDialog.paymentId,
        amount: parseFloat(installmentDialog.amount),
        paid_date: installmentDialog.paidDate,
        method: installmentDialog.method
      });

      // Vérifier si le paiement est maintenant complet
      const newTotalPaid = totalAlreadyPaid + amount;
      const isFullyPaid = newTotalPaid >= payment.amount;

      // Mettre à jour le statut du paiement si entièrement payé
      if (isFullyPaid) {
        await updatePayment(installmentDialog.paymentId, {
          status: 'Payé' as const,
          paidDate: installmentDialog.paidDate,
          method: installmentDialog.method as "Espèces" | "Virement"
        });
      }

      // Recharger les données
      if (studentId) {
        const updatedPayments = await getPaymentsByStudentId(studentId);
        setPayments(updatedPayments);
      }

      setInstallmentDialog({
        isOpen: false,
        paymentId: '',
        amount: '',
        method: '',
        paidDate: new Date().toISOString().split('T')[0]
      });

      toast({
         title: "Paiement ajouté",
         description: isFullyPaid 
           ? `Paiement de ${amount}€ enregistré. Le paiement est maintenant soldé !`
           : `Paiement de ${amount}€ enregistré avec succès.`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'acompte:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le paiement.",
        variant: "destructive",
      });
    }
  };

  const generateCreditNoteDoc = async () => {
    if (!student || !selectedPayment || !creditNoteReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un paiement et saisir un motif de remboursement.",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdfBytes = await fillCreditNotePdf(student, selectedPayment, creditNoteReason);
      const filename = `avoir-${selectedPayment.id}-${student.firstName}-${student.lastName}.pdf`;
      downloadPdf(pdfBytes, filename);

      // Mettre à jour le statut du paiement dans Supabase
      const updatedPayment = { ...selectedPayment, status: 'Remboursé' as Payment['status'] };
      await updatePayment(selectedPayment.id, { status: 'Remboursé' });
      
      const updatedPayments = payments.map(p => 
        p.id === selectedPayment.id ? updatedPayment : p
      );
      setPayments(updatedPayments);
      
      toast({
        title: "Note de crédit générée",
        description: "La note de crédit a été téléchargée et le paiement marqué comme remboursé.",
      });

      // Reset form
      setCreditNoteReason("");
      setSelectedPayment(null);
      setShowCreditNoteForm(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer l'avoir",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Chargement...</h1>
          <p className="text-muted-foreground mb-4">Chargement des données de l'étudiant...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Étudiant non trouvé</h1>
          <p className="text-muted-foreground mb-4">L'étudiant que vous cherchez n'existe pas.</p>
          <Link to="/students">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Link to="/students">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste des étudiants
            </Button>
          </Link>
        </div>

        <Card className="shadow-medium mb-8">
          <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
            <CardTitle className="text-2xl flex items-center">
              <FileText className="mr-2 h-6 w-6" />
              Documents pour {student.firstName} {student.lastName}
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Générer et télécharger les documents administratifs
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {/* Student Info */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Informations de l'étudiant</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p><strong>Programme:</strong> {student.program}</p>
                <p><strong>Spécialité:</strong> {student.specialty}</p>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Statut:</strong> {student.status}</p>
              </div>
            </div>

            {/* Registration Document */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileCheck className="mr-2 h-5 w-5 text-primary" />
                  Attestations d'inscription
                </CardTitle>
                <CardDescription>
                  Attestations officielles d'inscription par année académique
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Attestation année courante */}
                  {(() => {
                    const attestation = getCurrentAttestation();
                    const hasAttestation = !!attestation;
                    
                    return (
                      <div className="border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        {/* Header avec nom de l'attestation */}
                        <div className="px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 border-b border-slate-300">
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold text-white">
                              {hasAttestation ? `Attestation ${attestation.number}` : 'Nouvelle Attestation'}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                {student?.program}
                              </span>
                              {student?.specialty && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                                  {student?.specialty}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4">
                          {/* Informations dans une grille avec boutons d'action */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Programme</label>
                              <p className="text-lg font-semibold text-foreground">{student?.program}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Année d'étude</label>
                              <p className="text-sm font-medium text-foreground">
                                {student?.studyYear === 1 ? '1ère année' : `${student?.studyYear}ème année`}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Année académique</label>
                              <p className="text-sm font-medium text-foreground">
                                {student?.academicYear}
                              </p>
                            </div>
                          </div>

                          {/* Boutons d'action */}
                          <div className="flex items-center gap-2 justify-end mb-4">
                            {hasAttestation ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generateRegistrationDoc(true)}
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Télécharger PDF
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => generateRegistrationDoc(false)}
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Générer l'attestation
                              </Button>
                            )}
                          </div>

                          {/* Informations de génération */}
                          {attestation && (
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <div className="text-xs text-muted-foreground">
                                <strong>Date de génération:</strong> {new Date(attestation.generate_date).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Attestations des années précédentes */}
                  {attestations
                    .filter(a => !(a.academic_year === student?.academicYear && a.study_year === student?.studyYear))
                    .sort((a, b) => new Date(b.created_at || b.generate_date).getTime() - new Date(a.created_at || a.generate_date).getTime())
                    .map((attestation) => (
                      <div key={attestation.id} className="border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        {/* Header avec nom de l'attestation */}
                        <div className="px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 border-b border-slate-300">
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold text-white">
                              Attestation {attestation.number}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                {attestation.program}
                              </span>
                              {attestation.specialty && (
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                                  {attestation.specialty}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Content Section */}
                        <div className="p-4">
                          {/* Informations dans une grille avec boutons d'action */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Programme</label>
                              <p className="text-lg font-semibold text-foreground">{attestation.program}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Année d'étude</label>
                              <p className="text-sm font-medium text-foreground">
                                {attestation.study_year === 1 ? '1ère année' : `${attestation.study_year}ème année`}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Année académique</label>
                              <p className="text-sm font-medium text-foreground">
                                {attestation.academic_year}
                              </p>
                            </div>
                          </div>

                          {/* Boutons d'action */}
                          <div className="flex items-center gap-2 justify-end mb-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const historicalStudent = {
                                    ...student!,
                                    firstName: attestation.student_full_name?.split(' ')[0] || student!.firstName,
                                    lastName: attestation.student_full_name?.split(' ').slice(1).join(' ') || student!.lastName,
                                    reference: attestation.student_reference || student!.reference,
                                    program: attestation.program as Student['program'],
                                    studyYear: attestation.study_year,
                                    academicYear: attestation.academic_year,
                                    specialty: attestation.specialty,
                                    nationality: attestation.student_nationality || student!.nationality,
                                    dateOfBirth: attestation.student_birth_date || student!.dateOfBirth,
                                    cityOfBirth: attestation.student_birth_city || student!.cityOfBirth,
                                    countryOfBirth: attestation.student_birth_country || student!.countryOfBirth,
                                    registrationDate: attestation.registration_date || student!.registrationDate
                                  };
                                  
                                  const pdfBytes = await fillRegistrationPdfWithPositions(historicalStudent, attestation.number);
                                  const studentName = attestation.student_full_name || `${student?.firstName}-${student?.lastName}`;
                                  const filename = `attestation-${studentName.replace(' ', '-')}-${attestation.number}.pdf`;
                                  downloadPdf(pdfBytes, filename);
                                  
                                  toast({
                                    title: "PDF téléchargé",
                                    description: `Attestation ${attestation.number} téléchargée.`,
                                  });
                                } catch (error) {
                                  console.error('Erreur lors du téléchargement:', error);
                                  toast({
                                    title: "Erreur",
                                    description: "Erreur lors du téléchargement du PDF",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Télécharger PDF
                            </Button>
                          </div>

                          {/* Informations de génération */}
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <div className="text-xs text-muted-foreground">
                              <strong>Date de génération:</strong> {new Date(attestation.generate_date).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Receipt className="mr-2 h-5 w-5 text-secondary" />
                  Factures
                </CardTitle>
                <CardDescription>
                  Générer les factures pour les paiements de l'étudiant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setManualInvoiceDialog({ isOpen: true })}
                    >
                      <Receipt className="mr-2 h-4 w-4" />
                      Facture manuelle
                    </Button>
                  </div>
                  
                   {payments.length === 0 ? (
                     <div className="text-center py-6 space-y-4">
                       <p className="text-muted-foreground">
                         Aucun paiement enregistré pour cet étudiant.
                       </p>
                       <Button 
                         onClick={async () => {
                           // Rediriger vers la page des paiements pour créer les paiements
                           window.location.href = `/payments?student=${studentId}`;
                         }}
                         className="flex items-center gap-2"
                       >
                         <CreditCard className="h-4 w-4" />
                         Créer les paiements et générer les factures
                       </Button>
                     </div>
                   ) : (
                    <div className="space-y-3">
                      {payments.map((payment) => {
                        const existingInvoice = getExistingInvoice(payment);
                        const hasInvoice = !!existingInvoice;
                        const isFullyPaid = payment.status === 'Payé';
                        const hasInstallments = payment.installments && payment.installments.length > 0;
                        const totalPaid = hasInstallments 
                          ? payment.installments.reduce((sum, inst) => sum + inst.amount, 0)
                          : (isFullyPaid ? payment.amount : 0);
                        const remainingAmount = payment.amount - totalPaid;
                        
                        return (
                           <div key={payment.id} className="border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                             {/* Header avec nom de la facture */}
                             <div className="px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 border-b border-slate-300">
                                <div className="flex items-center justify-between">
                                  <div className="text-lg font-semibold text-white">
                                    {existingInvoice ? `Facture ${existingInvoice.number}` : `Facture ${payment.type}`}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      payment.type === 'Frais de dossier' 
                                        ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                    }`}>
                                      {payment.type}
                                    </span>
                                    {!existingInvoice ? (
                                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white">
                                        Non généré
                                      </span>
                                    ) : (
                                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${ 
                                        payment.status === 'Payé' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                        payment.status === 'En attente' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                        payment.status === 'En retard' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                        'bg-sky-100 text-sky-700 border border-sky-200'
                                      }`}>
                                        {payment.status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                             </div>

                             {/* Content Section */}
                             <div className="p-4">
                               {/* Informations dans une grille avec boutons d'action */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Montant</label>
                                  <p className="text-lg font-semibold text-foreground">{payment.amount}€</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Échéance</label>
                                  <p className="text-sm font-medium text-foreground">
                                    {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Année académique</label>
                                  <p className="text-sm font-medium text-foreground">
                                    {payment.academicYear} - {payment.studyYear === 1 ? '1ère année' : `${payment.studyYear}ème année`}
                                  </p>
                                </div>
                              </div>

                                {/* Boutons d'action */}
                                <div className="flex items-center gap-2 justify-end mb-4">
                                  {hasInvoice ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => generateInvoiceDoc(payment, true)}
                                      className="flex items-center gap-2"
                                    >
                                      <Download className="h-4 w-4" />
                                      Télécharger PDF
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => generateInvoiceDoc(payment, false)}
                                      className="flex items-center gap-2"
                                    >
                                      <Receipt className="h-4 w-4" />
                                      Générer facture
                                    </Button>
                                  )}
                                 
                                 {/* Only show other actions if invoice exists */}
                                 {hasInvoice && (
                                   <>
                                     <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => {
                                         const summaryContent = generatePaymentSummaryPdf(student, [payment]);
                                         const filename = `recapitulatif-${payment.type.toLowerCase().replace(/\s+/g, '-')}-${student.firstName}-${student.lastName}-${new Date().toISOString().split('T')[0]}.html`;
                                         downloadPaymentSummary(summaryContent, filename);
                                         toast({
                                           title: "Récapitulatif généré",
                                           description: "Le récapitulatif a été téléchargé.",
                                         });
                                       }}
                                       className="flex items-center gap-2"
                                     >
                                       <Eye className="h-4 w-4" />
                                       Récapitulatif
                                     </Button>
                                     
                                     {/* Only show add payment button if not fully paid */}
                                     {!isFullyPaid && (
                                       <Button
                                         size="sm"
                                         onClick={() => {
                                           if (payment.type === 'Frais de dossier') {
                                             setPaymentDialog({
                                               isOpen: true,
                                               paymentId: payment.id,
                                               amount: payment.amount.toString(),
                                               method: '',
                                               paidDate: new Date().toISOString().split('T')[0]
                                             });
                                           } else {
                                             setInstallmentDialog({
                                               isOpen: true,
                                               paymentId: payment.id,
                                               amount: '',
                                               method: '',
                                               paidDate: new Date().toISOString().split('T')[0]
                                             });
                                           }
                                         }}
                                         className="flex items-center gap-2"
                                       >
                                         <Euro className="h-4 w-4" />
                                         + Paiement
                                       </Button>
                                     )}
                                   </>
                                 )}
                               </div>

                               {/* Avancement des paiements pour paiements partiels - style professionnel - seulement si facture générée */}
                               {hasInvoice && hasInstallments && !isFullyPaid && (
                                 <div className="mb-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-md shadow-sm">
                                   <div className="text-sm font-medium text-amber-800">
                                     Payé: {totalPaid}€ - Reste: {remainingAmount}€
                                   </div>
                                 </div>
                               )}

                              {/* Encadré professionnel avec référence et date de génération */}
                              {existingInvoice && (
                                <div className="p-3 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-md shadow-sm">
                                  <div className="text-sm text-slate-700 flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-slate-600" />
                                    <span className="font-medium">Facture : {existingInvoice.number}</span>
                                    <span className="mx-2 text-slate-400">•</span>
                                    <span>Générée le {new Date(existingInvoice.generate_date).toLocaleDateString("fr-FR")}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          onClick={() => {
                            const summaryContent = generatePaymentSummaryPdf(student, payments);
                            const filename = `recapitulatif-paiements-${student.firstName}-${student.lastName}-${new Date().toISOString().split('T')[0]}.html`;
                            downloadPaymentSummary(summaryContent, filename);
                            toast({
                              title: "Récapitulatif généré",
                              description: "Le récapitulatif des paiements a été téléchargé.",
                            });
                          }}
                          variant="secondary"
                          className="w-full"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Générer le récapitulatif des paiements
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Credit Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-destructive" />
                  Notes de crédit (Avoirs)
                </CardTitle>
                <CardDescription>
                  Générer des avoirs pour remboursements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showCreditNoteForm ? (
                  <Button 
                    onClick={() => setShowCreditNoteForm(true)}
                    variant="outline"
                    className="w-full"
                    disabled={payments.filter(p => p.status === 'Payé').length === 0}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Créer une note de crédit
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="payment">Paiement à rembourser</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        onChange={(e) => {
                          const payment = payments.find(p => p.id === e.target.value);
                          setSelectedPayment(payment || null);
                        }}
                      >
                        <option value="">Sélectionnez un paiement</option>
                        {payments.filter(p => p.status === 'Payé').map((payment) => (
                          <option key={payment.id} value={payment.id}>
                            {payment.description} - {payment.amount}€ ({payment.invoiceNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="reason">Motif du remboursement</Label>
                      <Textarea
                        id="reason"
                        value={creditNoteReason}
                        onChange={(e) => setCreditNoteReason(e.target.value)}
                        placeholder="Décrivez la raison du remboursement..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={generateCreditNoteDoc}
                        className="flex-1"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Générer la note de crédit
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setShowCreditNoteForm(false);
                          setCreditNoteReason("");
                          setSelectedPayment(null);
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}

                {payments.filter(p => p.status === 'Payé').length === 0 && (
                  <p className="text-muted-foreground text-sm mt-2">
                    Aucun paiement payé disponible pour remboursement.
                  </p>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Dialog pour paiement complet (frais de dossier) */}
        <Dialog open={paymentDialog.isOpen} onOpenChange={(open) => setPaymentDialog(prev => ({ ...prev, isOpen: open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer le paiement</DialogTitle>
              <DialogDescription>
                Marquez ce paiement comme payé et enregistrez les détails
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="paidAmount">Montant payé (€)</Label>
                {(() => {
                  const payment = payments.find(p => p.id === paymentDialog.paymentId);
                  if (!payment) return null;
                  
                  return (
                    <>
                      <Input
                        id="paidAmount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={payment.amount}
                        value={paymentDialog.amount}
                        onChange={(e) => setPaymentDialog(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Montant à payer : {payment.amount}€
                      </p>
                    </>
                  );
                })()}
              </div>
              <div>
                <Label htmlFor="paidDate">Date de paiement</Label>
                <Input
                  id="paidDate"
                  type="date"
                  value={paymentDialog.paidDate}
                  onChange={(e) => setPaymentDialog(prev => ({ ...prev, paidDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="method">Moyen de paiement</Label>
                <Select onValueChange={(value) => setPaymentDialog(prev => ({ ...prev, method: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le moyen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Espèces">Espèces</SelectItem>
                    <SelectItem value="Virement">Virement bancaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentDialog(prev => ({ ...prev, isOpen: false }))}>
                Annuler
              </Button>
              <Button onClick={handleMarkAsPaid}>
                Paiement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog pour paiement minerval */}
        <Dialog open={installmentDialog.isOpen} onOpenChange={(open) => setInstallmentDialog(prev => ({ ...prev, isOpen: open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Paiement</DialogTitle>
              <DialogDescription>
                Enregistrez un paiement pour le minerval
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="installmentAmount">Montant du paiement (€)</Label>
                {(() => {
                  const payment = payments.find(p => p.id === installmentDialog.paymentId);
                  if (!payment) return null;
                  
                  const currentInstallments = payment.installments || [];
                  const totalAlreadyPaid = currentInstallments.reduce((sum, inst) => sum + inst.amount, 0);
                  const remainingAmount = payment.amount - totalAlreadyPaid;
                  
                  return (
                    <>
                      <Input
                        id="installmentAmount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={remainingAmount}
                        value={installmentDialog.amount}
                        onChange={(e) => setInstallmentDialog(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Montant maximum : {remainingAmount}€ (reste à payer)
                      </p>
                    </>
                  );
                })()}
              </div>
              <div>
                <Label htmlFor="installmentDate">Date de paiement</Label>
                <Input
                  id="installmentDate"
                  type="date"
                  value={installmentDialog.paidDate}
                  onChange={(e) => setInstallmentDialog(prev => ({ ...prev, paidDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="installmentMethod">Moyen de paiement</Label>
                <Select onValueChange={(value) => setInstallmentDialog(prev => ({ ...prev, method: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le moyen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Espèces">Espèces</SelectItem>
                    <SelectItem value="Virement">Virement bancaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInstallmentDialog(prev => ({ ...prev, isOpen: false }))}>
                Annuler
              </Button>
              <Button onClick={addInstallment}>
                Paiement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DocumentGeneration;