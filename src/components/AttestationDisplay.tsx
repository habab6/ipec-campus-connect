import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { fillRegistrationPdfWithPositions, downloadPdf } from "@/utils/positionPdfFiller";
import { generatePreadmissionPdf } from "@/utils/attestationGenerator";
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

  const handleDownload = async () => {
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

      // Vérifier si c'est une attestation de préadmission
      const isPreadmission = attestation.number.startsWith('PRE-');
      
      let pdfBytes;
      if (isPreadmission) {
        // Utiliser le template de préadmission avec le bon chemin
        pdfBytes = await generatePreadmissionPdf(historicalStudent, attestation.number);
      } else {
        // Utiliser le template d'inscription par défaut
        pdfBytes = await fillRegistrationPdfWithPositions(
          historicalStudent, 
          attestation.number,
          '/templates/attestation-template.pdf',  // Template d'inscription explicite
          attestation.generate_date
        );
      }
      
      const filename = `attestation-${formatStudentName(attestation, student).replace(' ', '-')}-${attestation.number}.pdf`;
      downloadPdf(pdfBytes, filename);
      
      toast.success(`Attestation ${attestation.number} téléchargée.`);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  return (
    <div className="border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header avec nom de l'attestation */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-300">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-white">
            {attestation.number.startsWith('PRE-') ? 'Préadmission' : 'Attestation'} {attestation.number}
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">
              {attestation.program}
            </span>
            {attestation.specialty && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200">
                {attestation.specialty}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Contenu */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Étudiant:</span>
              <span className="text-sm font-semibold text-foreground">{formatStudentName(attestation, student)}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Année d'étude:</span>
              <span className="text-sm text-foreground">{formatStudyYear(attestation.study_year)}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Année académique:</span>
              <span className="text-sm text-foreground">{attestation.academic_year}</span>
            </div>
            
            <div className="text-xs text-muted-foreground mt-2">
              Générée le {new Date(attestation.generate_date).toLocaleDateString('fr-FR')}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="ml-4 hover:bg-blue-50 hover:border-blue-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>
    </div>
  );
};