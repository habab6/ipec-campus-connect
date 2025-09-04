import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Student, Payment } from "@/types";
import { 
  generateStudentReference, 
  BUSINESS_SPECIALTIES, 
  COUNTRIES, 
  PROGRAM_PRICES, 
  REGISTRATION_FEE,
  canEnrollMBAComplementaire,
  getStudyYearOptions
} from "@/utils/studentUtils";
import { generateInvoiceNumber } from "@/utils/documentGenerator";

interface StudentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  countryOfBirth: string;
  address: string;
  program: 'BBA' | 'MBA' | 'MBA Complémentaire' | '';
  studyYear: number;
  specialty: string;
  notes: string;
  hasMBA2Diploma: boolean;
}

const StudentRegistration = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<StudentData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    countryOfBirth: "",
    address: "",
    program: "",
    studyYear: 1,
    specialty: "",
    notes: "",
    hasMBA2Diploma: false,
  });

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.program || !formData.dateOfBirth || !formData.countryOfBirth) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires (*, date de naissance et pays).",
        variant: "destructive",
      });
      return;
    }

    // Validation MBA Complémentaire
    if (formData.program === 'MBA Complémentaire' && !canEnrollMBAComplementaire(formData.hasMBA2Diploma)) {
      toast({
        title: "Erreur",
        description: "Le MBA Complémentaire est réservé aux diplômés MBA2 d'IPEC Bruxelles.",
        variant: "destructive",
      });
      return;
    }

    // Générer la référence unique
    const currentYear = new Date().getFullYear();
    const reference = generateStudentReference(
      formData.firstName,
      formData.lastName,
      formData.dateOfBirth,
      formData.countryOfBirth,
      currentYear
    );

    // Créer l'étudiant
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const newStudent: Student = {
      id: Date.now().toString(),
      reference,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      countryOfBirth: formData.countryOfBirth,
      address: formData.address,
      program: formData.program as 'BBA' | 'MBA' | 'MBA Complémentaire',
      studyYear: formData.studyYear,
      specialty: formData.specialty,
      notes: formData.notes,
      registrationDate: new Date().toISOString(),
      registrationYear: currentYear,
      status: "Actif",
      hasMBA2Diploma: formData.hasMBA2Diploma
    };
    
    students.push(newStudent);
    localStorage.setItem('students', JSON.stringify(students));

    // Créer les paiements (frais de dossier + minerval)
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const programPrice = PROGRAM_PRICES[formData.program as keyof typeof PROGRAM_PRICES];
    
    // Calculer les échéances selon les règles
    const today = new Date();
    
    // Frais de dossier - 14 jours calendaires
    const registrationDueDate = new Date(today);
    registrationDueDate.setDate(today.getDate() + 14);
    
    // Minerval - 31 décembre de l'année en cours
    const minervalDueDate = new Date(today.getFullYear(), 11, 31); // mois 11 = décembre
    
    // Petite pause pour assurer des numéros de facture différents
    const baseTimestamp = Date.now();
    
    // Frais de dossier
    const registrationPayment: Payment = {
      id: `reg-${baseTimestamp}`,
      studentId: newStudent.id,
      amount: REGISTRATION_FEE,
      dueDate: registrationDueDate.toISOString().split('T')[0],
      status: 'En attente',
      type: 'Frais de dossier',
      description: 'Frais de dossier d\'inscription',
      invoiceNumber: generateInvoiceNumber()
    };

    // Attendre 1ms pour avoir un timestamp différent
    await new Promise(resolve => setTimeout(resolve, 1));

    // Minerval (frais annuels)
    const tuitionPayment: Payment = {
      id: `tuition-${baseTimestamp + 1}`,
      studentId: newStudent.id,
      amount: programPrice,
      dueDate: minervalDueDate.toISOString().split('T')[0],
      status: 'En attente',
      type: 'Minerval',
      description: `Minerval annuel - ${formData.program}`,
      invoiceNumber: generateInvoiceNumber()
    };

    payments.push(registrationPayment, tuitionPayment);
    localStorage.setItem('payments', JSON.stringify(payments));

    toast({
      title: "Inscription réussie !",
      description: `${formData.firstName} ${formData.lastName} a été inscrit avec la référence ${reference}. Deux factures ont été générées.`,
    });

    // Reset du formulaire
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      countryOfBirth: "",
      address: "",
      program: "",
      studyYear: 1,
      specialty: "",
      notes: "",
      hasMBA2Diploma: false,
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        <Card className="shadow-medium">
          <CardHeader className="text-center bg-gradient-primary text-primary-foreground rounded-t-lg">
            <UserPlus className="h-12 w-12 mx-auto mb-4" />
            <CardTitle className="text-2xl">Inscription Étudiant</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Ajoutez un nouvel étudiant à IPEC Bruxelles
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Entrez le prénom"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Entrez le nom"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@exemple.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+32 x xx xx xx xx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="countryOfBirth">Pays de naissance *</Label>
                  <Select onValueChange={(value) => handleInputChange('countryOfBirth', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="program">Programme * 
                    <span className="text-sm text-muted-foreground ml-2">
                      (BBA: 5000€, MBA: 6000€, MBA Comp.: 3000€)
                    </span>
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('program', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un programme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BBA">BBA - 5000€/an</SelectItem>
                      <SelectItem value="MBA">MBA - 6000€/an</SelectItem>
                      <SelectItem value="MBA Complémentaire">MBA Complémentaire - 3000€/an</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="studyYear">Année d'étude</Label>
                  <Select onValueChange={(value) => handleInputChange('studyYear', value)} value={formData.studyYear.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez l'année" />
                    </SelectTrigger>
                    <SelectContent>
                      {getStudyYearOptions(formData.program).map((year) => (
                        <SelectItem key={year} value={year.toString()}>Année {year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="specialty">Spécialité Business</Label>
                <Select onValueChange={(value) => handleInputChange('specialty', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.program === 'MBA Complémentaire' && (
                <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hasMBA2Diploma"
                      checked={formData.hasMBA2Diploma}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, hasMBA2Diploma: checked as boolean }))
                      }
                    />
                    <Label htmlFor="hasMBA2Diploma" className="text-sm">
                      Je certifie être diplômé MBA2 d'IPEC Bruxelles
                    </Label>
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                    Le MBA Complémentaire est exclusivement réservé aux diplômés MBA2 de notre institut.
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Adresse complète"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes additionnelles</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Informations supplémentaires..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <UserPlus className="mr-2 h-4 w-4" />
                Inscrire l'étudiant
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentRegistration;