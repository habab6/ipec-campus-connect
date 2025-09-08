import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useStudents } from '@/hooks/useStudents';
import { usePayments } from '@/hooks/usePayments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, ArrowLeft, Plus, Eye, Receipt, FileText, Euro, Printer, RefreshCcw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Student, Payment } from "@/types";
import { generateInvoice, generatePaymentSummary, downloadDocument, generateCreditNoteNumber } from "@/utils/documentGenerator";
import { fillCreditNotePdf, downloadPdf } from "@/utils/positionPdfFiller";
import { supabase } from "@/integrations/supabase/client";

const PaymentManagement = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { students } = useStudents();
  
  // Gestion des filtres spécifiques aux paiements
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("all");
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("all");
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [fiscalYears, setFiscalYears] = useState<string[]>([]);
  const [manualInvoiceDialog, setManualInvoiceDialog] = useState({ isOpen: false });
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);

  useEffect(() => {
    const fetchYears = async () => {
      // Récupérer les années académiques des paiements
      const { data: paymentYears } = await supabase
        .from('payments')
        .select('academic_year')
        .not('academic_year', 'is', null);
      
      // Récupérer les années fiscales des factures (basé sur la date de génération)
      const { data: invoiceYears } = await supabase
        .from('invoices')
        .select('generate_date')
        .not('generate_date', 'is', null);
      
      // Traiter les années académiques
      const allAcademicYears = new Set<string>();
      paymentYears?.forEach(item => allAcademicYears.add(item.academic_year));
      setAcademicYears(Array.from(allAcademicYears).sort().reverse());
      
      // Traiter les années fiscales
      const allFiscalYears = new Set<string>();
      invoiceYears?.forEach(item => {
        const year = new Date(item.generate_date).getFullYear().toString();
        allFiscalYears.add(year);
      });
      setFiscalYears(Array.from(allFiscalYears).sort().reverse());
    };

    fetchYears();
  }, []);

  const { 
    payments, 
    createPayment, 
    updatePayment, 
    fetchPayments,
    getInvoicesByStudentId,
    createInvoice,
    getCreditNotesByStudentId,
    createCreditNote
  } = usePayments();
   
   // State pour la modale de note de crédit
   const [creditNoteDialog, setCreditNoteDialog] = useState({
     isOpen: false,
     paymentId: '',
     reason: '',
     amount: ''
   });
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [newPayment, setNewPayment] = useState({
    studentId: "",
    amount: "",
    dueDate: "",
    type: "",
    description: "",
    method: "",
    paidDate: "",
    paidMethod: ""
  });

  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);

  // État pour la modale de paiement
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

  // État pour la modale d'ajout d'acompte
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

  // Fonction pour récupérer la facture existante
  useEffect(() => {
    const checkExistingInvoices = async () => {
      for (const payment of payments) {
        try {
          const invoices = await getInvoicesByStudentId(payment.studentId);
          const existingInvoice = invoices.find(inv => inv.payment_id === payment.id);
          if (!existingInvoice) {
            console.log(`Aucune facture trouvée pour le paiement ${payment.id}`);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification des factures:', error);
        }
      }
    };

    if (payments.length > 0) {
      checkExistingInvoices();
    }
  }, [payments, getInvoicesByStudentId]);

  // Filtre de redirection basé sur l'étudiant sélectionné
  useEffect(() => {
    const studentParam = searchParams.get('student');
    if (studentParam) {
      const studentPayments = payments.filter(p => p.studentId === studentParam);
      setFilteredPayments(studentPayments);
      
      // Si l'étudiant a des paiements, ajuster automatiquement les filtres d'année
      if (studentPayments.length > 0) {
        const studentAcademicYears = [...new Set(studentPayments.map(p => p.academicYear))];
        if (studentAcademicYears.length === 1) {
          setSelectedAcademicYear(studentAcademicYears[0]);
        }
      }
    }
  }, [searchParams]);

  const calculateDueDate = (type: string): string => {
    const today = new Date();
    
    if (type === 'Frais de dossier' || type === "Frais d'envoi" || type === 'Duplicata') {
      // 14 jours pour les frais administratifs
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + 14);
      return dueDate.toISOString().split('T')[0];
    } else if (type === 'Minerval') {
      // 31 décembre pour le minerval
      return `${today.getFullYear()}-12-31`;
    }
    
    // Par défaut, 30 jours
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 30);
    return dueDate.toISOString().split('T')[0];
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !newPayment.amount || !newPayment.type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Récupérer les informations de l'étudiant
      const student = getStudent(selectedStudent);
      if (!student) {
        toast({
          title: "Erreur",
          description: "Étudiant non trouvé.",
          variant: "destructive",
        });
        return;
      }

      // Calcul automatique de l'échéance si non spécifiée
      const dueDate = newPayment.dueDate || calculateDueDate(newPayment.type);

      const payment: Omit<Payment, 'id'> = {
        studentId: selectedStudent,
        amount: parseFloat(newPayment.amount),
        dueDate: dueDate,
        status: newPayment.paidDate ? 'Payé' : 'En attente',
        type: newPayment.type as Payment['type'],
        description: newPayment.description || `${newPayment.type} - ${getStudentName(selectedStudent)}`,
        method: newPayment.paidMethod as Payment['method'],
        invoiceNumber: null,
        invoiceDate: new Date().toISOString().split('T')[0],
        paidDate: newPayment.paidDate || undefined,
        academicYear: student.academicYear,
        studyYear: student.studyYear
      };

      // Créer le paiement
      const createdPaymentData = await createPayment(payment);

      // Si on a un paiement créé, générer automatiquement la facture
      if (createdPaymentData) {
        // Attendre un petit délai pour s'assurer que les données sont bien persistées
        setTimeout(async () => {
          try {
            await generateInvoicePdf(createdPaymentData, false);
          } catch (error) {
            console.error('Erreur lors de la génération de la facture:', error);
          }
        }, 500);
      }

      toast({
        title: "Facture manuelle créée",
        description: `Facture manuelle générée pour ${getStudentName(selectedStudent)}.`,
      });

      // Reset du formulaire
      setNewPayment({
        studentId: "",
        amount: "",
        dueDate: "",
        type: "",
        description: "",
        method: "",
        paidDate: "",
        paidMethod: ""
      });
      setSelectedStudent("");
      setManualInvoiceDialog({ isOpen: false });
    } catch (error) {
      console.error('Erreur complète:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture manuelle.",
        variant: "destructive",
      });
    }
  };

  const getStudent = (studentId: string): Student | undefined => {
    return students.find(student => student.id === studentId);
  };

  const getStudentName = (studentId: string): string => {
    const student = getStudent(studentId);
    return student ? `${student.firstName} ${student.lastName}` : "Étudiant inconnu";
  };

  // Gérer l'ouverture de la modale de paiement
  const openPaymentDialog = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    setPaymentDialog({
      isOpen: true,
      paymentId,
      amount: payment?.amount.toString() || '',
      method: '',
      paidDate: new Date().toISOString().split('T')[0]
    });
  };

  const markAsPaid = async () => {
    if (!paymentDialog.amount || !paymentDialog.method) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePayment(paymentDialog.paymentId, {
        status: 'Payé' as const,
        paidDate: paymentDialog.paidDate,
        method: paymentDialog.method as "Espèces" | "Virement"
      });

      toast({
        title: "Paiement enregistré",
        description: "Paiement enregistré avec succès.",
      });

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement.",
        variant: "destructive",
      });
    }

    setPaymentDialog({ isOpen: false, paymentId: '', paidDate: new Date().toISOString().split('T')[0], method: '' });
  };

  // Fonction pour gérer le total et le statut des acomptes
  const getTotalPaidAmount = (payment: Payment): number => {
    if (payment.status === 'Payé') {
      return payment.amount;
    }
    
    if (payment.installments && payment.installments.length > 0) {
      return payment.installments.reduce((total, installment) => total + installment.amount, 0);
    }
    
    return 0;
  };

  const getRemainingAmount = (payment: Payment): number => {
    return payment.amount - getTotalPaidAmount(payment);
  };

  const getPaymentStatus = (payment: Payment): 'Payé' | 'En attente' | 'Partiellement payé' => {
    if (payment.status === 'Payé' || payment.status === 'Remboursé') {
      return payment.status;
    }
    
    const totalPaid = getTotalPaidAmount(payment);
    if (totalPaid >= payment.amount) {
      return 'Payé';
    } else if (totalPaid > 0) {
      return 'Partiellement payé';
    }
    
    return 'En attente';
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

    const remainingAmount = getRemainingAmount(payment);

    if (amount > remainingAmount) {
      toast({
        title: "Montant trop élevé",
        description: `Le montant saisi (${amount}€) dépasse ce qui reste à payer (${remainingAmount}€).`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Ajouter l'acompte dans Supabase
      const { error: installmentError } = await supabase
        .from('payment_installments')
        .insert({
          payment_id: installmentDialog.paymentId,
          amount: amount,
          paid_date: installmentDialog.paidDate,
          method: installmentDialog.method
        });

      if (installmentError) {
        throw installmentError;
      }

      // Vérifier si le paiement est maintenant complet
      const newTotalPaid = getTotalPaidAmount(payment) + amount;
      if (newTotalPaid >= payment.amount) {
        await updatePayment(installmentDialog.paymentId, {
          status: 'Payé' as const,
          paidDate: installmentDialog.paidDate,
          method: installmentDialog.method as "Espèces" | "Virement"
        });
      }

      toast({
        title: "Acompte ajouté",
         description: `Paiement de ${amount}€ enregistré avec succès.`,
      });

      setInstallmentDialog({ isOpen: false, paymentId: '', amount: '', method: '', paidDate: new Date().toISOString().split('T')[0] });

    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'acompte:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'acompte.",
        variant: "destructive",
      });
    }
  };

  const openInstallmentDialog = (paymentId: string) => {
    setInstallmentDialog(prev => ({ ...prev, isOpen: true, paymentId }));
  };

  const closeInstallmentDialog = () => {
    setInstallmentDialog({ isOpen: false, paymentId: '', amount: '', method: '', paidDate: new Date().toISOString().split('T')[0] });
  };

  const generateInvoiceNumber = (student: Student, payment: Payment): string => {
    const typeMap: { [key: string]: string } = {
      'Frais de dossier': 'FD',
      "Frais d'envoi": 'ENV',
      'Minerval': 'MIN',
      'Duplicata': 'DC'
    };

    const typeCode = typeMap[payment.type] || 'FAC';
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    const timeBasedNumber = `${month}${day}${hours}${minutes}${seconds}`;

    return `IPEC-${year}${timeBasedNumber}-${typeCode}`;
  };

  const generateInvoicePdf = async (payment: Payment, isDuplicate = false) => {
    const student = getStudent(payment.studentId);
    if (!student) {
      toast({
        title: "Erreur",
        description: "Étudiant non trouvé.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { fillInvoicePdfWithPositions, downloadPdf } = await import('@/utils/positionPdfFiller');
      
      let invoiceNumber = '';
      
      // Vérifier s'il y a une facture existante
      const existingInvoice = getExistingInvoice(payment);
      
      if (existingInvoice) {
        invoiceNumber = existingInvoice.number;
      } else if (!isDuplicate) {
        // Créer une nouvelle facture seulement si ce n'est pas un duplicata
        invoiceNumber = generateInvoiceNumber(student, payment);
        
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
        
        await createInvoice(newInvoiceData);
      }

      const filename = isDuplicate 
        ? `duplicata-facture-${student.firstName}-${student.lastName}-${invoiceNumber}.pdf`
        : `facture-${student.firstName}-${student.lastName}-${invoiceNumber}.pdf`;

      const pdfBytes = await fillInvoicePdfWithPositions(student, payment, invoiceNumber);
      downloadPdf(pdfBytes, filename);

      toast({
        title: isDuplicate ? "Duplicata téléchargé" : "Facture générée",
        description: isDuplicate 
          ? `Duplicata de la facture ${invoiceNumber} téléchargé.`
          : `Facture ${invoiceNumber} générée pour ${payment.amount}€.`,
      });
    } catch (error) {
      console.error('Error generating PDF invoice:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la facture PDF.",
        variant: "destructive",
      });
    }
  };

  // Fonction pour récupérer la facture associée à un paiement
  const getExistingInvoice = (payment: Payment) => {
    const student = getStudent(payment.studentId);
    if (!student) return null;

    // Logique simplifiée pour les tests - on cherche dans les factures existantes par payment_id
    // Cette fonction sera complétée avec la logique de Supabase plus tard
    return null;
  };

  // Fonction pour générer le récapitulatif de paiement
  const generatePaymentSummaryDoc = (payment: Payment) => {
    const student = getStudent(payment.studentId);
    if (!student) {
      toast({
        title: "Erreur",
        description: "Étudiant non trouvé.",
        variant: "destructive",
      });
      return;
    }

    const existingInvoice = getExistingInvoice(payment);
    const invoiceNumber = existingInvoice?.number || generateInvoiceNumber(student, payment);
    
    const summaryHtml = generatePaymentSummary(student, payment);
    downloadDocument(summaryHtml, `Recapitulatif_Paiement_${invoiceNumber}_${student.lastName}.html`);

    toast({
      title: "Récapitulatif généré",
      description: `Récapitulatif téléchargé pour ${getStudentName(payment.studentId)}.`,
    });
  };

  // Déterminer si un paiement est en retard
  const isPaymentOverdue = (payment: Payment): boolean => {
    if (payment.status === 'Payé' || payment.status === 'Remboursé') return false;
    
    const today = new Date();
    const dueDate = new Date(payment.dueDate);
    return today > dueDate;
  };

  const getStatusColor = (payment: Payment): string => {
    const status = getPaymentStatus(payment);
    switch (status) {
      case 'Payé': return 'bg-green-100 text-green-800';
      case 'Partiellement payé': return 'bg-yellow-100 text-yellow-800';
      case 'Remboursé': return 'bg-blue-100 text-blue-800';
      default: return isPaymentOverdue(payment) ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusText = (payment: Payment): string => {
    if (payment.status === 'Remboursé') return 'Remboursé';
    
    const status = getPaymentStatus(payment);
    if (status === 'En attente' && isPaymentOverdue(payment)) {
      return 'En retard';
    } else if (status === 'Partiellement payé') {
      const remaining = getRemainingAmount(payment);
      return `Partiel (${remaining}€ restant)`;
    }
    return status;
  };

  // Filtrer les paiements selon les critères sélectionnés
  useEffect(() => {
    let filtered = payments;

    // Filtre par année académique
    if (selectedAcademicYear !== "all") {
      filtered = filtered.filter(payment => payment.academicYear === selectedAcademicYear);
    }

    // Filtre par année fiscale (basé sur la date de facture)
    if (selectedFiscalYear !== "all") {
      filtered = filtered.filter(payment => {
        const year = new Date(payment.invoiceDate).getFullYear().toString();
        return year === selectedFiscalYear;
      });
    }

    setFilteredPayments(filtered);
  }, [payments, selectedAcademicYear, selectedFiscalYear]);

  // Calculs des statistiques
  const getFilteredTotalAmount = (): number => {
    return filteredPayments.reduce((total, payment) => total + payment.amount, 0);
  };

  const getFilteredPaidAmount = (): number => {
    return filteredPayments.reduce((total, payment) => {
      if (payment.status === 'Payé') {
        return total + payment.amount;
      }
      return total + getTotalPaidAmount(payment);
    }, 0);
  };

  const getFilteredPendingAmount = (): number => {
    return filteredPayments.reduce((total, payment) => {
      if (payment.status === 'Payé' || payment.status === 'Remboursé') {
        return total;
      }
      return total + getRemainingAmount(payment);
    }, 0);
  };

  const getPendingPaymentsStats = (): { total: number; overdue: number } => {
    const pendingPayments = filteredPayments.filter(p => p.status !== 'Payé' && p.status !== 'Remboursé');
    const overduePayments = pendingPayments.filter(p => isPaymentOverdue(p));
    
    return {
      total: pendingPayments.length,
      overdue: overduePayments.length
    };
  };

  // Fonctions pour les notes de crédit
  const openCreditNoteDialog = (payment: Payment) => {
    setCreditNoteDialog({
      isOpen: true,
      paymentId: payment.id,
      reason: '',
      amount: payment.amount.toString()
    });
  };

  const generateCreditNote = async () => {
    try {
      const payment = payments.find(p => p.id === creditNoteDialog.paymentId);
      const student = getStudent(payment?.studentId || '');
      
      if (!payment || !student) {
        toast({
          title: "Erreur",
          description: "Paiement ou étudiant non trouvé.",
          variant: "destructive",
        });
        return;
      }

      // Trouver la facture associée au paiement
      const invoices = await getInvoicesByStudentId(payment.studentId);
      const invoiceData = invoices.find(inv => inv.payment_id === payment.id);
      
      if (!invoiceData) {
        toast({
          title: "Erreur",
          description: "Aucune facture trouvée pour ce paiement.",
          variant: "destructive",
        });
        return;
      }

      // Générer un numéro de note de crédit unique
      const creditNoteNumber = generateCreditNoteNumber(invoiceData.number);
      
      // Créer la note de crédit dans la base de données
      const creditNoteData = {
        number: creditNoteNumber,
        student_id: payment.studentId,
        original_invoice_id: invoiceData.id,
        amount: parseFloat(creditNoteDialog.amount),
        reason: creditNoteDialog.reason,
        date: new Date().toISOString().split('T')[0]
      };
      
      await createCreditNote(creditNoteData);
      
      // Mettre à jour le statut du paiement à "Remboursé"
      await updatePayment(creditNoteDialog.paymentId, {
        status: 'Remboursé' as Payment['status'],
        refundDate: new Date().toISOString().split('T')[0],
        refundMethod: 'Virement' as Payment['method'],
        refundReason: creditNoteDialog.reason
      });

      // Générer et télécharger le PDF de la note de crédit
      const pdfBytes = await fillCreditNotePdf(student, payment, creditNoteDialog.reason, invoiceData.number);
      const filename = `note-credit-${student.firstName}-${student.lastName}-${creditNoteNumber}.pdf`;
      downloadPdf(pdfBytes, filename);

      // Fermer la modale
      setCreditNoteDialog({
        isOpen: false,
        paymentId: '',
        reason: '',
        amount: ''
      });

      toast({
        title: "Note de crédit générée",
        description: `Note de crédit ${creditNoteNumber} créée et téléchargée.`,
      });

    } catch (error) {
      console.error('Erreur lors de la génération de la note de crédit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la note de crédit.",
        variant: "destructive",
      });
    }
  };

   // Générer le PDF de la note de crédit avec coordonnées XY précises

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Total des paiements</h3>
              <p className="text-3xl font-bold text-primary">{getFilteredTotalAmount()}€</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Montant payé</h3>
              <p className="text-3xl font-bold text-secondary">{getFilteredPaidAmount()}€</p>
            </CardContent>
          </Card>
          
           <Card className="bg-gradient-card shadow-soft">
             <CardContent className="p-6 text-center">
               {(() => {
                 const stats = getPendingPaymentsStats();
                 return (
                   <>
                     <h3 className="text-lg font-semibold mb-2">En attente</h3>
                     <p className="text-3xl font-bold text-yellow-600">{getFilteredPendingAmount()}€</p>
                     {stats.overdue > 0 && (
                       <p className="text-sm text-red-600 mt-2">
                         {stats.total} facture{stats.total > 1 ? 's' : ''} dont {stats.overdue} en retard
                       </p>
                     )}
                   </>
                 );
               })()}
             </CardContent>
           </Card>
        </div>

        <Card className="shadow-medium">
          <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  <CreditCard className="mr-2 h-6 w-6" />
                  Gestion des Paiements
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Suivi et gestion des paiements étudiants
                </CardDescription>
              </div>
              <Button 
                variant="secondary" 
                onClick={() => setManualInvoiceDialog({ isOpen: true })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Facture manuelle
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Filtres années académiques et fiscales */}
            <div className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
              {/* Première ligne : Filtres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Filtre année académique */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Année académique:</span>
                  </div>
                  <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les années</SelectItem>
                      {academicYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre année fiscale */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Année fiscale:</span>
                  </div>
                  <Select value={selectedFiscalYear} onValueChange={setSelectedFiscalYear}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les années</SelectItem>
                      {fiscalYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bouton de génération ZIP */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Printer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Export:</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isGeneratingZip || filteredPayments.length === 0}
                    className="h-9"
                  >
                    {isGeneratingZip ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        ZIP ({filteredPayments.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Payments List */}
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {payments.length === 0 ? "Aucun paiement enregistré" : "Aucun paiement pour cette année"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {payments.length === 0 
                    ? "Commencez par ajouter un premier paiement."
                    : (selectedAcademicYear !== "all" || selectedFiscalYear !== "all")
                      ? `Aucun paiement trouvé pour les filtres sélectionnés.`
                      : "Aucun paiement ne correspond aux critères."
                  }
                </p>
                {payments.length === 0 && (
                  <Button onClick={() => setManualInvoiceDialog({ isOpen: true })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un paiement
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                   <Card key={payment.id} className={`hover:shadow-soft transition-shadow ${
                     isPaymentOverdue(payment) ? 'border-red-400' : 
                     payment.status === 'En attente' ? 'border-orange-300' :
                     payment.status === 'Payé' ? 'border-green-300' : 
                     payment.status === 'Remboursé' ? 'border-blue-400' : ''
                   }`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              {getStudentName(payment.studentId)}
                            </h3>
                             {(() => {
                               const existingInvoice = getExistingInvoice(payment);
                               if (!existingInvoice) {
                                 return (
                                   <Badge variant="secondary" className="text-xs">
                                     Sans facture
                                   </Badge>
                                 );
                               }
                               return null;
                             })()}
                             <Badge className={getStatusColor(payment)}>
                               {getStatusText(payment)}
                             </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Type:</strong> {payment.type}</p>
                            <p><strong>Montant:</strong> {payment.amount}€</p>
                            <p><strong>Échéance:</strong> {new Date(payment.dueDate).toLocaleDateString("fr-FR")}</p>
                            <p><strong>Année académique:</strong> {payment.academicYear} - {payment.studyYear}</p>
                            {payment.description && (
                              <p><strong>Description:</strong> {payment.description}</p>
                            )}
                            
                            {/* Affichage des acomptes s'il y en a */}
                            {payment.installments && payment.installments.length > 0 && (
                              <div className="mt-2 p-2 bg-muted/50 rounded-md">
                                <p className="text-xs font-medium mb-1">Acomptes versés:</p>
                                {payment.installments.map((installment, index) => (
                                  <div key={index} className="text-xs flex justify-between">
                                    <span>{new Date(installment.paidDate).toLocaleDateString("fr-FR")}</span>
                                    <span>{installment.amount}€ ({installment.method})</span>
                                  </div>
                                ))}
                                <div className="text-xs font-medium pt-1 border-t border-muted-foreground/20 mt-1">
                                  Total payé: {getTotalPaidAmount(payment)}€ - Reste: {getRemainingAmount(payment)}€
                                </div>
                              </div>
                            )}
                            
                            {payment.paidDate && (
                              <p><strong>Payé le:</strong> {new Date(payment.paidDate).toLocaleDateString("fr-FR")} ({payment.method})</p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateInvoicePdf(payment, false)}
                            className="border-primary text-primary hover:bg-primary/10"
                          >
                            <Receipt className="h-4 w-4 mr-1" />
                            Facture
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateInvoicePdf(payment, true)}
                            className="border-secondary text-secondary hover:bg-secondary/10"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Duplicata
                          </Button>
                          
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => generatePaymentSummaryDoc(payment)}
                            className="border-accent text-accent hover:bg-accent/10"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Récapitulatif
                          </Button>

                          {payment.status !== 'Remboursé' && getPaymentStatus(payment) !== 'Payé' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInstallmentDialog(payment.id)}
                              className="border-green-300 text-green-600 hover:bg-green-50"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Acompte
                            </Button>
                          )}
                          
                          {payment.status === 'Payé' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCreditNoteDialog(payment)}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <RefreshCcw className="h-4 w-4 mr-1" />
                              Rembourser
                            </Button>
                          )}
                          
                          {payment.status === 'Remboursé' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const student = students.find(s => s.id === payment.studentId);
                                if (student) {
                                  try {
                                    // Trouver la note de crédit existante pour ce paiement
                                    const creditNotes = await getCreditNotesByStudentId(payment.studentId);
                                    const invoices = await getInvoicesByStudentId(payment.studentId);
                                    
                                    // Trouver la facture associée à ce paiement
                                    const paymentInvoice = invoices.find(inv => inv.payment_id === payment.id);
                                    
                                    // Trouver la note de crédit correspondante
                                    const correspondingCreditNote = creditNotes.find(cn => 
                                      cn.original_invoice_id === paymentInvoice?.id
                                    );
                                    
                                    if (correspondingCreditNote && paymentInvoice) {
                                      // Utiliser les données existantes avec le bon numéro de facture d'origine
                                      const pdfBytes = await fillCreditNotePdf(
                                        student, 
                                        payment, 
                                        correspondingCreditNote.reason || payment.refundReason || 'Remboursement',
                                        paymentInvoice.number
                                      );
                                      const filename = `note-credit-${student.firstName}-${student.lastName}-${correspondingCreditNote.number}.pdf`;
                                      downloadPdf(pdfBytes, filename);
                                    } else {
                                      // Fallback si aucune note de crédit trouvée
                                      const pdfBytes = await fillCreditNotePdf(student, payment, payment.refundReason || 'Remboursement');
                                      const filename = `note-credit-${student.firstName}-${student.lastName}.pdf`;
                                      downloadPdf(pdfBytes, filename);
                                    }
                                  } catch (error) {
                                    console.error('Erreur de téléchargement NC:', error);
                                    toast({
                                      title: "Erreur",
                                      description: "Impossible de télécharger la note de crédit.",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Télécharger Note de crédit
                            </Button>
                          )}
                         
                         {payment.status === 'En attente' && (
                           <Button
                             variant="default"
                             size="sm"
                             onClick={() => openPaymentDialog(payment.id)}
                           >
                             <>
                               <CreditCard className="h-4 w-4 mr-1" />
                               Marquer payé
                             </>
                           </Button>
                         )}
                        </div>

                       {(() => {
                         const existingInvoice = getExistingInvoice(payment);
                         return existingInvoice && (
                           <p className="text-xs text-primary font-medium mt-3">
                             <strong>Facture : {existingInvoice.number}</strong> - 
                             Générée le {new Date(existingInvoice.generate_date).toLocaleDateString("fr-FR")}
                           </p>
                         );
                       })()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

            {/* Dialog pour marquer comme payé */}
            <Dialog open={paymentDialog.isOpen} onOpenChange={(open) => setPaymentDialog(prev => ({ ...prev, isOpen: open }))}>
              <DialogContent>
                <DialogHeader>
                   <DialogTitle>Ajouter un paiement</DialogTitle>
                  <DialogDescription>
                    Veuillez renseigner les informations de paiement
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Montant (€)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={paymentDialog.amount}
                      onChange={(e) => setPaymentDialog(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
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
                  <div>
                    <Label htmlFor="paidDate">Date de paiement</Label>
                    <Input
                      id="paidDate"
                      type="date"
                      value={paymentDialog.paidDate}
                      onChange={(e) => setPaymentDialog(prev => ({ ...prev, paidDate: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPaymentDialog(prev => ({ ...prev, isOpen: false }))}>
                    Annuler
                  </Button>
                  <Button onClick={markAsPaid}>
                    Marquer comme payé
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog pour ajouter un acompte */}
            <Dialog open={installmentDialog.isOpen} onOpenChange={(open) => setInstallmentDialog(prev => ({ ...prev, isOpen: open }))}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un acompte</DialogTitle>
                  <DialogDescription>
                    Enregistrer un paiement partiel pour cette facture
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="installment-amount">Montant de l'acompte (€)</Label>
                    <Input
                      id="installment-amount"
                      type="number"
                      step="0.01"
                      value={installmentDialog.amount}
                      onChange={(e) => setInstallmentDialog(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="installment-method">Moyen de paiement</Label>
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
                  <div>
                    <Label htmlFor="installment-date">Date de paiement</Label>
                    <Input
                      id="installment-date"
                      type="date"
                      value={installmentDialog.paidDate}
                      onChange={(e) => setInstallmentDialog(prev => ({ ...prev, paidDate: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeInstallmentDialog}>
                    Annuler
                  </Button>
                  <Button onClick={addInstallment}>
                    Paiement
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog pour note de crédit */}
            <Dialog open={creditNoteDialog.isOpen} onOpenChange={(open) => setCreditNoteDialog(prev => ({ ...prev, isOpen: open }))}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Générer une note de crédit</DialogTitle>
                  <DialogDescription>
                    Rembourser ce paiement et générer une note de crédit
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="credit-amount">Montant à rembourser (€)</Label>
                    <Input
                      id="credit-amount"
                      type="number"
                      step="0.01"
                      value={creditNoteDialog.amount}
                      onChange={(e) => setCreditNoteDialog(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="credit-reason">Motif du remboursement</Label>
                    <Textarea
                      id="credit-reason"
                      value={creditNoteDialog.reason}
                      onChange={(e) => setCreditNoteDialog(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Motif du remboursement..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setCreditNoteDialog(prev => ({ ...prev, isOpen: false }))}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={generateCreditNote}
                    disabled={!creditNoteDialog.amount || !creditNoteDialog.reason}
                  >
                    Générer la note de crédit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Manual Invoice Dialog */}
            <Dialog open={manualInvoiceDialog.isOpen} onOpenChange={(open) => setManualInvoiceDialog({ isOpen: open })}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Facture manuelle</DialogTitle>
                  <DialogDescription>
                    Créer un nouveau paiement et générer sa facture
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentSelect">Étudiant</Label>
                      <Select onValueChange={setSelectedStudent} value={selectedStudent}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un étudiant" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.firstName} {student.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="amount">Montant (€)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type de paiement</Label>
                      <Select onValueChange={(value) => setNewPayment(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type de paiement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Frais de dossier">Frais de dossier (FD)</SelectItem>
                          <SelectItem value="Frais d'envoi">Frais d'envoi (ENV)</SelectItem>
                          <SelectItem value="Minerval">Minerval (MIN)</SelectItem>
                          <SelectItem value="Duplicata">Duplicata (DC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="dueDate">Date d'échéance</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newPayment.dueDate}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paidDate">Date de paiement (si déjà payé)</Label>
                      <Input
                        id="paidDate"
                        type="date"
                        value={newPayment.paidDate}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, paidDate: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="paidMethod">Moyen de paiement</Label>
                      <Select onValueChange={(value) => setNewPayment(prev => ({ ...prev, paidMethod: value }))}>
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

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newPayment.description}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du paiement..."
                      rows={2}
                    />
                  </div>

                  <DialogFooter>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setManualInvoiceDialog({ isOpen: false })}
                    >
                      Annuler
                    </Button>
                    <Button type="submit">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer la facture manuelle
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentManagement;