import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, ArrowLeft, CreditCard, Receipt, FileCheck } from "lucide-react";
import { Student, Payment, RegistrationAttestation } from "@/types";
import { 
  generateRegistrationDocument, 
  generateInvoice, 
  generateCreditNote, 
  downloadDocument,
  generateCreditNoteNumber
} from "@/utils/documentGenerator";
import { fillRegistrationPdfWithPositions, fillInvoicePdfWithPositions, fillCreditNotePdf, downloadPdf } from "@/utils/positionPdfFiller";

const DocumentGeneration = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [creditNoteReason, setCreditNoteReason] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showCreditNoteForm, setShowCreditNoteForm] = useState(false);
  const [attestations, setAttestations] = useState<RegistrationAttestation[]>([]);

  useEffect(() => {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    const storedAttestations = JSON.parse(localStorage.getItem('attestations') || '[]');
    
    const foundStudent = students.find((s: Student) => s.id === studentId);
    if (foundStudent) {
      setStudent(foundStudent);
    }
    
    const studentPayments = storedPayments.filter((p: Payment) => p.studentId === studentId);
    setPayments(studentPayments);
    
    const studentAttestations = storedAttestations.filter((a: RegistrationAttestation) => a.studentId === studentId);
    setAttestations(studentAttestations);
  }, [studentId]);

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
    const key = getCurrentAttestationKey();
    return attestations.find(a => 
      a.studentId === student?.id && 
      a.academicYear === student?.academicYear && 
      a.studyYear === student?.studyYear
    );
  };

  const generateRegistrationDoc = async (isDuplicate = false) => {
    if (!student) return;
    
    try {
      let attestation = getCurrentAttestation();
      
      // Si c'est une première génération, créer l'attestation
      if (!attestation && !isDuplicate) {
        const newAttestation: RegistrationAttestation = {
          id: crypto.randomUUID(),
          studentId: student.id,
          number: generateAttestationNumber(student),
          academicYear: student.academicYear,
          studyYear: student.studyYear,
          generateDate: new Date().toISOString(),
          program: student.program,
          specialty: student.specialty
        };
        
        // Sauvegarder l'attestation
        const allAttestations = JSON.parse(localStorage.getItem('attestations') || '[]');
        allAttestations.push(newAttestation);
        localStorage.setItem('attestations', JSON.stringify(allAttestations));
        
        setAttestations(prev => [...prev, newAttestation]);
        attestation = newAttestation;
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

  const generateInvoiceDoc = async (payment: Payment) => {
    if (!student) return;
    
    try {
      const pdfBytes = await fillInvoicePdfWithPositions(student, payment);
      const filename = `facture-${payment.id}-${student.firstName}-${student.lastName}.pdf`;
      downloadPdf(pdfBytes, filename);
      
      toast({
        title: "Facture générée",
        description: `La facture pour le paiement de ${payment.amount}€ a été générée.`,
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

      // Mettre à jour le statut du paiement
      const updatedPayments = payments.map(p => 
        p.id === selectedPayment.id 
          ? { ...p, status: 'Remboursé' as Payment['status'] }
          : p
      );
      setPayments(updatedPayments);
      
      // Sauvegarder dans localStorage
      const allPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      const globalUpdatedPayments = allPayments.map((p: Payment) => 
        p.id === selectedPayment.id 
          ? { ...p, status: 'Remboursé' as Payment['status'] }
          : p
      );
      localStorage.setItem('payments', JSON.stringify(globalUpdatedPayments));
      
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
                    const currentAttestation = getCurrentAttestation();
                    const hasCurrentAttestation = !!currentAttestation;
                    
                    return (
                      <div className="p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {student?.program} - {student?.studyYear}ème année
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Année académique : {student?.academicYear}
                            </p>
                            {currentAttestation && (
                              <p className="text-xs text-muted-foreground">
                                Attestation : {currentAttestation.number} 
                                {currentAttestation.generateDate && 
                                  ` - Générée le ${new Date(currentAttestation.generateDate).toLocaleDateString('fr-FR')}`
                                }
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {hasCurrentAttestation ? (
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
                    .filter(a => !(a.academicYear === student?.academicYear && a.studyYear === student?.studyYear))
                    .sort((a, b) => new Date(b.generateDate).getTime() - new Date(a.generateDate).getTime())
                    .map((attestation) => (
                      <div key={attestation.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {attestation.program} - {attestation.studyYear}ème année
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Année académique : {attestation.academicYear}
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
                  
                  {attestations.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Aucune attestation générée pour cet étudiant.
                    </p>
                  )}
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
                {payments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Aucun paiement enregistré pour cet étudiant.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.amount}€ - {payment.type} - {payment.status}
                          </p>
                          {payment.invoiceNumber && (
                            <p className="text-xs text-muted-foreground">
                              Facture: {payment.invoiceNumber}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateInvoiceDoc(payment)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Facture
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Credit Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-destructive" />
                  Notes de crédit
                </CardTitle>
                <CardDescription>
                  Générer des notes de crédit pour les remboursements
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