-- Supprimer l'ancienne contrainte 
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_method_check;

-- Créer la nouvelle contrainte avec les valeurs exactes qui existent
ALTER TABLE public.payments ADD CONSTRAINT payments_method_check 
CHECK (method IS NULL OR method IN ('Espèces', 'Virement'));