import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Users, Mail, Phone, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  program: string;
  level: string;
  notes: string;
  registrationDate: string;
  status: string;
}

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedStudents = localStorage.getItem('students');
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }
  }, []);

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgramBadgeColor = (program: string) => {
    const colors = {
      informatique: "bg-primary",
      comptabilite: "bg-secondary",
      marketing: "bg-destructive",
      gestion: "bg-accent",
      langues: "bg-muted"
    };
    return colors[program.toLowerCase() as keyof typeof colors] || "bg-muted";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Non renseignée";
    return new Date(dateString).toLocaleDateString('fr-FR');
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

        <Card className="shadow-medium mb-8">
          <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  <Users className="mr-2 h-6 w-6" />
                  Liste des Étudiants
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  {students.length} étudiant{students.length > 1 ? 's' : ''} inscrit{students.length > 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Link to="/register">
                <Button variant="secondary">
                  Nouvelle inscription
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un étudiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {students.length === 0 ? "Aucun étudiant inscrit" : "Aucun résultat"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {students.length === 0 
                    ? "Commencez par inscrire votre premier étudiant."
                    : "Essayez de modifier votre recherche."
                  }
                </p>
                {students.length === 0 && (
                  <Link to="/register">
                    <Button>Inscrire un étudiant</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="hover:shadow-soft transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              {student.firstName} {student.lastName}
                            </h3>
                            <Badge className={getProgramBadgeColor(student.program)}>
                              {student.program}
                            </Badge>
                            {student.level && (
                              <Badge variant="outline">{student.level}</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              {student.email}
                            </div>
                            {student.phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2" />
                                {student.phone}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              Inscrit le {formatDate(student.registrationDate)}
                            </div>
                            {student.dateOfBirth && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                Né(e) le {formatDate(student.dateOfBirth)}
                              </div>
                            )}
                          </div>

                          {student.notes && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              "{student.notes}"
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Link to={`/edit-student/${student.id}`}>
                            <Button variant="outline" size="sm">
                              Modifier
                            </Button>
                          </Link>
                          <Link to={`/documents/${student.id}`}>
                            <Button variant="outline" size="sm">
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

export default StudentList;