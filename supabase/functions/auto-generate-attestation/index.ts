import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration des positions pour chaque champ
const FIELD_POSITIONS = {
  numeroDocument: { x: 425, y: 38.5 },
  dateDocument: { x: 160, y: 547.5 },
  civilite: { x: 120, y: 700 },
  nomComplet: { x: 210, y: 274.9 },
  dateNaissance: { x: 210, y: 291.2 },
  villeNaissance: { x: 210, y: 650 },
  paysNaissance: { x: 210, y: 650 },
  nationalite: { x: 210, y: 308.4 },
  numeroIdentite: { x: 210, y: 324.3 },
  telephone: { x: 210, y: 600 },
  email: { x: 210, y: 550 },
  adresse: { x: 210, y: 500 },
  programme: { x: 290, y: 450 },
  niveau: { x: 210, y: 450 },
  specialite: { x: 210, y: 400 },
  anneeAcademique: { x: 210, y: 400 },
  dateInscription: { x: 210, y: 350 },
};

// Charger le PDF template
const loadPdfTemplate = async (templatePath: string): Promise<ArrayBuffer> => {
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Failed to load PDF template: ${templatePath}`);
  }
  return response.arrayBuffer();
};

// Générer un numéro d'attestation unique
const generateAttestationNumber = (student: any): string => {
  let programSuffix = '';
  if (student.program === 'BBA') {
    programSuffix = 'B';
  } else if (student.program === 'MBA') {
    programSuffix = 'M';
  } else if (student.program === 'MBA Complémentaire') {
    programSuffix = 'MC';
  }
  
  return `ATT-${student.reference}-${student.study_year}-${programSuffix}`;
};

// Générer le PDF d'attestation
const generateAttestationPdf = async (student: any, attestation: any): Promise<Uint8Array> => {
  try {
    console.log('📍 Génération attestation PDF automatique pour:', attestation.id);
    
    // Charger le PDF template
    const templateUrl = 'https://otifwbmkdjjfhlueddrw.supabase.co/storage/v1/object/public/templates/attestation-template.pdf';
    const existingPdfBytes = await loadPdfTemplate(templateUrl);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();
    
    // Utiliser la police standard
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    // Formatage du niveau d'études
    const formatNiveau = (studyYear: number) => {
      if (studyYear === 1) return "1ère année";
      if (studyYear === 2) return "2ème année";
      return `${studyYear}ème année`;
    };

    const fieldData = {
      numeroDocument: attestation.number,
      dateDocument: currentDate,
      civilite: student.civilite || '',
      nomComplet: `${student.first_name} ${student.last_name}`,
      dateNaissance: new Date(student.date_of_birth).toLocaleDateString('fr-FR') || '',
      villeNaissance: student.city_of_birth || '',
      paysNaissance: student.country_of_birth || '',
      nationalite: student.nationality || '',
      numeroIdentite: student.identity_number || '',
      telephone: student.phone || '',
      email: student.email || '',
      adresse: student.address || '',
      programme: attestation.program || '',
      niveau: formatNiveau(attestation.study_year),
      specialite: attestation.specialty || '',
      anneeAcademique: attestation.academic_year || '',
      dateInscription: new Date(student.registration_date).toLocaleDateString('fr-FR') || '',
    };

    // Ajouter le texte à chaque position
    Object.entries(fieldData).forEach(([fieldName, value]) => {
      const position = FIELD_POSITIONS[fieldName as keyof typeof FIELD_POSITIONS];
      if (position && value) {
        console.log(`✏️  ${fieldName}: "${value}" à (${position.x}, ${position.y})`);
        
        firstPage.drawText(value, {
          x: position.x,
          y: height - position.y,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
    });

    return await pdfDoc.save();
  } catch (error) {
    console.error('Erreur génération PDF attestation:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { attestationId } = await req.json();
    console.log('🚀 Auto-génération attestation pour:', attestationId);

    // Récupérer l'attestation et l'étudiant
    const { data: attestation, error: attestationError } = await supabase
      .from('registration_attestations')
      .select('*')
      .eq('id', attestationId)
      .single();

    if (attestationError) {
      console.error('Erreur récupération attestation:', attestationError);
      throw attestationError;
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', attestation.student_id)
      .single();

    if (studentError) {
      console.error('Erreur récupération étudiant:', studentError);
      throw studentError;
    }

    // Générer le PDF
    console.log('📄 Génération du PDF...');
    const pdfBytes = await generateAttestationPdf(student, attestation);
    
    console.log('✅ Attestation PDF générée automatiquement:', attestation.number);

    return new Response(JSON.stringify({ 
      success: true, 
      attestation: attestation,
      message: 'Attestation PDF générée automatiquement'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur auto-génération attestation:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erreur lors de la génération automatique de l\'attestation'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});