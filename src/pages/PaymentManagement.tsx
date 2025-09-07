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
import { CreditCard, ArrowLeft, Plus, Eye, Receipt, FileText, Euro, Printer } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Student, Payment } from "@/types";
import { generateInvoice, generatePaymentSummary, downloadDocument } from "@/utils/documentGenerator";
import { supabase } from "@/integrations/supabase/client";

const PaymentManagement = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { students } = useStudents();
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

  // Gérer les paramètres URL pour auto-sélectionner l'étudiant et ouvrir le formulaire
  useEffect(() => {
    const studentId = searchParams.get('studentId');
    const paymentId = searchParams.get('paymentId');
    
    if (studentId) {
      setSelectedStudent(studentId);
      
      // Si un paymentId est fourni, ouvrir le formulaire d'ajout de paiement
      if (paymentId) {
        setShowAddPayment(true);
      }
    }
  }, [searchParams]);

  // Les données sont maintenant chargées via les hooks useStudents et usePayments

  const calculateDueDate = (type: string): string => {
    const today = new Date();
    
    if (type === 'Frais de dossier') {
      // 14 jours calendaires après aujourd'hui
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
        paidDate: newPayment.paidDate || undefined
      };

      await createPayment(payment);

      toast({
        title: "Paiement ajouté !",
        description: `Nouveau paiement créé pour ${getStudentName(selectedStudent)}.`,
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
      toast({
        title: "Erreur",
        description: "Impossible de créer le paiement.",
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
        description: "Le paiement a été marqué comme payé.",
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
      // Pour le minerval, ouvrir le dialogue d'acompte
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
        title: "Acompte ajouté",
        description: `Acompte de ${amount}€ enregistré avec succès.`,
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
        description: "Impossible d'ajouter l'acompte.",
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
        // Ajouter les acomptes pour les paiements partiels
        return total + getTotalPaidForPayment(payment);
      }
      return total;
    }, 0);
  };

  const getPendingAmount = () => {
    return payments.reduce((total, payment) => {
      if (payment.status === 'En attente') {
        // Pour les paiements en attente, soustraire les acomptes déjà payés
        const remainingAmount = getRemainingAmount(payment);
        return total + remainingAmount;
      }
      return total;
    }, 0);
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
              <p className="text-3xl font-bold text-primary">{getTotalAmount()}€</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Montant payé</h3>
              <p className="text-3xl font-bold text-secondary">{getPaidAmount()}€</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">En attente</h3>
              <p className="text-3xl font-bold text-yellow-600">{getPendingAmount()}€</p>
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
                {showAddPayment ? 'Annuler' : 'Nouveau paiement'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {showAddPayment && (
              <Card className="mb-6 border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Ajouter un nouveau paiement</CardTitle>
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
                          placeholder="0.00"
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
                            dueDate: calculateDueDate(value)
                          }));
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Frais de dossier">Frais de dossier</SelectItem>
                            <SelectItem value="Minerval">Minerval</SelectItem>
                            <SelectItem value="Frais mensuel">Frais mensuel</SelectItem>
                            <SelectItem value="Matériel">Matériel</SelectItem>
                            <SelectItem value="Examen">Examen</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="dueDate">Date d'échéance {newPayment.type && (newPayment.type === 'Frais de dossier' || newPayment.type === 'Minerval') ? '(automatique)' : '*'}</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newPayment.dueDate}
                          onChange={(e) => setNewPayment(prev => ({ ...prev, dueDate: e.target.value }))}
                          placeholder={newPayment.type === 'Frais de dossier' ? '14 jours' : newPayment.type === 'Minerval' ? '31 décembre' : ''}
                        />
                        {newPayment.type === 'Frais de dossier' && (
                          <p className="text-xs text-muted-foreground mt-1">Échéance automatique: 14 jours calendaires</p>
                        )}
                        {newPayment.type === 'Minerval' && (
                          <p className="text-xs text-muted-foreground mt-1">Échéance automatique: 31 décembre {new Date().getFullYear()}</p>
                        )}
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
                            <SelectItem value="Carte">Carte bancaire</SelectItem>
                            <SelectItem value="Virement">Virement bancaire</SelectItem>
                            <SelectItem value="Chèque">Chèque</SelectItem>
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
                      Ajouter le paiement
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Payments List */}
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun paiement enregistré</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par ajouter un premier paiement.
                </p>
                <Button onClick={() => setShowAddPayment(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un paiement
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <Card key={payment.id} className="hover:shadow-soft transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              {getStudentName(payment.studentId)}
                            </h3>
                            <Badge className={getStatusBadgeColor(payment.status)}>
                              {payment.status}
                            </Badge>
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
                          
                          {(() => {
                            const existingInvoice = getExistingInvoice(payment);
                            return existingInvoice && (
                              <p className="text-xs text-primary font-medium mt-1">
                                <strong>Facture : {existingInvoice.number}</strong> - 
                                Générée le {new Date(existingInvoice.generate_date).toLocaleDateString('fr-FR')}
                              </p>
                            );
                          })()}
                          
                          {payment.paidDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <strong>Payé le:</strong> {new Date(payment.paidDate).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                          {payment.method && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <strong>Moyen:</strong> {payment.method}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateInvoiceDocument(payment)}
                          >
                            <Receipt className="h-4 w-4 mr-1" />
                            Facture
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPaymentSummary(payment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Récapitulatif
                          </Button>
                          
                          {payment.status === 'En attente' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openPaymentDialog(payment.id)}
                            >
                              {payment.type === 'Minerval' ? (
                                <>
                                  <Euro className="h-4 w-4 mr-1" />
                                  Ajouter acompte
                                </>
                              ) : (
                                'Marquer payé'
                              )}
                            </Button>
                          )}

                          {payment.type === 'Minerval' && payment.installments && payment.installments.length > 0 && payment.status === 'En attente' && (
                            <div className="text-xs text-muted-foreground">
                              Payé: {getTotalPaidForPayment(payment)}€ / {payment.amount}€
                              <br />
                              Reste: {getRemainingAmount(payment)}€
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Dialog pour marquer comme payé */}
            <Dialog open={paymentDialog.isOpen} onOpenChange={(open) => setPaymentDialog(prev => ({ ...prev, isOpen: open }))}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Marquer le paiement comme payé</DialogTitle>
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
                        <SelectItem value="Carte">Carte bancaire</SelectItem>
                        <SelectItem value="Chèque">Chèque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPaymentDialog(prev => ({ ...prev, isOpen: false }))}>
                    Annuler
                  </Button>
                  <Button onClick={handleMarkAsPaid}>
                    Confirmer le paiement
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog pour acompte minerval */}
            <Dialog open={installmentDialog.isOpen} onOpenChange={(open) => setInstallmentDialog(prev => ({ ...prev, isOpen: open }))}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un acompte pour le minerval</DialogTitle>
                  <DialogDescription>
                    Enregistrez un paiement partiel pour le minerval
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="installmentAmount">Montant de l'acompte (€)</Label>
                    <Input
                      id="installmentAmount"
                      type="number"
                      step="0.01"
                      value={installmentDialog.amount}
                      onChange={(e) => setInstallmentDialog(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
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
                        <SelectItem value="Carte">Carte bancaire</SelectItem>
                        <SelectItem value="Chèque">Chèque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInstallmentDialog(prev => ({ ...prev, isOpen: false }))}>
                    Annuler
                  </Button>
                  <Button onClick={addInstallment}>
                    Ajouter l'acompte
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
                                  <p className="font-medium">Acompte #{index + 1}</p>
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