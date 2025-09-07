import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { fillRegistrationPdfWithPositions, downloadPdf } from "@/utils/positionPdfFiller";
import { Student } from "@/types";

interface AttestationDisplayProps {
  attestation: any;
  student: Student;
  onGenerate: (isDuplicate?: boolean) => void;
}

export const AttestationDisplay = ({ attestation, student, onGenerate }: AttestationDisplayProps) => {
  const formatStudyYear = (year: number) => {
    if (!year || isNaN(year)) return "1ère année"; // Valeur par défaut
    return year === 1 ? '1ère année' : `${year}ème année`;
  };

  const formatStudentName = (attestation: any, student: Student) => {
    // Utiliser les données enrichies de l'attestation ou les données actuelles de l'étudiant
    return attestation.student_full_name || `${student.firstName} ${student.lastName}`;
  };

  const formatStudentReference = (attestation: any, student: Student) => {
    return attestation.student_reference || student.reference;
  };

  const handleGenerateDuplicate = async () => {
    try {
      // Utiliser les données historiques stockées dans l'attestation
      const historicalStudent = {
        ...student,
        firstName: attestation.student_full_name?.split(' ')[0] || student.firstName,
        lastName: attestation.student_full_name?.split(' ').slice(1).join(' ') || student.lastName,
        reference: attestation.student_reference || student.reference,
        nationality: attestation.student_nationality || student.nationality,
        dateOfBirth: attestation.student_birth_date || student.dateOfBirth,
        cityOfBirth: attestation.student_birth_city || student.cityOfBirth,
        countryOfBirth: attestation.student_birth_country || student.countryOfBirth,
        program: attestation.program,
        studyYear: attestation.study_year,
        specialty: attestation.specialty,
        academicYear: attestation.academic_year,
        registrationDate: attestation.registration_date || student.registrationDate
      };

      const pdfBytes = await fillRegistrationPdfWithPositions(
        historicalStudent, 
        attestation.number
      );
      
      const filename = `duplicata-attestation-${formatStudentName(attestation, student).replace(' ', '-')}-${attestation.number}.pdf`;
      downloadPdf(pdfBytes, filename);
      
      toast.success(`Duplicata de l'attestation ${attestation.number} téléchargé.`);
    } catch (error) {
      console.error('Erreur lors de la génération du duplicata:', error);
      toast.error("Erreur lors de la génération du duplicata");
    }
  };

  return (
    <div className="p-3 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-foreground">
            {attestation.program} - {formatStudyYear(attestation.study_year)}
          </p>
          <p className="text-sm text-muted-foreground">
            Année académique : {attestation.academic_year}
          </p>
          <p className="text-sm text-muted-foreground">
            Étudiant : {formatStudentName(attestation, student)}
          </p>
          <p className="text-xs text-muted-foreground">
            Attestation : {attestation.number} - 
            Générée le {new Date(attestation.generate_date).toLocaleDateString('fr-FR')}
          </p>
          {attestation.specialty && (
            <p className="text-xs text-muted-foreground">
              Spécialité : {attestation.specialty}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateDuplicate}
          className="ml-4"
        >
          <Download className="w-4 h-4 mr-2" />
          Duplicata
        </Button>
      </div>
    </div>
  );
};