import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useAcademicYearManagement } from '@/hooks/useAcademicYearManagement';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, RotateCcw, GraduationCap, FileText, Archive } from 'lucide-react';
import type { Student } from '@/types';

interface AcademicYearModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function AcademicYearModal({ student, isOpen, onClose, onUpdate }: AcademicYearModalProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { promoteToNextYear, repeatYear, archiveStudent, loading } = useAcademicYearManagement();
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
      onClose();
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
      onClose();
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

  const handleArchiveStudent = async () => {
    try {
      setActionLoading('archive');
      await archiveStudent(student.id);
      toast({
        title: "Étudiant archivé",
        description: `${student.firstName} ${student.lastName} a été archivé avec succès.`,
      });
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver l'étudiant.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getNextProgression = () => {
    if (student.program === 'BBA') {
      if (student.studyYear === 3) {
        return { program: 'MBA', studyYear: 1 };
      }
      return { program: 'BBA', studyYear: student.studyYear + 1 };
    }
    
    if (student.program === 'MBA') {
      if (student.studyYear === 2) {
        return { program: 'MBA Complémentaire', studyYear: 1 };
      }
      return { program: 'MBA', studyYear: student.studyYear + 1 };
    }

    // MBA Complémentaire n'a pas de progression
    return { program: 'MBA Complémentaire', studyYear: 1 };
  };

  const getNextStudyYear = () => getNextProgression().studyYear;
  const getNextProgram = () => getNextProgression().program;
  const getNextAcademicYear = () => {
    const [startYear] = student.academicYear.split('-');
    const nextStartYear = parseInt(startYear) + 1;
    return `${nextStartYear}-${nextStartYear + 1}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Gestion de l'année scolaire - {student.firstName} {student.lastName}
          </DialogTitle>
          <DialogDescription>
            Actions pour la progression académique de l'étudiant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
              {student.status !== 'Archivé' && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        disabled={loading || actionLoading !== null || (student.program === 'MBA Complémentaire' && student.studyYear === 1)}
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
                              <li>Programme : {student.program} → {getNextProgram()}</li>
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

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        disabled={loading || actionLoading !== null}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        {actionLoading === 'archive' ? 'Traitement...' : 'Archiver l\'étudiant'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer l'archivage</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            Voulez-vous archiver <strong>{student.firstName} {student.lastName}</strong> ?
                          </p>
                          <div className="bg-muted p-3 rounded-md text-sm">
                            <p><strong>Cette action :</strong></p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Marque l'étudiant comme "Archivé"</li>
                              <li>Enregistre l'abandon dans l'historique académique</li>
                              <li>L'étudiant n'apparaîtra plus dans les listes actives</li>
                              <li>Cette action peut être annulée en modifiant le statut manuellement</li>
                            </ul>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleArchiveStudent} className="bg-destructive text-destructive-foreground">
                          Confirmer l'archivage
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {student.status === 'Archivé' && (
                <div className="p-3 bg-muted rounded-md text-center">
                  <Archive className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Étudiant archivé</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Modifiez le statut dans l'édition pour réactiver
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Les actions génèrent automatiquement les documents nécessaires (minerval, attestation) et mettent à jour l'historique académique de l'étudiant.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}