import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useStudents } from '@/hooks/useStudents';
import { usePayments } from '@/hooks/usePayments';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, ArrowLeft, CreditCard, Receipt, FileCheck } from "lucide-react";
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

  useEffect(() => {
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
  }, [studentId, getStudentById, getPaymentsByStudentId, getAttestationsByStudentId, getInvoicesByStudentId]);

  const generateAttestationNumber = (student: Student): string => {
    const year = new Date().getFullYear();
    const studentCode = student.reference.split('-')[0] || student.id.slice(0, 4).toUpperCase();
    return `ATT-${year}-${studentCode}-${student.studyYear}`;
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
        const newAttestationData = {
          student_id: student.id,
          number: generateAttestationNumber(student),
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

  const generateInvoiceNumber = (student: Student, payment: Payment): string => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const studentCode = student.reference.split('-')[0] || student.id.slice(0, 4).toUpperCase();
    const typeCode = payment.type === 'Frais de dossier' ? 'FD' : 
                     payment.type === 'Minerval' ? 'MIN' : 'FAC';
    return `IPEC-${year}${month}-${studentCode}-${typeCode}`;
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
      i.academic_year === student?.academicYear &&
      i.study_year === student?.studyYear
    );
  };

  const generateInvoiceDoc = async (payment: Payment, isDuplicate = false) => {
    if (!student) return;
    
    try {
      let invoice = getExistingInvoice(payment);
      
      // Si c'est une première génération, créer la facture dans Supabase
      if (!invoice && !isDuplicate) {
        const newInvoiceData = {
          student_id: student.id,
          payment_id: payment.id,
          number: generateInvoiceNumber(student, payment),
          amount: payment.amount,
          type: payment.type,
          academic_year: payment.type !== 'Frais de dossier' ? student.academicYear : null,
          study_year: payment.type !== 'Frais de dossier' ? student.studyYear : null,
          generate_date: student.registrationDate
        };
        
        const createdInvoice = await createInvoice(newInvoiceData);
        setInvoices(prev => [...prev, createdInvoice]);
        invoice = createdInvoice;
      }
      
      if (!invoice) return;
      
      const pdfBytes = await fillInvoicePdfWithPositions(student, payment, invoice.number);
      const filename = isDuplicate 
        ? `duplicata-facture-${student.firstName}-${student.lastName}-${invoice.number}.pdf`
        : `facture-${student.firstName}-${student.lastName}-${invoice.number}.pdf`;
      downloadPdf(pdfBytes, filename);
      
      toast({
        title: isDuplicate ? "Duplicata téléchargé" : "Facture générée",
        description: isDuplicate 
          ? `Duplicata de la facture ${invoice.number} téléchargé.`
          : `Facture ${invoice.number} générée pour ${payment.amount}€.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer la facture",
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
          <Link to="/payments">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux paiements
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
                      <div className="p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {student?.program} - {student?.studyYear === 1 ? '1ère année' : `${student?.studyYear}ème année`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Année académique : {student?.academicYear}
                            </p>
                            {attestation && (
                              <p className="text-xs text-muted-foreground">
                                Attestation : {attestation.number} 
                                {attestation.generate_date && 
                                  ` - Générée le ${new Date(attestation.generate_date).toLocaleDateString('fr-FR')}`
                                }
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {hasAttestation ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generateRegistrationDoc(true)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Duplicata
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => generateRegistrationDoc(false)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Générer l'attestation
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Attestations des années précédentes */}
                  {attestations
                    .filter(a => !(a.academic_year === student?.academicYear && a.study_year === student?.studyYear))
                    .sort((a, b) => new Date(b.created_at || b.generate_date).getTime() - new Date(a.created_at || a.generate_date).getTime())
                    .map((attestation) => (
                      <div key={attestation.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {attestation.program} - {attestation.study_year === 1 ? '1ère année' : `${attestation.study_year}ème année`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Année académique : {attestation.academic_year}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Attestation : {attestation.number} - 
                              Générée le {new Date(attestation.generateDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Créer un student temporaire avec les données de l'attestation
                              const tempStudent = {
                                ...student!,
                                program: attestation.program as Student['program'],
                                studyYear: attestation.studyYear,
                                academicYear: attestation.academicYear,
                                specialty: attestation.specialty
                              };
                              fillRegistrationPdfWithPositions(tempStudent, attestation.number)
                                .then(pdfBytes => {
                                  const filename = `duplicata-attestation-${student?.firstName}-${student?.lastName}-${attestation.number}.pdf`;
                                  downloadPdf(pdfBytes, filename);
                                  toast({
                                    title: "Duplicata téléchargé",
                                    description: `Duplicata de l'attestation ${attestation.number} téléchargé.`,
                                  });
                                })
                                .catch(error => {
                                  toast({
                                    title: "Erreur",
                                    description: "Impossible de télécharger le duplicata",
                                    variant: "destructive",
                                  });
                                });
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Duplicata
                          </Button>
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
                    <Link to={`/payments?studentId=${studentId}`}>
                      <Button variant="outline">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Ajouter un paiement
                      </Button>
                    </Link>
                  </div>
                  
                  {payments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Aucun paiement enregistré pour cet étudiant.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {payments.map((payment) => {
                        const existingInvoice = getExistingInvoice(payment);
                        const hasInvoice = !!existingInvoice;
                        
                        return (
                          <div key={payment.id} className="p-4 border rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{payment.type}</p>
                                <p className="text-sm text-muted-foreground">
                                  {payment.description}
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm">
                                    <strong>Montant:</strong> {payment.amount}€
                                  </span>
                                  <span className="text-sm">
                                    <strong>Échéance:</strong> {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                                  </span>
                                  <span className={`text-sm px-2 py-1 rounded-full text-xs font-medium ${ 
                                    payment.status === 'Payé' ? 'bg-green-100 text-green-800' :
                                    payment.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                                    payment.status === 'En retard' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {payment.status}
                                  </span>
                                </div>
                                {payment.academicYear && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Année académique : {payment.academicYear} - {payment.studyYear === 1 ? '1ère année' : `${payment.studyYear}ème année`}
                                  </p>
                                )}
                                {existingInvoice && (
                                  <p className="text-xs text-primary font-medium mt-1">
                                    <strong>Facture : {existingInvoice.number}</strong> - 
                                    Générée le {new Date(existingInvoice.generateDate).toLocaleDateString('fr-FR')}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {hasInvoice ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => generateInvoiceDoc(payment, true)}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Duplicata
                                  </Button>
                                ) : (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => generateInvoiceDoc(payment, false)}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Télécharger
                                  </Button>
                                )}
                              </div>
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
      </div>
    </div>
  );
};

export default DocumentGeneration;