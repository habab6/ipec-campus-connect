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
import { CreditCard, ArrowLeft, Plus, Eye, Receipt, FileText, Euro, Printer, Calendar } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Student, Payment } from "@/types";
import { generateInvoice, generatePaymentSummary, downloadDocument } from "@/utils/documentGenerator";
import { supabase } from "@/integrations/supabase/client";

const PaymentManagement = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { students } = useStudents();
  
  // Gestion des filtres spécifiques aux paiements
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("all");
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [fiscalYears, setFiscalYears] = useState<string[]>([]);
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
    createInvoice
  } = usePayments();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [newPayment, setNewPayment] = useState({
    amount: "",
    dueDate: "",
    type: "",
    description: "",
    method: "",
    paidDate: "",
    paidMethod: ""
  });
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);
  const [selectedPaymentForSummary, setSelectedPaymentForSummary] = useState<Payment | null>(null);
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
  const [invoices, setInvoices] = useState<any[]>([]);

  // Charger les factures pour tous les étudiants ayant des paiements
  useEffect(() => {
    const loadInvoices = async () => {
      const uniqueStudentIds = [...new Set(payments.map(p => p.studentId))];
      const allInvoices = [];
      
      for (const studentId of uniqueStudentIds) {
        try {
          const studentInvoices = await getInvoicesByStudentId(studentId);
          allInvoices.push(...studentInvoices);
        } catch (error) {
          console.error('Erreur lors du chargement des factures:', error);
        }
      }
      
      setInvoices(allInvoices);
    };

    if (payments.length > 0) {
      loadInvoices();
    }
  }, [payments, getInvoicesByStudentId]);

  // Gérer les paramètres URL pour auto-sélectionner l'étudiant et ouvrir le dialog d'ajout de versement
  useEffect(() => {
    const studentId = searchParams.get('studentId');
    const installmentPaymentId = searchParams.get('installmentPaymentId');
    
    if (studentId) {
      setSelectedStudent(studentId);
      
      // Si un installmentPaymentId est fourni, ouvrir le dialog d'ajout de versement
      if (installmentPaymentId) {
        setInstallmentDialog({
          isOpen: true,
          paymentId: installmentPaymentId,
          amount: '',
          method: '',
          paidDate: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [searchParams]);

  // Les données sont maintenant chargées via les hooks useStudents et usePayments

  const calculateDueDate = (type: string): string => {
    const today = new Date();
    
    if (type === 'Frais de dossier' || type === "Frais d'envoi" || type === 'Duplicata') {
      // 14 jours calendaires après aujourd'hui pour frais de dossier, frais d'envoi et duplicata
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + 14);
      return dueDate.toISOString().split('T')[0];
    } else if (type === 'Minerval') {
      // 31 décembre de l'année en cours
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

      // Générer automatiquement la facture
      if (createdPaymentData) {
        // Transformer les données de la base en objet Payment
        const createdPayment: Payment = {
          id: createdPaymentData.id,
          studentId: createdPaymentData.student_id,
          amount: createdPaymentData.amount,
          dueDate: createdPaymentData.due_date,
          status: createdPaymentData.status as Payment['status'],
          type: createdPaymentData.type as Payment['type'],
          description: createdPaymentData.description,
          method: createdPaymentData.method as Payment['method'],
          invoiceNumber: createdPaymentData.invoice_number,
          invoiceDate: createdPaymentData.invoice_date,
          paidDate: createdPaymentData.paid_date,
          academicYear: createdPaymentData.academic_year,
          studyYear: createdPaymentData.study_year
        };

        // Attendre un court délai pour que le paiement soit bien créé
        setTimeout(async () => {
          try {
            await generateInvoiceDocument(createdPayment, false);
          } catch (error) {
            console.error('Erreur lors de la génération automatique de la facture:', error);
          }
        }, 500);
      }

      toast({
        title: "Facture créée !",
        description: `Facture manuelle générée pour ${getStudentName(selectedStudent)}.`,
      });

      // Reset form
      setNewPayment({
        amount: "",
        dueDate: "",
        type: "",
        description: "",
        method: "",
        paidDate: "",
        paidMethod: ""
      });
      setSelectedStudent("");
      setShowAddPayment(false);
    } catch (error) {
      console.error('Erreur complète:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la facture manuelle.",
        variant: "destructive",
      });
    }
  };

  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : "Étudiant inconnu";
  };

  const getStudent = (studentId: string): Student | undefined => {
    return students.find(s => s.id === studentId);
  };

  const [paymentDialog, setPaymentDialog] = useState<{
    isOpen: boolean;
    paymentId: string;
    paidDate: string;
    method: string;
  }>({
    isOpen: false,
    paymentId: '',
    paidDate: new Date().toISOString().split('T')[0],
    method: ''
  });

  const markAsPaid = async (paymentId: string, paidDate?: string, method?: Payment['method']) => {
    try {
      await updatePayment(paymentId, {
        status: 'Payé' as Payment['status'],
        paidDate: paidDate || new Date().toISOString().split('T')[0],
        method: (method || undefined) as Payment['method']
      });
      
      toast({
        title: "Paiement confirmé",
        description: "Paiement confirmé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le paiement.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = () => {
    markAsPaid(paymentDialog.paymentId, paymentDialog.paidDate, paymentDialog.method as Payment['method']);
    setPaymentDialog({ isOpen: false, paymentId: '', paidDate: new Date().toISOString().split('T')[0], method: '' });
  };

  const openPaymentDialog = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment?.type === 'Minerval') {
      // Pour le minerval, ouvrir le dialogue de paiement
      setInstallmentDialog({
        isOpen: true,
        paymentId,
        amount: '',
        method: '',
        paidDate: new Date().toISOString().split('T')[0]
      });
    } else {
      // Pour les autres paiements, dialogue normal
      setPaymentDialog({
        isOpen: true,
        paymentId,
        paidDate: new Date().toISOString().split('T')[0],
        method: ''
      });
    }
  };

  const addInstallment = async () => {
    const amount = parseFloat(installmentDialog.amount);
    if (!amount || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un montant valide.",
        variant: "destructive",
      });
      return;
    }

    // Validation : vérifier que le montant ne dépasse pas ce qui reste à payer
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
      const payment = payments.find(p => p.id === installmentDialog.paymentId);
      if (!payment) return;

      // Add installment to the payment_installments table
      const { error: installmentError } = await supabase
        .from('payment_installments')
        .insert({
          payment_id: installmentDialog.paymentId,
          amount,
          paid_date: installmentDialog.paidDate,
          method: installmentDialog.method
        });

      if (installmentError) throw installmentError;

      // Calculate total paid including new installment
      const currentInstallments = payment.installments || [];
      const totalPaid = currentInstallments.reduce((sum, inst) => sum + inst.amount, 0) + amount;
      const isFullyPaid = totalPaid >= payment.amount;

      // Update payment status if fully paid
      if (isFullyPaid) {
        await updatePayment(installmentDialog.paymentId, {
          status: 'Payé' as Payment['status'],
          paidDate: installmentDialog.paidDate,
          method: installmentDialog.method as Payment['method']
        });
      }

      // Refresh payments to get updated installments
      await fetchPayments();
      
      toast({
         title: "Paiement ajouté",
         description: `Paiement de ${amount}€ enregistré avec succès.`,
      });

      setInstallmentDialog({
        isOpen: false,
        paymentId: '',
        amount: '',
        method: '',
        paidDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le paiement.",
        variant: "destructive",
      });
    }
  };

  const openPaymentSummary = (payment: Payment) => {
    setSelectedPaymentForSummary(payment);
    setShowPaymentSummary(true);
  };

  const getTotalPaidForPayment = (payment: Payment): number => {
    if (!payment.installments) return 0;
    return payment.installments.reduce((sum, inst) => sum + inst.amount, 0);
  };

  const getRemainingAmount = (payment: Payment): number => {
    return payment.amount - getTotalPaidForPayment(payment);
  };

  const generateInvoiceNumber = async (student: Student, payment: Payment): Promise<string> => {
    // Use the same logic for unique invoice numbers
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });
    
    const year = new Date().getFullYear();
    const invoiceCount = (count || 0) + 1;
    const typeCode = payment.type === 'Frais de dossier' ? 'FD' : 
                     payment.type === 'Minerval' ? 'MIN' : 'FAC';
    return `IPEC-${year}-${String(invoiceCount).padStart(4, '0')}-${typeCode}`;
  };

  const generateInvoiceDocument = async (payment: Payment, isDuplicate = false) => {
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
      // Import the required modules
      const { fillInvoicePdfWithPositions, downloadPdf } = await import('@/utils/positionPdfFiller');
      
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
          academic_year: payment.academicYear || student.academicYear,
          study_year: payment.studyYear || student.studyYear,
          generate_date: new Date().toISOString().split('T')[0]
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

    if (payment.type === 'Frais de dossier') {
      return invoices.find(i => 
        i.student_id === student.id && 
        i.type === payment.type
      );
    }
    
    return invoices.find(i => 
      i.student_id === student.id && 
      i.type === payment.type &&
      i.academic_year === (payment.academicYear || student.academicYear) &&
      i.study_year === (payment.studyYear || student.studyYear)
    );
  };

  const generatePaymentSummaryDocument = (payment: Payment) => {
    const student = getStudent(payment.studentId);
    if (!student) {
      toast({
        title: "Erreur",
        description: "Étudiant non trouvé.",
        variant: "destructive",
      });
      return;
    }

    const summaryHtml = generatePaymentSummary(student, payment);
    const existingInvoice = getExistingInvoice(payment);
    const invoiceNumber = existingInvoice?.number || payment.invoiceNumber || 'N/A';
    downloadDocument(summaryHtml, `Recapitulatif_Paiement_${invoiceNumber}_${student.lastName}.html`);
    
    toast({
      title: "Récapitulatif généré",
      description: "Le récapitulatif de paiement a été téléchargé avec succès.",
    });
  };

  const getStatusBadgeColor = (status: Payment['status']) => {
    const colors = {
      'En attente': 'bg-yellow-500',
      'Payé': 'bg-green-500',
      'En retard': 'bg-red-500',
      'Remboursé': 'bg-blue-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getTotalAmount = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0);
  };

  const getPaidAmount = () => {
    return payments.reduce((total, payment) => {
      if (payment.status === 'Payé') {
        return total + payment.amount;
      } else if (payment.installments && payment.installments.length > 0) {
         // Ajouter les paiements pour les paiements partiels
        return total + getTotalPaidForPayment(payment);
      }
      return total;
    }, 0);
  };

  const getPendingAmount = () => {
    return payments.reduce((total, payment) => {
      if (payment.status === 'En attente') {
         // Pour les paiements en attente, soustraire les paiements déjà payés
        const remainingAmount = getRemainingAmount(payment);
        return total + remainingAmount;
      }
      return total;
    }, 0);
  };

  // Fonction pour vérifier si un paiement est en retard
  const isPaymentOverdue = (payment: Payment): boolean => {
    if (payment.status === 'Payé') return false;
    const today = new Date();
    const dueDate = new Date(payment.dueDate);
    return dueDate < today;
  };

  // Filtrer les paiements par année académique, fiscale et statut
  const filteredPayments = payments.filter(payment => {
    const matchesAcademicYear = selectedAcademicYear === "all" || payment.academicYear === selectedAcademicYear;
    
    // Pour l'année fiscale, vérifier la date de génération de la facture associée
    let matchesFiscalYear = selectedFiscalYear === "all";
    if (!matchesFiscalYear && payment.invoiceDate) {
      const fiscalYear = new Date(payment.invoiceDate).getFullYear().toString();
      matchesFiscalYear = fiscalYear === selectedFiscalYear;
    } else if (!matchesFiscalYear) {
      // Si pas de date de facture, utiliser la date de création du paiement
      const fiscalYear = new Date().getFullYear().toString();
      matchesFiscalYear = fiscalYear === selectedFiscalYear;
    }
    
     // Filtre par statut de paiement
     let matchesStatus = selectedPaymentStatus === "all";
     if (!matchesStatus) {
       if (selectedPaymentStatus === "paid") {
         matchesStatus = payment.status === "Payé";
       } else if (selectedPaymentStatus === "unpaid") {
         matchesStatus = payment.status !== "Payé";
       } else if (selectedPaymentStatus === "overdue") {
         matchesStatus = isPaymentOverdue(payment);
       }
     }
    
    return matchesAcademicYear && matchesFiscalYear && matchesStatus;
  });

  // Recalculer les statistiques avec les paiements filtrés
  const getFilteredTotalAmount = () => {
    return filteredPayments.reduce((total, payment) => total + payment.amount, 0);
  };

  const getFilteredPaidAmount = () => {
    return filteredPayments.reduce((total, payment) => {
      if (payment.status === 'Payé') {
        return total + payment.amount;
      } else if (payment.installments && payment.installments.length > 0) {
        // Ajouter les paiements pour les paiements partiels
        return total + getTotalPaidForPayment(payment);
      }
      return total;
    }, 0);
  };

  const getFilteredPendingAmount = () => {
    return filteredPayments.reduce((total, payment) => {
      if (payment.status === 'En attente') {
        // Pour les paiements en attente, soustraire les paiements déjà payés
        const remainingAmount = getRemainingAmount(payment);
        return total + remainingAmount;
      }
      return total;
     }, 0);
   };

   // Calculer le montant en retard
   const getFilteredOverdueAmount = () => {
     return filteredPayments.reduce((total, payment) => {
       if (isPaymentOverdue(payment)) {
         const remainingAmount = getRemainingAmount(payment);
         return total + remainingAmount;
       }
       return total;
     }, 0);
   };

   // Compter les paiements en attente et en retard
   const getPendingPaymentsStats = () => {
     const pendingPayments = filteredPayments.filter(payment => payment.status === 'En attente');
     const overduePayments = pendingPayments.filter(payment => isPaymentOverdue(payment));
     return {
       total: pendingPayments.length,
       overdue: overduePayments.length
     };
   };

  // Fonction pour générer et télécharger un ZIP avec toutes les factures filtrées
  const downloadFilteredInvoicesZip = async () => {
    setIsGeneratingZip(true);
    
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      let addedCount = 0;
      
      for (const payment of filteredPayments) {
        const student = getStudent(payment.studentId);
        if (!student) continue;
        
        const existingInvoice = getExistingInvoice(payment);
        if (!existingInvoice) continue;
        
        try {
          // Import des modules PDF
          const { fillInvoicePdfWithPositions } = await import('@/utils/positionPdfFiller');
          
          const invoiceNumber = existingInvoice.number || 'SANS-NUMERO';
          const pdfBytes = await fillInvoicePdfWithPositions(student, payment, invoiceNumber);
          
          // Ajouter le PDF au ZIP
          const filename = `facture-${student.firstName}-${student.lastName}-${invoiceNumber}.pdf`;
          zip.file(filename, pdfBytes);
          addedCount++;
        } catch (error) {
          console.error(`Erreur lors de la génération de la facture ${existingInvoice.number}:`, error);
        }
      }
      
      if (addedCount === 0) {
        toast({
          title: "Aucune facture",
          description: "Aucune facture n'a pu être générée pour les filtres sélectionnés.",
          variant: "destructive",
        });
        return;
      }
      
      // Générer le ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Télécharger le ZIP
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nom du fichier avec les filtres appliqués
      const academicFilter = selectedAcademicYear !== "all" ? `-${selectedAcademicYear}` : "";
      const fiscalFilter = selectedFiscalYear !== "all" ? `-${selectedFiscalYear}` : "";
      link.download = `factures${academicFilter}${fiscalFilter}-${new Date().toISOString().split('T')[0]}.zip`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "ZIP téléchargé",
        description: `${addedCount} facture${addedCount > 1 ? 's' : ''} téléchargée${addedCount > 1 ? 's' : ''} dans le fichier ZIP.`,
      });
    } catch (error) {
      console.error('Erreur lors de la génération du ZIP:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le fichier ZIP.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingZip(false);
    }
   };

   // Générer l'échéancier de paiement pour les minervaux
   const generatePaymentSchedule = async (payment: Payment) => {
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
       // Calculer les tranches d'échéancier
       const amount = payment.amount;
       const firstInstallment = 3000;
       const remainingAmount = amount - firstInstallment;
       
       // Date de la facture ou date actuelle
       const invoiceDate = payment.invoiceDate ? new Date(payment.invoiceDate) : new Date();
       
       // Première échéance : 14 jours après la facture
       const firstDueDate = new Date(invoiceDate);
       firstDueDate.setDate(firstDueDate.getDate() + 14);
       
       // Générer les échéances
       const installments = [
         {
           amount: firstInstallment,
           dueDate: new Date(firstDueDate),
           description: "Première tranche"
         }
       ];
       
       // Calculer les tranches mensuelles restantes
       if (remainingAmount > 0) {
         const monthlyInstallment = 1000;
         let currentAmount = remainingAmount;
         let currentDate = new Date(firstDueDate);
         let installmentNumber = 2;
         
         while (currentAmount > 0 && currentDate.getMonth() < 6) { // Jusqu'en juin (mois 5, mais on vérifie < 6)
           currentDate = new Date(currentDate);
           currentDate.setMonth(currentDate.getMonth() + 1);
           
           // Si on dépasse juin, arrêter
           if (currentDate.getMonth() >= 6) break;
           
           const installmentAmount = currentAmount >= monthlyInstallment ? monthlyInstallment : currentAmount;
           
           installments.push({
             amount: installmentAmount,
             dueDate: new Date(currentDate),
             description: `Tranche ${installmentNumber}`
           });
           
           currentAmount -= installmentAmount;
           installmentNumber++;
         }
         
         // Si il reste encore de l'argent, l'ajouter à la dernière tranche ou créer une tranche finale
         if (currentAmount > 0) {
           if (installments.length > 1) {
             installments[installments.length - 1].amount += currentAmount;
           } else {
             installments.push({
               amount: currentAmount,
               dueDate: new Date(currentDate),
               description: "Tranche finale"
             });
           }
         }
       }
       
       // Générer le document PDF de l'échéancier
       const pdfBytes = await generateSchedulePDF(student, payment, installments);
       const filename = `echeancier-${student.firstName}-${student.lastName}-${new Date().toISOString().split('T')[0]}.pdf`;
       
       // Télécharger le PDF
       const blob = new Blob([pdfBytes], { type: 'application/pdf' });
       const url = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
       link.download = filename;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       URL.revokeObjectURL(url);
       
       toast({
         title: "Échéancier généré",
         description: "L'échéancier de paiement PDF a été téléchargé.",
       });
     } catch (error) {
       console.error('Erreur lors de la génération de l\'échéancier:', error);
       toast({
         title: "Erreur",
         description: "Impossible de générer l'échéancier.",
         variant: "destructive",
       });
     }
   };

   // Générer le PDF de l'échéancier
   const generateSchedulePDF = async (student: Student, payment: Payment, installments: any[]) => {
     const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
     
     const pdfDoc = await PDFDocument.create();
     const page = pdfDoc.addPage([595, 842]); // A4 size
     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
     const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
     
     const { width, height } = page.getSize();
     let yPosition = height - 50;
     
     // Title
     page.drawText('ÉCHÉANCIER DE PAIEMENT', {
       x: width / 2 - 120,
       y: yPosition,
       size: 18,
       font: boldFont,
       color: rgb(0, 0, 0),
     });
     
     yPosition -= 30;
     page.drawText(`Minerval - ${payment.academicYear || 'N/A'}`, {
       x: width / 2 - 80,
       y: yPosition,
       size: 12,
       font: font,
       color: rgb(0, 0, 0),
     });
     
     yPosition -= 40;
     
     // Student information
     page.drawText('Informations Étudiant', {
       x: 50,
       y: yPosition,
       size: 14,
       font: boldFont,
       color: rgb(0, 0, 0),
     });
     
     yPosition -= 25;
     const studentInfo = [
       `Nom: ${student.firstName} ${student.lastName}`,
       `Programme: ${student.program}`,
       `Spécialité: ${student.specialty}`,
       `Année d'étude: ${payment.studyYear === 1 ? '1ère année' : `${payment.studyYear}ème année`}`,
       `Montant total: ${payment.amount}€`
     ];
     
     studentInfo.forEach(info => {
       page.drawText(info, {
         x: 50,
         y: yPosition,
         size: 10,
         font: font,
         color: rgb(0, 0, 0),
       });
       yPosition -= 20;
     });
     
     yPosition -= 20;
     
     // Schedule table header
     page.drawText('Échéancier des Paiements', {
       x: 50,
       y: yPosition,
       size: 14,
       font: boldFont,
       color: rgb(0, 0, 0),
     });
     
     yPosition -= 30;
     
     // Table headers
     const headers = ['Tranche', 'Montant', 'Date d\'échéance', 'Description'];
     const columnWidths = [80, 80, 120, 200];
     let xPosition = 50;
     
     headers.forEach((header, index) => {
       page.drawText(header, {
         x: xPosition,
         y: yPosition,
         size: 10,
         font: boldFont,
         color: rgb(0, 0, 0),
       });
       xPosition += columnWidths[index];
     });
     
     yPosition -= 20;
     
     // Table content
     installments.forEach((installment, index) => {
       xPosition = 50;
       const rowData = [
         (index + 1).toString(),
         `${installment.amount}€`,
         installment.dueDate.toLocaleDateString('fr-FR'),
         installment.description
       ];
       
       rowData.forEach((data, colIndex) => {
         page.drawText(data, {
           x: xPosition,
           y: yPosition,
           size: 9,
           font: font,
           color: rgb(0, 0, 0),
         });
         xPosition += columnWidths[colIndex];
       });
       
       yPosition -= 18;
     });
     
     // Total
     yPosition -= 10;
     xPosition = 50;
     page.drawText('Total:', {
       x: xPosition + columnWidths[0],
       y: yPosition,
       size: 10,
       font: boldFont,
       color: rgb(0, 0, 0),
     });
     
     page.drawText(`${installments.reduce((sum, inst) => sum + inst.amount, 0)}€`, {
       x: xPosition + columnWidths[0] + columnWidths[1],
       y: yPosition,
       size: 10,
       font: boldFont,
       color: rgb(0, 0, 0),
     });
     
     // Footer notes
     yPosition -= 40;
     const notes = [
       'Cet échéancier constitue une proposition de paiement échelonné',
       'pour faciliter le règlement du minerval.',
       '',
       'Pour toute question concernant cet échéancier,',
       'veuillez contacter l\'administration.'
     ];
     
     notes.forEach(note => {
       page.drawText(note, {
         x: 50,
         y: yPosition,
         size: 9,
         font: font,
         color: rgb(0.3, 0.3, 0.3),
       });
       yPosition -= 15;
     });
     
     return await pdfDoc.save();
   };

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
                onClick={() => setShowAddPayment(!showAddPayment)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {showAddPayment ? 'Annuler' : 'Générer la facture'}
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
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Année académique:</span>
                  </div>
                  <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner l'année" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les années</SelectItem>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Filtre année fiscale */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Année fiscale:</span>
                  <Select value={selectedFiscalYear} onValueChange={setSelectedFiscalYear}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner l'année" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les années</SelectItem>
                      {fiscalYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Filtre statut de paiement */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Statut:</span>
                  <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner le statut" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="all">Tous les statuts</SelectItem>
                       <SelectItem value="paid">Factures payées</SelectItem>
                       <SelectItem value="unpaid">Factures non payées</SelectItem>
                       <SelectItem value="overdue">Factures en retard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Deuxième ligne : Actions et statistiques */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{filteredPayments.length} facture{filteredPayments.length > 1 ? 's' : ''} affiché{filteredPayments.length > 1 ? 's' : 'e'}</span>
                </div>
                
                {/* Boutons d'action */}
                <div className="flex flex-wrap items-center gap-2">
                  {(selectedAcademicYear !== "all" || selectedFiscalYear !== "all" || selectedPaymentStatus !== "all") && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedAcademicYear("all");
                        setSelectedFiscalYear("all");
                        setSelectedPaymentStatus("all");
                      }}
                    >
                      Tout afficher
                    </Button>
                  )}
                  
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={downloadFilteredInvoicesZip}
                    disabled={isGeneratingZip || filteredPayments.length === 0}
                    className="flex items-center gap-2 shrink-0"
                  >
                    {isGeneratingZip ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
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
            
            {showAddPayment && (
              <Card className="mb-6 border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Créer une facture manuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPayment} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="student">Étudiant *</Label>
                        <Select onValueChange={setSelectedStudent} value={selectedStudent}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un étudiant" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.firstName} {student.lastName} - {student.program}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="amount">Montant (€) *</Label>
                         <Input
                           id="amount"
                           type="number"
                           step="0.01"
                           value={newPayment.amount}
                           onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                           placeholder={newPayment.type === 'Frais de dossier' ? "500€" : newPayment.type === "Frais d'envoi" ? "120€" : newPayment.type === "Duplicata" ? "35€" : "0.00"}
                           required
                         />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type de paiement *</Label>
                         <Select onValueChange={(value) => {
                           setNewPayment(prev => ({ 
                             ...prev, 
                             type: value,
                             dueDate: calculateDueDate(value),
                             amount: value === "Frais de dossier" ? "500" : value === "Frais d'envoi" ? "120" : value === "Duplicata" ? "35" : prev.amount
                           }));
                         }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Frais de dossier">Frais de dossier</SelectItem>
                            <SelectItem value="Minerval">Minerval</SelectItem>
                            <SelectItem value="Frais d'envoi">Frais d'envoi</SelectItem>
                            <SelectItem value="Duplicata">Duplicata</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="dueDate">Date d'échéance *</Label>
                         <Input
                           id="dueDate"
                           type="date"
                           value={newPayment.dueDate}
                           onChange={(e) => setNewPayment(prev => ({ ...prev, dueDate: e.target.value }))}
                           placeholder={newPayment.type === 'Frais de dossier' || newPayment.type === "Frais d'envoi" || newPayment.type === 'Duplicata' ? '14 jours' : newPayment.type === 'Minerval' ? '31 décembre' : ''}
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

                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Générer la facture
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

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
                  <Button onClick={() => setShowAddPayment(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un paiement
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <Card key={payment.id} className={`hover:shadow-soft transition-shadow ${isPaymentOverdue(payment) ? 'border-red-400 bg-red-100/50' : ''}`}>
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
                                  <Badge className="bg-red-500 text-white">
                                    Non générée
                                  </Badge>
                                );
                              } else {
                                return (
                                  <Badge className={getStatusBadgeColor(payment.status)}>
                                    {payment.status}
                                  </Badge>
                                );
                              }
                            })()}
                            <Badge variant="outline">{payment.type}</Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm">
                              <strong>Montant:</strong> {payment.amount}€
                            </span>
                            <span className="text-sm">
                              <strong>Échéance:</strong> {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          
                          {(() => {
                            return payment.academicYear && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Année académique : {payment.academicYear} - {payment.studyYear === 1 ? '1ère année' : `${payment.studyYear}ème année`}
                              </p>
                            );
                          })()}
                           
                           {payment.paidDate && payment.method && (
                             <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                               <span><strong>Payé le:</strong> {new Date(payment.paidDate).toLocaleDateString('fr-FR')}</span>
                               <span><strong>Moyen:</strong> {payment.method}</span>
                             </div>
                           )}
                        </div>
                        
                         <div className="flex gap-2">
                           {(() => {
                             const existingInvoice = getExistingInvoice(payment);
                             const hasInvoice = !!existingInvoice;
                             
                             return hasInvoice ? (
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => generateInvoiceDocument(payment, true)}
                               >
                                 <Receipt className="h-4 w-4 mr-1" />
                                 Télécharger PDF
                               </Button>
                             ) : (
                               <Button
                                 size="sm"
                                 onClick={() => generateInvoiceDocument(payment, false)}
                               >
                                 <Receipt className="h-4 w-4 mr-1" />
                                 Générer facture
                               </Button>
                             );
                           })()}
                          
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => openPaymentSummary(payment)}
                           >
                             <Eye className="h-4 w-4 mr-1" />
                             Récapitulatif
                           </Button>
                           
                           {payment.type === 'Minerval' && (() => {
                             const student = getStudent(payment.studentId);
                             return student && student.program !== 'MBA Complémentaire';
                           })() && (
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => generatePaymentSchedule(payment)}
                             >
                               <Calendar className="h-4 w-4 mr-1" />
                               Échéancier
                             </Button>
                           )}
                           
                           {payment.status === 'En attente' && (
                             <Button
                               variant="default"
                               size="sm"
                               onClick={() => openPaymentDialog(payment.id)}
                             >
                               <>
                                 <Euro className="h-4 w-4 mr-1" />
                                 Paiement
                               </>
                             </Button>
                           )}

                         </div>
                       </div>
                       
                       {/* Encadré d'avancement des paiements en dessous - complètement séparé */}
                       {payment.status === 'En attente' && (
                         <div className={`mt-4 p-3 rounded-md shadow-sm ${isPaymentOverdue(payment) ? 'bg-gradient-to-r from-red-100 to-rose-100 border border-red-400' : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'}`}>
                           <div className={`text-sm font-medium ${isPaymentOverdue(payment) ? 'text-red-900' : 'text-amber-800'}`}>
                             Payé: {getTotalPaidForPayment(payment)}€ - Reste: {getRemainingAmount(payment)}€
                           </div>
                         </div>
                       )}
                       
                       {/* Informations de la facture en dessous de l'encadré */}
                       {(() => {
                         const existingInvoice = getExistingInvoice(payment);
                         return existingInvoice && (
                           <p className="text-xs text-primary font-medium mt-3">
                             <strong>Facture : {existingInvoice.number}</strong> - 
                             Générée le {new Date(existingInvoice.generate_date).toLocaleDateString("fr-FR")}
                           </p>
                         );
                       })()}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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

            {/* Dialog récapitulatif de paiements */}
            <Dialog open={showPaymentSummary} onOpenChange={setShowPaymentSummary}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Récapitulatif des paiements</DialogTitle>
                  <DialogDescription>
                    Détail des paiements pour {selectedPaymentForSummary && getStudentName(selectedPaymentForSummary.studentId)}
                  </DialogDescription>
                </DialogHeader>
                {selectedPaymentForSummary && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type de paiement</Label>
                        <p className="font-medium">{selectedPaymentForSummary.type}</p>
                      </div>
                      <div>
                        <Label>Montant total</Label>
                        <p className="font-medium">{selectedPaymentForSummary.amount}€</p>
                      </div>
                      <div>
                        <Label>Échéance</Label>
                        <p className="font-medium">{new Date(selectedPaymentForSummary.dueDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <Label>Statut</Label>
                        <div className="mt-2">
                          <Badge className={`${getStatusBadgeColor(selectedPaymentForSummary.status)} text-white`}>
                            {selectedPaymentForSummary.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {selectedPaymentForSummary.type === 'Minerval' && selectedPaymentForSummary.installments && (
                      <div>
                        <Label className="text-base font-semibold">Historique des paiements</Label>
                        {selectedPaymentForSummary.installments.length === 0 ? (
                          <p className="text-muted-foreground mt-2">Aucun paiement enregistré</p>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {selectedPaymentForSummary.installments.map((installment, index) => (
                              <div key={installment.id} className="flex justify-between items-center p-3 border rounded">
                                <div>
                                  <p className="font-medium">Paiement #{index + 1}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(installment.paidDate).toLocaleDateString('fr-FR')} - {installment.method}
                                  </p>
                                </div>
                                <p className="font-semibold">{installment.amount}€</p>
                              </div>
                            ))}
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between items-center font-semibold">
                                <span>Total payé:</span>
                                <span>{getTotalPaidForPayment(selectedPaymentForSummary)}€</span>
                              </div>
                              <div className="flex justify-between items-center text-muted-foreground">
                                <span>Reste à payer:</span>
                                <span>{getRemainingAmount(selectedPaymentForSummary)}€</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedPaymentForSummary.status === 'Payé' && !selectedPaymentForSummary.installments && (
                      <div>
                        <Label className="text-base font-semibold">Informations de paiement</Label>
                        <div className="mt-2 p-3 border rounded">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Paiement complet</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedPaymentForSummary.paidDate && new Date(selectedPaymentForSummary.paidDate).toLocaleDateString('fr-FR')} - {selectedPaymentForSummary.method}
                              </p>
                            </div>
                            <p className="font-semibold">{selectedPaymentForSummary.amount}€</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <DialogFooter>
                  <Button onClick={() => generatePaymentSummaryDocument(selectedPaymentForSummary)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimer
                  </Button>
                  <Button variant="outline" onClick={() => setShowPaymentSummary(false)}>
                    Fermer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentManagement;