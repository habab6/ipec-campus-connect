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
import { getStudyYearOptions } from "@/utils/studentUtils";

const StudentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const foundStudent = students.find((s: Student) => s.id === id);
    if (foundStudent) {
      setStudent(foundStudent);
    }
    setLoading(false);
  }, [id]);

  const handleInputChange = (field: keyof Student, value: string) => {
    if (student) {
      setStudent(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    // Mise à jour dans localStorage
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const updatedStudents = students.map((s: Student) => 
      s.id === student.id ? student : s
    );
    localStorage.setItem('students', JSON.stringify(updatedStudents));

    toast({
      title: "Modifications sauvegardées !",
      description: `Les informations de ${student.firstName} ${student.lastName} ont été mises à jour.`,
    });

    navigate('/students');
  };

  const handleDelete = () => {
    if (!student) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'étudiant ${student.firstName} ${student.lastName} ?`)) {
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      const filteredStudents = students.filter((s: Student) => s.id !== student.id);
      localStorage.setItem('students', JSON.stringify(filteredStudents));

      toast({
        title: "Étudiant supprimé",
        description: `${student.firstName} ${student.lastName} a été supprimé.`,
      });

      navigate('/students');
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={student.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+32 x xx xx xx xx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={student.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
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
              </div>

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
                  <Label htmlFor="studyYear">Année d'étude</Label>
                  <Select onValueChange={(value) => handleInputChange('studyYear', value)} value={student.studyYear.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez l'année" />
                    </SelectTrigger>
                    <SelectContent>
                      {getStudyYearOptions(student.program).map((year) => (
                        <SelectItem key={year} value={year.toString()}>Année {year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="specialty">Spécialité</Label>
                <Select onValueChange={(value) => handleInputChange('specialty', value)} value={student.specialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Économie & Finance">Économie & Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Relations Internationales et Études Européennes">Relations Internationales</SelectItem>
                    <SelectItem value="Logistique">Logistique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={student.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Adresse complète"
                  rows={2}
                />
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
      </div>
    </div>
  );
};

export default StudentEdit;