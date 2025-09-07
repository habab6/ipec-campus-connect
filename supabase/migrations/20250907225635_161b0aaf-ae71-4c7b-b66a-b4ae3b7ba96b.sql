-- Mettre à jour les données existantes pour les conformer aux nouveaux moyens de paiement
UPDATE public.payments 
SET method = 'Virement bancaire' 
WHERE method IN ('Carte', 'Carte bancaire', 'Virement');

UPDATE public.payments 
SET method = 'Espèces' 
WHERE method = 'Chèque';

-- Supprimer l'ancienne contrainte 
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_method_check;

-- Créer la nouvelle contrainte avec seulement Espèces et Virement bancaire
ALTER TABLE public.payments ADD CONSTRAINT payments_method_check 
CHECK (method IS NULL OR method IN ('Espèces', 'Virement bancaire'));