-- Ajouter un statut de génération aux attestations
ALTER TABLE public.registration_attestations 
ADD COLUMN IF NOT EXISTS is_generated boolean DEFAULT false;

-- Ajouter un champ pour la date de génération réelle
ALTER TABLE public.registration_attestations 
ADD COLUMN IF NOT EXISTS generated_at timestamp with time zone;

-- Mettre à jour les attestations existantes comme générées
UPDATE public.registration_attestations 
SET is_generated = true, generated_at = created_at 
WHERE is_generated IS NULL OR is_generated = false;