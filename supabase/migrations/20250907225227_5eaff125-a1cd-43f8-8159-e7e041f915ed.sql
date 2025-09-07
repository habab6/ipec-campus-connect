-- Vérifier les contraintes actuelles sur la table payments
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.payments'::regclass 
AND contype = 'c';

-- Supprimer l'ancienne contrainte de type pour ajouter les nouveaux types
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_type_check;

-- Créer une nouvelle contrainte avec tous les types requis
ALTER TABLE public.payments ADD CONSTRAINT payments_type_check 
CHECK (type IN ('Frais de dossier', 'Minerval', 'Frais d''envoi', 'Duplicata', 'Frais mensuel', 'Matériel', 'Examen', 'Autre'));

-- Vérifier aussi les contraintes de méthodes et les mettre à jour si nécessaire
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_method_check;

-- Créer une nouvelle contrainte de méthode avec les moyens de paiement requis
ALTER TABLE public.payments ADD CONSTRAINT payments_method_check 
CHECK (method IS NULL OR method IN ('Espèces', 'Virement', 'Carte', 'Chèque'));