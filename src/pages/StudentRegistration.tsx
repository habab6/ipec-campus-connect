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
import { Link, useNavigate } from "react-router-dom";
import { Student, Payment } from "@/types";
import { useStudents } from "@/hooks/useStudents";
import { supabase } from '@/integrations/supabase/client';
import { 
  generateStudentReference, 
  BUSINESS_SPECIALTIES, 
  PROGRAM_PRICES, 
  REGISTRATION_FEE,
  canEnrollMBAComplementaire,
  getStudyYearOptions
} from "@/utils/studentUtils";
import { COUNTRIES } from "@/utils/countries";
import { NATIONALITIES } from "@/utils/nationalities";
import { COUNTRY_TO_NATIONALITY, COUNTRY_CODE_TO_NAME } from "@/utils/countryToNationality";
import { WORLD_CITIES_LIST, WORLD_CITIES_MAPPING } from "@/utils/worldCities";
import { generateInvoiceNumber } from "@/utils/documentGenerator";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface StudentData {
  // Informations personnelles
  civilite: 'M.' | 'Mme' | 'Mlle' | 'Mx' | '';
  firstName: string;
  lastName: string;
  // Informations de naissance
  dateOfBirth: string;
  cityOfBirth: string;
  countryOfBirth: string;
  nationality: string;
  // Documents d'identité
  identityNumber: string;
  // Contact
  phone: string;
  email: string;
  address: string;
  // Informations académiques
  program: 'BBA' | 'MBA' | 'MBA Complémentaire' | '';
  studyYear: number;
  specialty: string;
  academicYear: string;
  // Système
  notes: string;
  hasMBA2Diploma: boolean;
}

const StudentRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createStudent } = useStudents();

  // Fonction pour créer les paiements par défaut
  const createDefaultPayments = async (student: Student) => {
    const currentDate = new Date();
    const fraisDossierDueDate = new Date(currentDate);
    fraisDossierDueDate.setDate(currentDate.getDate() + 14);
    
    const minervalDueDate = new Date(currentDate.getFullYear(), 11, 31); // 31 décembre

    const payments = [
      {
        student_id: student.id,
        amount: 200, // Frais de dossier
        due_date: fraisDossierDueDate.toISOString().split('T')[0],
        status: 'En attente',
        type: 'Frais de dossier',
        description: `Frais de dossier - ${student.firstName} ${student.lastName}`,
        academic_year: student.academicYear,
        study_year: student.studyYear
      },
      {
        student_id: student.id,
        amount: 3000, // Minerval
        due_date: minervalDueDate.toISOString().split('T')[0],
        status: 'En attente',
        type: 'Minerval',
        description: `Minerval ${student.academicYear} - ${student.firstName} ${student.lastName}`,
        academic_year: student.academicYear,
        study_year: student.studyYear
      }
    ];

    try {
      console.log('Tentative d\'insertion des paiements:', payments);
      const { error } = await supabase
        .from('payments')
        .insert(payments);

      if (error) {
        console.error('Erreur Supabase lors de l\'insertion des paiements:', error);
        throw error;
      }
      console.log('Paiements par défaut créés pour l\'étudiant:', student.id);
    } catch (error) {
      console.error('Erreur lors de la création des paiements par défaut:', error);
    }
  };
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState<StudentData>({
    civilite: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    cityOfBirth: "",
    countryOfBirth: "",
    nationality: "",
    identityNumber: "",
    phone: "",
    email: "",
    address: "",
    program: "",
    studyYear: 1,
    specialty: "",
    academicYear: `${currentYear}-${currentYear + 1}`,
    notes: "",
    hasMBA2Diploma: false,
  });

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-préchargement de la nationalité en fonction du pays de naissance
      if (field === 'countryOfBirth' && value && COUNTRY_TO_NATIONALITY[value]) {
        updated.nationality = COUNTRY_TO_NATIONALITY[value];
      }
      
      return updated;
    });
  };

  const handleCitySelect = (city: string, countryCode: string) => {
    const countryName = COUNTRY_CODE_TO_NAME[countryCode];
    if (countryName) {
      setFormData(prev => ({
        ...prev,
        cityOfBirth: city,
        countryOfBirth: countryName,
        nationality: COUNTRY_TO_NATIONALITY[countryName] || prev.nationality
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.civilite || !formData.firstName || !formData.lastName || !formData.email || 
        !formData.dateOfBirth || !formData.cityOfBirth || !formData.countryOfBirth || 
        !formData.nationality || !formData.identityNumber || !formData.program) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires (*).",
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

    try {
      // Générer la référence unique
      const currentYear = new Date().getFullYear();
      const reference = generateStudentReference(
        formData.firstName,
        formData.lastName,
        formData.dateOfBirth,
        formData.countryOfBirth,
        currentYear
      );

      // Créer l'étudiant avec Supabase
      const newStudent: Omit<Student, 'id'> = {
        reference,
        civilite: formData.civilite as 'M.' | 'Mme' | 'Mlle' | 'Mx',
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        cityOfBirth: formData.cityOfBirth,
        countryOfBirth: formData.countryOfBirth,
        nationality: formData.nationality,
        identityNumber: formData.identityNumber,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        program: formData.program as 'BBA' | 'MBA' | 'MBA Complémentaire',
        studyYear: formData.studyYear,
        specialty: formData.specialty,
        academicYear: formData.academicYear,
        notes: formData.notes,
        registrationDate: new Date().toISOString().split('T')[0],
        registrationYear: currentYear,
        status: "Actif",
        hasMBA2Diploma: formData.hasMBA2Diploma
      };

      const createdStudent = await createStudent(newStudent);
      console.log('Étudiant créé avec Supabase:', createdStudent);

      // Créer automatiquement les paiements obligatoires
      console.log('Création des paiements par défaut...');
      await createDefaultPayments(createdStudent);

      toast({
        title: "Inscription réussie !",
        description: `${formData.firstName} ${formData.lastName} a été inscrit avec la référence ${reference}. Redirection vers la génération de documents...`,
      });

      // Redirection vers la page documents avec l'UUID généré par Supabase
      console.log('Redirection vers:', `/documents/${createdStudent.id}`);
      navigate(`/documents/${createdStudent.id}`);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'étudiant. Veuillez réessayer.",
        variant: "destructive",
      });
    }
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
              {/* Section 1: Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground border-b pb-2">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="civilite">Civilité *</Label>
                    <Select onValueChange={(value) => handleInputChange('civilite', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Civilité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M.">M.</SelectItem>
                        <SelectItem value="Mme">Mme</SelectItem>
                        <SelectItem value="Mlle">Mlle</SelectItem>
                        <SelectItem value="Mx">Mx</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Prénom"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Nom de famille"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Informations de naissance */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground border-b pb-2">Informations de naissance</h3>
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
                    <Label htmlFor="cityOfBirth">Ville de naissance *</Label>
                    <CityAutocomplete
                      value={formData.cityOfBirth}
                      onChange={(value) => handleInputChange('cityOfBirth', value)}
                      onCitySelect={handleCitySelect}
                      cities={WORLD_CITIES_LIST}
                      cityToCountryMapping={WORLD_CITIES_MAPPING}
                      placeholder="Tapez pour rechercher une ville..."
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="countryOfBirth">Pays de naissance *</Label>
                    <Select onValueChange={(value) => handleInputChange('countryOfBirth', value)} value={formData.countryOfBirth}>
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
                  <div>
                    <Label htmlFor="nationality">Nationalité *</Label>
                    <Select onValueChange={(value) => handleInputChange('nationality', value)} value={formData.nationality}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez la nationalité" />
                      </SelectTrigger>
                      <SelectContent>
                        {NATIONALITIES.map((nationality) => (
                          <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 3: Documents d'identité */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground border-b pb-2">Documents d'identité</h3>
                <div>
                  <Label htmlFor="identityNumber">Numéro d'identité / Passeport *</Label>
                  <Input
                    id="identityNumber"
                    value={formData.identityNumber}
                    onChange={(e) => handleInputChange('identityNumber', e.target.value)}
                    placeholder="Numéro de carte d'identité ou passeport"
                    required
                  />
                </div>
              </div>

              {/* Section 4: Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground border-b pb-2">Informations de contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <PhoneInput
                      country="be"
                      value={formData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      inputStyle={{
                        width: '100%',
                        height: '40px',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        paddingLeft: '50px',
                        backgroundColor: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))'
                      }}
                      buttonStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px 0 0 6px'
                      }}
                      dropdownStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        color: 'hsl(var(--foreground))',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1000
                      }}
                      searchStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))'
                      }}
                      enableSearch
                      placeholder="Téléphone"
                    />
                  </div>
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
                </div>
                <div>
                  <Label htmlFor="address">Adresse complète</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Rue, numéro, code postal, ville, pays"
                    rows={2}
                  />
                </div>
              </div>

              {/* Section 5: Informations académiques */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground border-b pb-2">Informations académiques</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="program">Programme * 
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
                    <Label htmlFor="studyYear">Niveau *</Label>
                    <Select onValueChange={(value) => handleInputChange('studyYear', value)} value={formData.studyYear.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        {getStudyYearOptions(formData.program).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year === 1 ? "1ère année" : year === 2 ? "2ème année" : `${year}ème année`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialty">Spécialité</Label>
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
                  <div>
                    <Label htmlFor="academicYear">Année académique *</Label>
                    <Select onValueChange={(value) => handleInputChange('academicYear', value)} value={formData.academicYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez l'année académique" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={`${currentYear-1}-${currentYear}`}>{currentYear-1}-{currentYear}</SelectItem>
                        <SelectItem value={`${currentYear}-${currentYear+1}`}>{currentYear}-{currentYear+1}</SelectItem>
                        <SelectItem value={`${currentYear+1}-${currentYear+2}`}>{currentYear+1}-{currentYear+2}</SelectItem>
                        <SelectItem value={`${currentYear+2}-${currentYear+3}`}>{currentYear+2}-{currentYear+3}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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

              {/* Section 6: Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground border-b pb-2">Notes additionnelles</h3>
                <div>
                  <Label htmlFor="notes">Informations supplémentaires</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Informations supplémentaires, observations particulières..."
                    rows={3}
                  />
                </div>
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
