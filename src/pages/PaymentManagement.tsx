import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, ArrowLeft, Plus, Eye, Receipt, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Student, Payment } from "@/types";
import { generateInvoiceNumber, generateInvoice, downloadDocument } from "@/utils/documentGenerator";

const PaymentManagement = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [newPayment, setNewPayment] = useState({
    amount: "",
    dueDate: "",
    type: "",
    description: "",
    method: ""
  });

  useEffect(() => {
    const storedStudents = localStorage.getItem('students');
    const storedPayments = localStorage.getItem('payments');
    
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }
    if (storedPayments) {
      setPayments(JSON.parse(storedPayments));
    }
  }, []);

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !newPayment.amount || !newPayment.dueDate || !newPayment.type) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const payment: Payment = {
      id: Date.now().toString(),
      studentId: selectedStudent,
      amount: parseFloat(newPayment.amount),
      dueDate: newPayment.dueDate,
      status: 'En attente',
      type: newPayment.type as Payment['type'],
      description: newPayment.description || `${newPayment.type} - ${getStudentName(selectedStudent)}`,
      method: newPayment.method as Payment['method'],
      invoiceNumber: generateInvoiceNumber()
    };

    const updatedPayments = [...payments, payment];
    setPayments(updatedPayments);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));

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
      method: ""
    });
    setSelectedStudent("");
    setShowAddPayment(false);
  };

  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : "Étudiant inconnu";
  };

  const getStudent = (studentId: string): Student | undefined => {
    return students.find(s => s.id === studentId);
  };

  const markAsPaid = (paymentId: string) => {
    const updatedPayments = payments.map(p => 
      p.id === paymentId 
        ? { ...p, status: 'Payé' as Payment['status'], paidDate: new Date().toISOString() }
        : p
    );
    setPayments(updatedPayments);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));
    
    toast({
      title: "Paiement confirmé",
      description: "Le paiement a été marqué comme payé.",
    });
  };

  const generateInvoiceDocument = (payment: Payment) => {
    const student = getStudent(payment.studentId);
    if (!student) {
      toast({
        title: "Erreur",
        description: "Étudiant non trouvé.",
        variant: "destructive",
      });
      return;
    }

    const invoiceHtml = generateInvoice(student, payment);
    downloadDocument(invoiceHtml, `Facture_${payment.invoiceNumber}_${student.lastName}.html`);
    
    toast({
      title: "Facture générée",
      description: "La facture a été téléchargée avec succès.",
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
    return payments
      .filter(p => p.status === 'Payé')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getPendingAmount = () => {
    return payments
      .filter(p => p.status === 'En attente')
      .reduce((total, payment) => total + payment.amount, 0);
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
                        <Select onValueChange={(value) => setNewPayment(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inscription">Inscription</SelectItem>
                            <SelectItem value="Frais mensuel">Frais mensuel</SelectItem>
                            <SelectItem value="Matériel">Matériel</SelectItem>
                            <SelectItem value="Examen">Examen</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
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
                          required
                        />
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
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <p><strong>Montant:</strong> {payment.amount}€</p>
                            <p><strong>Échéance:</strong> {new Date(payment.dueDate).toLocaleDateString('fr-FR')}</p>
                            <p><strong>Facture:</strong> {payment.invoiceNumber}</p>
                            {payment.paidDate && (
                              <p><strong>Payé le:</strong> {new Date(payment.paidDate).toLocaleDateString('fr-FR')}</p>
                            )}
                          </div>

                          {payment.description && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              {payment.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateInvoiceDocument(payment)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Facture
                          </Button>
                          
                          {payment.status === 'En attente' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => markAsPaid(payment.id)}
                            >
                              <Receipt className="mr-2 h-4 w-4" />
                              Marquer payé
                            </Button>
                          )}
                          
                          <Link to={`/documents/${payment.studentId}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Documents
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentManagement;