-- Amélioration de la table registration_attestations pour une gestion professionnelle des données
-- Ajout de colonnes pour assurer la cohérence des données historiques

ALTER TABLE public.registration_attestations 
ADD COLUMN IF NOT EXISTS student_full_name TEXT,
ADD COLUMN IF NOT EXISTS student_reference TEXT,
ADD COLUMN IF NOT EXISTS student_nationality TEXT,
ADD COLUMN IF NOT EXISTS student_birth_date DATE,
ADD COLUMN IF NOT EXISTS student_birth_city TEXT,
ADD COLUMN IF NOT EXISTS student_birth_country TEXT,
ADD COLUMN IF NOT EXISTS registration_date DATE,
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS original_attestation_id UUID REFERENCES public.registration_attestations(id),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Création d'un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_registration_attestations_student_year 
ON public.registration_attestations(student_id, academic_year, study_year);

CREATE INDEX IF NOT EXISTS idx_registration_attestations_number 
ON public.registration_attestations(number);

-- Création d'une fonction pour générer automatiquement les données complètes d'une attestation
CREATE OR REPLACE FUNCTION public.enrich_attestation_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Récupérer les informations de l'étudiant pour les stocker dans l'attestation
  SELECT 
    CONCAT(s.first_name, ' ', s.last_name),
    s.reference,
    s.nationality,
    s.date_of_birth,
    s.city_of_birth,
    s.country_of_birth,
    s.registration_date
  INTO 
    NEW.student_full_name,
    NEW.student_reference,
    NEW.student_nationality,
    NEW.student_birth_date,
    NEW.student_birth_city,
    NEW.student_birth_country,
    NEW.registration_date
  FROM public.students s
  WHERE s.id = NEW.student_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour enrichir automatiquement les données
DROP TRIGGER IF EXISTS trigger_enrich_attestation_data ON public.registration_attestations;
CREATE TRIGGER trigger_enrich_attestation_data
  BEFORE INSERT OR UPDATE ON public.registration_attestations
  FOR EACH ROW
  EXECUTE FUNCTION public.enrich_attestation_data();

-- Mettre à jour les attestations existantes avec les données complètes
UPDATE public.registration_attestations 
SET 
  student_full_name = CONCAT(s.first_name, ' ', s.last_name),
  student_reference = s.reference,
  student_nationality = s.nationality,
  student_birth_date = s.date_of_birth,
  student_birth_city = s.city_of_birth,
  student_birth_country = s.country_of_birth,
  registration_date = s.registration_date
FROM public.students s
WHERE registration_attestations.student_id = s.id
AND registration_attestations.student_full_name IS NULL;