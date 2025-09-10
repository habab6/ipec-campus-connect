import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Users, Mail, Phone, Calendar, Filter, Download, SortAsc, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useStudents } from "@/hooks/useStudents";
import type { Student } from "@/types";
import { BUSINESS_SPECIALTIES } from "@/utils/studentUtils";
import { AcademicYearModal } from "@/components/AcademicYearModal";

const StudentList = () => {
  const { students, loading, fetchStudents } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");
  
  // États pour les filtres
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedStudyYear, setSelectedStudyYear] = useState<string>("all");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("active"); // Par défaut afficher seulement les étudiants actifs
  const [sortBy, setSortBy] = useState<string>("name");
  
  // État pour la modale de gestion scolaire
  const [academicYearModal, setAcademicYearModal] = useState<{
    isOpen: boolean;
    student: Student | null;
  }>({ isOpen: false, student: null });
  
  // Obtenir les valeurs uniques pour les filtres
  const uniquePrograms = [...new Set(students.map(s => s.program))];
  const uniqueSpecialties = [...new Set(students.map(s => s.specialty))];
  const uniqueStudyYears = [...new Set(students.map(s => s.studyYear))].sort((a, b) => a - b);
  const uniqueAcademicYears = [...new Set(students.map(s => s.academicYear))].sort();
  const uniqueStatuses = [...new Set(students.map(s => s.status))];

  // Fonction d'export CSV
  const exportToCSV = () => {
    if (filteredStudents.length === 0) return;
    
    const headers = [
      'Référence',
      'Civilité', 
      'Prénom',
      'Nom',
      'Date de naissance',
      'Ville de naissance',
      'Pays de naissance',
      'Nationalité',
      'N° d\'identité',
      'Téléphone',
      'Email',
      'Adresse',
      'Programme',
      'Année d\'étude',
      'Spécialité',
      'Année académique',
      'Date d\'inscription',
      'Statut',
      'Notes'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(student => [
        student.reference || '',
        student.civilite || '',
        student.firstName || '',
        student.lastName || '',
        student.dateOfBirth || '',
        student.cityOfBirth || '',
        student.countryOfBirth || '',
        student.nationality || '',
        student.identityNumber || '',
        student.phone || '',
        student.email || '',
        student.address || '',
        student.program || '',
        student.studyYear || '',
        student.specialty || '',
        student.academicYear || '',
        student.registrationDate || '',
        student.status || '',
        student.notes || ''
      ].map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Nom du fichier avec filtres appliqués
    const currentDate = new Date().toISOString().split('T')[0];
    const activeFilters = [];
    if (selectedProgram !== "all") activeFilters.push(selectedProgram);
    if (selectedSpecialty !== "all") activeFilters.push(selectedSpecialty);
    if (selectedStudyYear !== "all") activeFilters.push(`Année${selectedStudyYear}`);
    if (selectedAcademicYear !== "all") activeFilters.push(selectedAcademicYear);
    if (selectedStatus !== "all") activeFilters.push(selectedStatus);
    
    const filterSuffix = activeFilters.length > 0 ? `-${activeFilters.join('-')}` : '';
    link.setAttribute('download', `etudiants${filterSuffix}-${currentDate}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Logique de filtrage avancée
  const filteredStudents = students
    .filter(student => {
      // Filtre par recherche textuelle
      const matchesSearch = searchTerm === "" || 
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.program.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtres par catégorie
      const matchesProgram = selectedProgram === "all" || student.program === selectedProgram;
      const matchesSpecialty = selectedSpecialty === "all" || student.specialty === selectedSpecialty;
      const matchesStudyYear = selectedStudyYear === "all" || student.studyYear.toString() === selectedStudyYear;
      const matchesAcademicYear = selectedAcademicYear === "all" || student.academicYear === selectedAcademicYear;
      
      // Logique de filtrage du statut
      let matchesStatus = false;
      if (selectedStatus === "all") {
        matchesStatus = true;
      } else if (selectedStatus === "active") {
        matchesStatus = student.status !== "Archivé"; // Masquer les archivés par défaut
      } else if (selectedStatus === "archived") {
        matchesStatus = student.status === "Archivé"; // Afficher seulement les archivés
      } else {
        matchesStatus = student.status === selectedStatus;
      }
      
      return matchesSearch && matchesProgram && matchesSpecialty && matchesStudyYear && matchesAcademicYear && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case "program":
          return a.program.localeCompare(b.program);
        case "studyYear":
          return a.studyYear - b.studyYear;
        case "academicYear":
          return a.academicYear.localeCompare(b.academicYear);
        case "registrationDate":
          return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
        default:
          return 0;
      }
    });

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
    <div className="min-h-screen bg-background py-4 md:py-8 px-2 md:px-4">
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
            {/* Barre de recherche */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un étudiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres avancés */}
            <div className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtres et tri</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Filtre par programme */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Programme</span>
                  <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {uniquePrograms.map((program) => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre par spécialité */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Spécialité</span>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {uniqueSpecialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre par niveau */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Niveau</span>
                  <Select value={selectedStudyYear} onValueChange={setSelectedStudyYear}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {uniqueStudyYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          Année {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre par année académique */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Année académique</span>
                  <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {uniqueAcademicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre par statut */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Statut</span>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="archived">Archivés</SelectItem>
                      <SelectItem value="all">Tous</SelectItem>
                      {uniqueStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tri */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Trier par</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nom</SelectItem>
                      <SelectItem value="program">Programme</SelectItem>
                      <SelectItem value="studyYear">Niveau</SelectItem>
                      <SelectItem value="academicYear">Année académique</SelectItem>
                      <SelectItem value="registrationDate">Date d'inscription</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Actions et compteur */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 items-start sm:items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{filteredStudents.length} étudiant{filteredStudents.length > 1 ? 's' : ''} affiché{filteredStudents.length > 1 ? 's' : ''}</span>
                  {(selectedProgram !== "all" || selectedSpecialty !== "all" || selectedStudyYear !== "all" || selectedAcademicYear !== "all" || selectedStatus !== "all") && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">Filtré</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {(selectedProgram !== "all" || selectedSpecialty !== "all" || selectedStudyYear !== "all" || selectedAcademicYear !== "all" || selectedStatus !== "all") && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProgram("all");
                        setSelectedSpecialty("all");
                        setSelectedStudyYear("all");
                        setSelectedAcademicYear("all");
                        setSelectedStatus("all");
                      }}
                    >
                      Réinitialiser filtres
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={exportToCSV}
                    disabled={filteredStudents.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Exporter ({filteredStudents.length})
                  </Button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Chargement des étudiants...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
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
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              {student.firstName} {student.lastName}
                            </h3>
                            <Badge className={getProgramBadgeColor(student.program)}>
                              {student.program}
                            </Badge>
                            <Badge variant="outline">Année {student.studyYear}</Badge>
                            {student.specialty && (
                              <Badge variant="secondary">{student.specialty}</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {student.academicYear}
                            </Badge>
                            <Badge 
                              variant={student.status === 'Actif' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {student.status}
                            </Badge>
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setAcademicYearModal({ isOpen: true, student })}
                          >
                            <GraduationCap className="mr-1 h-3 w-3" />
                            Gestion scolaire
                          </Button>
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

        {/* Modale de gestion de l'année scolaire */}
        {academicYearModal.student && (
          <AcademicYearModal
            student={academicYearModal.student}
            isOpen={academicYearModal.isOpen}
            onClose={() => setAcademicYearModal({ isOpen: false, student: null })}
            onUpdate={fetchStudents}
          />
        )}
      </div>
    </div>
  );
};

export default StudentList;