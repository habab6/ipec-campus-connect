-- Créer les attestations manquantes pour l'étudiant existant
INSERT INTO registration_attestations (
  student_id,
  number,
  academic_year,
  study_year,
  generate_date,
  program,
  specialty,
  student_full_name,
  student_reference,
  student_nationality,
  student_birth_city,
  student_birth_country,
  student_birth_date,
  registration_date,
  is_duplicate,
  notes
) VALUES 
-- Attestation d'inscription
(
  '31d666ee-ecbf-4306-bc6d-9fa2c4451892',
  'INSC-' || extract(epoch from now())::bigint,
  '2025-2026',
  1,
  CURRENT_DATE,
  'BBA',
  'Economie & Finance',
  'Abdelmajid MONTANARI',
  'AM900908/IPEC/25/TN',
  'Tunisienne',
  'Monastir',
  'Tunisie',
  '1990-09-08',
  '2025-09-08',
  false,
  'Attestation d''inscription'
),
-- Attestation de préadmission
(
  '31d666ee-ecbf-4306-bc6d-9fa2c4451892',
  'PRE-' || (extract(epoch from now())::bigint + 1),
  '2025-2026',
  1,
  CURRENT_DATE,
  'BBA',
  'Economie & Finance',
  'Abdelmajid MONTANARI',
  'AM900908/IPEC/25/TN',
  'Tunisienne',
  'Monastir',
  'Tunisie',
  '1990-09-08',
  '2025-09-08',
  false,
  'Attestation de préadmission'
);