import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  LogOut, 
  User, 
  GraduationCap,
  Calendar,
  CreditCard,
  StickyNote
} from 'lucide-react';
import { toast } from 'sonner';
import { fillRegistrationPdfWithPositions } from '@/utils/positionPdfFiller';
import { generateInvoice } from '@/utils/documentGenerator';
import { Student } from '@/types';

interface StudentProfile {
  student_id: string;
  student_reference: string;
  role: string;
}

interface StudentDocument {
  id: string;
  type: 'attestation' | 'invoice' | 'credit_note';
  number: string;
  academic_year: string;
  generate_date: string;
  amount?: number;
  status?: string;
  description?: string;
}

const StudentDashboard = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/student-auth');
        return;
      }

      // Récupérer le profil étudiant
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || profileData?.role !== 'student') {
        toast.error('Accès non autorisé');
        navigate('/student-auth');
        return;
      }

      setProfile(profileData);

      // Récupérer les données de l'étudiant
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', profileData.student_id)
        .single();

      if (!studentError && studentData) {
        // Transformer les données de la base vers le format Student
        const transformedStudent: Student = {
          id: studentData.id,
          reference: studentData.reference,
          civilite: studentData.civilite as "M." | "Mme" | "Mlle" | "Mx",
          firstName: studentData.first_name,
          lastName: studentData.last_name,
          dateOfBirth: studentData.date_of_birth,
          cityOfBirth: studentData.city_of_birth,
          countryOfBirth: studentData.country_of_birth,
          nationality: studentData.nationality,
          identityNumber: studentData.identity_number,
          email: studentData.email,
          phone: studentData.phone,
          address: studentData.address,
          program: studentData.program as "BBA" | "MBA" | "MBA Complémentaire",
          specialty: studentData.specialty,
          studyYear: studentData.study_year,
          registrationYear: studentData.registration_year,
          registrationDate: studentData.registration_date,
          academicYear: studentData.academic_year,
          notes: studentData.notes,
          hasMBA2Diploma: studentData.has_mba2_diploma,
          status: studentData.status as "Actif" | "Inactif" | "Suspendu" | "Archivé"
        };
        setStudent(transformedStudent);
        await loadStudentDocuments(profileData.student_id);
      }

    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      navigate('/student-auth');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentDocuments = async (studentId: string) => {
    try {
      const [attestationsResponse, invoicesResponse, creditNotesResponse] = await Promise.all([
        supabase
          .from('registration_attestations')
          .select('id, number, academic_year, generate_date')
          .eq('student_id', studentId),
        supabase
          .from('invoices')
          .select('id, number, academic_year, generate_date, amount, type')
          .eq('student_id', studentId),
        supabase
          .from('credit_notes')
          .select('id, number, date, amount, reason')
          .eq('student_id', studentId)
      ]);

      const allDocuments: StudentDocument[] = [];

      // Attestations
      if (attestationsResponse.data) {
        allDocuments.push(...attestationsResponse.data.map(doc => ({
          id: doc.id,
          type: 'attestation' as const,
          number: doc.number,
          academic_year: doc.academic_year,
          generate_date: doc.generate_date
        })));
      }

      // Factures
      if (invoicesResponse.data) {
        allDocuments.push(...invoicesResponse.data.map(doc => ({
          id: doc.id,
          type: 'invoice' as const,
          number: doc.number,
          academic_year: doc.academic_year,
          generate_date: doc.generate_date,
          amount: doc.amount,
          description: doc.type
        })));
      }

      // Notes de crédit
      if (creditNotesResponse.data) {
        allDocuments.push(...creditNotesResponse.data.map(doc => ({
          id: doc.id,
          type: 'credit_note' as const,
          number: doc.number,
          academic_year: '', // Les notes de crédit n'ont pas d'année académique directe
          generate_date: doc.date,
          amount: doc.amount,
          description: doc.reason
        })));
      }

      // Trier par date de génération (plus récent en premier)
      allDocuments.sort((a, b) => new Date(b.generate_date).getTime() - new Date(a.generate_date).getTime());
      
      setDocuments(allDocuments);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      toast.error('Erreur lors du chargement des documents');
    }
  };

  const handleDownloadDocument = async (document: StudentDocument) => {
    if (!student) return;

    try {
      if (document.type === 'attestation') {
        // Récupérer les détails de l'attestation
        const { data: attestation } = await supabase
          .from('registration_attestations')
          .select('*')
          .eq('id', document.id)
          .single();

        if (attestation) {
          const pdfBytes = await fillRegistrationPdfWithPositions(
            student, 
            attestation.number,
            '/templates/attestation-template.pdf',
            attestation.generate_date
          );
          const filename = `attestation-${student.firstName}-${student.lastName}-${attestation.number}.pdf`;
          downloadPdf(pdfBytes, filename);
        }
      } else if (document.type === 'invoice') {
        // Récupérer les détails de la facture
        const { data: invoice } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', document.id)
          .single();

        if (invoice) {
          // Transformer les données de la facture pour correspondre au type Payment
          const transformedPayment = {
            id: invoice.payment_id,
            studentId: invoice.student_id,
            amount: invoice.amount,
            dueDate: invoice.generate_date,
            status: 'Payé' as const,
            description: invoice.type,
            type: invoice.type as "Frais de dossier" | "Minerval" | "Frais d'envoi" | "Duplicata",
            academicYear: invoice.academic_year,
            studyYear: invoice.study_year
          };
          
          // Générer la facture en utilisant le template PDF
          const pdfBytes = await fetch('/templates/facture-template.pdf')
            .then(res => res.arrayBuffer())
            .then(buffer => new Uint8Array(buffer));
          // Note: La génération PDF complète serait à implémenter avec les données de la facture
          const filename = `facture-${student.firstName}-${student.lastName}-${invoice.number}.pdf`;
          downloadPdf(pdfBytes, filename);
        }
      }
      
      toast.success('Document téléchargé avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement du document');
    }
  };

  const downloadPdf = (pdfBytes: Uint8Array, filename: string) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/student-auth');
    toast.success('Déconnexion réussie');
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'attestation':
        return <GraduationCap className="h-4 w-4" />;
      case 'invoice':
        return <CreditCard className="h-4 w-4" />;
      case 'credit_note':
        return <StickyNote className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'attestation':
        return 'Attestation d\'inscription';
      case 'invoice':
        return 'Facture';
      case 'credit_note':
        return 'Note de crédit';
      default:
        return 'Document';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Espace Étudiant</h1>
            <p className="text-muted-foreground">Accédez à vos documents académiques</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Informations de l'étudiant */}
        {student && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                  <p className="text-lg font-semibold">{student.firstName} {student.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Référence</p>
                  <p className="text-lg font-semibold">{student.reference}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Programme</p>
                  <p className="text-lg font-semibold">{student.program}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Spécialité</p>
                  <p className="text-lg font-semibold">{student.specialty}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Année d'étude</p>
                  <p className="text-lg font-semibold">{student.studyYear}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Année académique</p>
                  <p className="text-lg font-semibold">{student.academicYear}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Mes Documents
            </CardTitle>
            <CardDescription>
              Téléchargez et consultez vos documents académiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun document disponible</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((document, index) => (
                  <div key={document.id}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getDocumentIcon(document.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{getDocumentTypeLabel(document.type)}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>N° {document.number}</span>
                            {document.academic_year && (
                              <>
                                <span>•</span>
                                <span>{document.academic_year}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {new Date(document.generate_date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          {document.amount && (
                            <p className="text-sm text-muted-foreground">
                              Montant: {document.amount} €
                            </p>
                          )}
                          {document.description && (
                            <p className="text-sm text-muted-foreground">
                              {document.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {getDocumentTypeLabel(document.type)}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadDocument(document)}
                          disabled={document.type === 'credit_note'} // Les notes de crédit ne sont pas encore supportées
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                    {index < documents.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;