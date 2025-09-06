import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAcademicYearManagement } from '@/hooks/useAcademicYearManagement';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, RotateCcw, GraduationCap, FileText } from 'lucide-react';
import type { Student } from '@/types';

interface AcademicYearActionsProps {
  student: Student;
  onUpdate: () => void;
}

export function AcademicYearActions({ student, onUpdate }: AcademicYearActionsProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { promoteToNextYear, repeatYear, loading } = useAcademicYearManagement();
  const { toast } = useToast();

  const handlePromoteToNextYear = async () => {
    try {
      setActionLoading('promote');
      await promoteToNextYear(student.id);
      toast({
        title: "Passage réussi",
        description: `${student.firstName} ${student.lastName} est passé(e) à l'année supérieure avec génération automatique du minerval et de l'attestation.`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de faire passer l'étudiant à l'année supérieure.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRepeatYear = async () => {
    try {
      setActionLoading('repeat');
      await repeatYear(student.id);
      toast({
        title: "Redoublement enregistré",
        description: `${student.firstName} ${student.lastName} redouble avec génération automatique du minerval et de l'attestation pour la nouvelle année académique.`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le redoublement.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getNextStudyYear = () => student.studyYear + 1;
  const getNextAcademicYear = () => {
    const [startYear] = student.academicYear.split('-');
    const nextStartYear = parseInt(startYear) + 1;
    return `${nextStartYear}-${nextStartYear + 1}`;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Gestion de l'année scolaire
        </CardTitle>
        <CardDescription>
          Actions pour la progression académique de l'étudiant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Année académique actuelle:</span>
              <Badge variant="outline">{student.academicYear}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Année d'études actuelle:</span>
              <Badge variant="outline">Année {student.studyYear}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Programme:</span>
              <Badge variant="secondary">{student.program}</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="w-full" 
                  disabled={loading || actionLoading !== null}
                  variant="default"
                >
                  <ArrowUp className="mr-2 h-4 w-4" />
                  {actionLoading === 'promote' ? 'Traitement...' : 'Passer à l\'année supérieure'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer le passage à l'année supérieure</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Voulez-vous faire passer <strong>{student.firstName} {student.lastName}</strong> à l'année supérieure ?
                    </p>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <p><strong>Changements qui seront effectués :</strong></p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Année d'études : {student.studyYear} → {getNextStudyYear()}</li>
                        <li>Année académique : {student.academicYear} → {getNextAcademicYear()}</li>
                        <li>Génération automatique du minerval pour la nouvelle année</li>
                        <li>Génération automatique de la nouvelle attestation d'inscription</li>
                        <li>Mise à jour de l'historique académique</li>
                      </ul>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePromoteToNextYear}>
                    Confirmer le passage
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={loading || actionLoading !== null}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {actionLoading === 'repeat' ? 'Traitement...' : 'Redoubler l\'année'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer le redoublement</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Voulez-vous faire redoubler <strong>{student.firstName} {student.lastName}</strong> ?
                    </p>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <p><strong>Changements qui seront effectués :</strong></p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Année d'études : {student.studyYear} (maintenue)</li>
                        <li>Année académique : {student.academicYear} → {getNextAcademicYear()}</li>
                        <li>Génération automatique du minerval pour la nouvelle année académique</li>
                        <li>Génération automatique de la nouvelle attestation d'inscription</li>
                        <li>Mise à jour de l'historique académique (statut redoublant)</li>
                      </ul>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRepeatYear}>
                    Confirmer le redoublement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Les actions génèrent automatiquement les documents nécessaires (minerval, attestation) et mettent à jour l'historique académique de l'étudiant.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}