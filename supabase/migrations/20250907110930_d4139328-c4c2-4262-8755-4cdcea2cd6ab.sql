-- Correction de l'avertissement de sécurité pour la fonction enrich_attestation_data
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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;