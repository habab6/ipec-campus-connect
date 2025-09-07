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
  montant: { x: 400, y: 300 },
  typeFacture: { x: 120, y: 320 },
};

// Charger le PDF template
const loadPdfTemplate = async (templatePath: string): Promise<ArrayBuffer> => {
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Failed to load PDF template: ${templatePath}`);
  }
  return response.arrayBuffer();
};

// Générer un numéro de facture unique
const generateInvoiceNumber = (student: any, payment: any): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const studentCode = student.reference.split('-')[0] || student.id.slice(0, 4).toUpperCase();
  const typeCode = payment.type === 'Frais de dossier' ? 'FD' : 
                   payment.type === 'Minerval' ? 'MIN' : 'FAC';
  return `IPEC-${year}${month}-${studentCode}-${typeCode}`;
};

// Générer le PDF de facture
const generateInvoicePdf = async (student: any, payment: any): Promise<Uint8Array> => {
  try {
    console.log('📍 Génération facture PDF automatique pour paiement:', payment.id);
    
    // Charger le PDF template
    const templateUrl = 'https://otifwbmkdjjfhlueddrw.supabase.co/storage/v1/object/public/templates/facture-template.pdf';
    const existingPdfBytes = await loadPdfTemplate(templateUrl);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();
    
    // Utiliser la police standard
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const invoiceNumber = generateInvoiceNumber(student, payment);
    
    // Utiliser l'année académique du paiement
    const academicYear = payment.academic_year || student.academic_year;
    const studyYear = payment.study_year || student.study_year;
    
    const invoiceData = {
      numeroDocument: invoiceNumber,
      dateDocument: currentDate,
      civilite: student.civilite,
      nomComplet: `${student.first_name} ${student.last_name}`,
      dateNaissance: new Date(student.date_of_birth).toLocaleDateString('fr-FR'),
      villeNaissance: student.city_of_birth,
      paysNaissance: student.country_of_birth,
      nationalite: student.nationality,
      numeroIdentite: student.identity_number,
      telephone: student.phone,
      email: student.email,
      adresse: student.address,
      programme: student.program,
      niveau: studyYear === 1 ? '1ère année' : `${studyYear}ème année`,
      specialite: student.specialty,
      anneeAcademique: academicYear,
      dateInscription: new Date(student.registration_date).toLocaleDateString('fr-FR'),
      montant: `${payment.amount} €`,
      typeFacture: payment.type,
    };
    
    // Ajouter le texte à chaque position
    Object.entries(invoiceData).forEach(([fieldName, value]) => {
      const position = FIELD_POSITIONS[fieldName as keyof typeof FIELD_POSITIONS];
      if (position && value) {
        console.log(`✏️  ${fieldName}: "${value}" à (${position.x}, ${position.y})`);
        
        firstPage.drawText(String(value), {
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
    console.error('Erreur génération PDF facture:', error);
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

    const { paymentId } = await req.json();
    console.log('🚀 Auto-génération facture pour paiement:', paymentId);

    // Récupérer le paiement et l'étudiant
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      console.error('Erreur récupération paiement:', paymentError);
      throw paymentError;
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', payment.student_id)
      .single();

    if (studentError) {
      console.error('Erreur récupération étudiant:', studentError);
      throw studentError;
    }

    // Vérifier si une facture existe déjà pour ce paiement
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('payment_id', paymentId)
      .single();

    if (existingInvoice) {
      console.log('✅ Facture déjà existante pour ce paiement');
      return new Response(JSON.stringify({ success: true, message: 'Facture déjà existante' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Générer le PDF
    console.log('📄 Génération du PDF...');
    const pdfBytes = await generateInvoicePdf(student, payment);
    
    // Générer le numéro de facture
    const invoiceNumber = generateInvoiceNumber(student, payment);
    
    // Créer l'enregistrement de facture
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        number: invoiceNumber,
        student_id: payment.student_id,
        payment_id: payment.id,
        amount: payment.amount,
        type: payment.type,
        academic_year: payment.academic_year,
        study_year: payment.study_year,
        generate_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Erreur création facture:', invoiceError);
      throw invoiceError;
    }

    console.log('✅ Facture générée automatiquement:', invoice.number);

    return new Response(JSON.stringify({ 
      success: true, 
      invoice: invoice,
      message: 'Facture générée automatiquement'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur auto-génération facture:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erreur lors de la génération automatique de la facture'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});