import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserCog, ArrowLeft, Save, Trash2 } from "lucide-react";
import { Student } from "@/types";
import { useStudents } from "@/hooks/useStudents";
import { AcademicYearActions } from "@/components/AcademicYearActions";
import { getStudyYearOptions } from "@/utils/studentUtils";
import { COUNTRIES } from "@/utils/countries";
import { NATIONALITIES } from "@/utils/nationalities";
import { COUNTRY_TO_NATIONALITY, COUNTRY_CODE_TO_NAME } from "@/utils/countryToNationality";
import { WORLD_CITIES_LIST, WORLD_CITIES_MAPPING } from "@/utils/worldCities";
import PhoneInput from 'react-phone-input-2';
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import 'react-phone-input-2/lib/style.css';

const StudentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { updateStudent, deleteStudent, getStudentById } = useStudents();

  const loadStudent = async () => {
    if (!id) return;
    console.log('Tentative de chargement étudiant avec ID:', id);
    setLoading(true);
    const foundStudent = await getStudentById(id);
    console.log('Étudiant trouvé:', foundStudent);
    if (foundStudent) {
      setStudent(foundStudent);
    } else {
      console.log('Aucun étudiant trouvé avec cet ID');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStudent();
  }, [id]);

  const handleInputChange = (field: keyof Student, value: string) => {
    if (student) {
      setStudent(prev => {
        if (!prev) return null;
        const updated = { ...prev, [field]: value };
        
        // Auto-préchargement de la nationalité en fonction du pays de naissance
        if (field === 'countryOfBirth' && value && COUNTRY_TO_NATIONALITY[value]) {
          updated.nationality = COUNTRY_TO_NATIONALITY[value];
        }
        
        return updated;
      });
    }
  };

  const handleCitySelect = (city: string, countryCode: string) => {
    const countryName = COUNTRY_CODE_TO_NAME[countryCode];
    if (student && countryName) {
      setStudent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cityOfBirth: city,
          countryOfBirth: countryName,
          nationality: COUNTRY_TO_NATIONALITY[countryName] || prev.nationality
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!student) return;

    // Validation basique
    if (!student.firstName || !student.lastName || !student.email || !student.program) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateStudent(student.id, student);
      toast({
        title: "Modifications sauvegardées !",
        description: `Les informations de ${student.firstName} ${student.lastName} ont été mises à jour.`,
      });
      navigate('/students');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!student) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'étudiant ${student.firstName} ${student.lastName} ?`)) {
      try {
        await deleteStudent(student.id);
        toast({
          title: "Étudiant supprimé",
          description: `${student.firstName} ${student.lastName} a été supprimé.`,
        });
        navigate('/students');
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'étudiant.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement...</p>
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
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Link to="/students">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </Link>
        </div>

        <Card className="shadow-medium">
          <CardHeader className="text-center bg-gradient-primary text-primary-foreground rounded-t-lg">
            <UserCog className="h-12 w-12 mx-auto mb-4" />
            <CardTitle className="text-2xl">Modifier l'étudiant</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Mettre à jour les informations de {student.firstName} {student.lastName}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Informations personnelles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="civilite">Civilité *</Label>
                    <Select onValueChange={(value) => handleInputChange('civilite', value)} value={student.civilite}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
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
                      value={student.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Entrez le prénom"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={student.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Entrez le nom"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Informations de naissance */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Informations de naissance</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={student.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cityOfBirth">Ville de naissance *</Label>
                    <CityAutocomplete
                      value={student.cityOfBirth}
                      onChange={(value) => handleInputChange('cityOfBirth', value)}
                      onCitySelect={handleCitySelect}
                      cities={WORLD_CITIES_LIST}
                      cityToCountryMapping={WORLD_CITIES_MAPPING}
                      placeholder="Tapez pour rechercher une ville..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="countryOfBirth">Pays de naissance *</Label>
                    <Select onValueChange={(value) => handleInputChange('countryOfBirth', value)} value={student.countryOfBirth}>
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
              </div>

              {/* Documents d'identité */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Documents d'identité</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nationality">Nationalité *</Label>
                    <Select onValueChange={(value) => handleInputChange('nationality', value)} value={student.nationality}>
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
                  <div>
                    <Label htmlFor="identityNumber">Numéro d'identité/passeport *</Label>
                    <Input
                      id="identityNumber"
                      value={student.identityNumber}
                      onChange={(e) => handleInputChange('identityNumber', e.target.value)}
                      placeholder="Numéro d'identité ou passeport"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Informations académiques */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Informations académiques</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="program">Programme *</Label>
                    <Select onValueChange={(value) => handleInputChange('program', value)} value={student.program}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un programme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BBA">BBA</SelectItem>
                        <SelectItem value="MBA">MBA</SelectItem>
                        <SelectItem value="MBA Complémentaire">MBA Complémentaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="studyYear">Année d'étude *</Label>
                    <Select onValueChange={(value) => handleInputChange('studyYear', value)} value={student.studyYear.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez l'année" />
                      </SelectTrigger>
                      <SelectContent>
                        {getStudyYearOptions(student.program).map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}ème année</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialty">Spécialité *</Label>
                    <Select onValueChange={(value) => handleInputChange('specialty', value)} value={student.specialty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez la spécialité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Management des entreprises">Management des entreprises</SelectItem>
                        <SelectItem value="Marketing & créativité">Marketing & créativité</SelectItem>
                        <SelectItem value="Economie & Finance">Economie & Finance</SelectItem>
                        <SelectItem value="Logistique">Logistique</SelectItem>
                        <SelectItem value="Etudes Européennes et relations internationales">Etudes Européennes et relations internationales</SelectItem>
                        <SelectItem value="Informatique de gestion">Informatique de gestion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="academicYear">Année académique *</Label>
                    <Select onValueChange={(value) => handleInputChange('academicYear', value)} value={student.academicYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez l'année académique" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                        <SelectItem value="2025-2026">2025-2026</SelectItem>
                        <SelectItem value="2026-2027">2026-2027</SelectItem>
                        <SelectItem value="2027-2028">2027-2028</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {student.program === 'MBA Complémentaire' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasMBA2Diploma"
                      checked={student.hasMBA2Diploma || false}
                      onChange={(e) => handleInputChange('hasMBA2Diploma', e.target.checked.toString())}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="hasMBA2Diploma">
                      Je confirme être titulaire d'un diplôme MBA2 ou équivalent
                    </Label>
                  </div>
                )}
              </div>

              {/* Informations de contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Informations de contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <PhoneInput
                      country="be"
                      value={student.phone}
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
                      value={student.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@exemple.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse complète *</Label>
                  <Textarea
                    id="address"
                    value={student.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Rue, numéro, code postal, ville, pays"
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Informations système */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Informations système</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Statut</Label>
                    <Select onValueChange={(value: 'Actif' | 'Inactif' | 'Suspendu') => handleInputChange('status', value)} value={student.status}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Actif">Actif</SelectItem>
                        <SelectItem value="Inactif">Inactif</SelectItem>
                        <SelectItem value="Suspendu">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reference">Référence étudiant</Label>
                    <Input
                      id="reference"
                      value={student.reference}
                      onChange={(e) => handleInputChange('reference', e.target.value)}
                      placeholder="Référence automatique"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes additionnelles</Label>
                  <Textarea
                    id="notes"
                    value={student.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Informations supplémentaires..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" size="lg">
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder les modifications
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  size="lg"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Academic Year Management Section */}
        <div className="mt-6">
          <AcademicYearActions 
            student={student} 
            onUpdate={loadStudent}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentEdit;