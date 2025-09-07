-- Mettre à jour la contrainte pour ne permettre que Espèces et Virement
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_method_check;

-- Créer la nouvelle contrainte avec seulement Espèces et Virement
ALTER TABLE public.payments ADD CONSTRAINT payments_method_check 
CHECK (method IS NULL OR method IN ('Espèces', 'Virement bancaire'));