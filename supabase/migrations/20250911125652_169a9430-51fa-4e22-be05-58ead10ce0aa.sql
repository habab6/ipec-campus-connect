-- Supprimer le portail étudiant de la base de données
-- Supprimer les politiques RLS pour les étudiants d'abord
DROP POLICY IF EXISTS "Students can view their own attestations" ON public.registration_attestations;
DROP POLICY IF EXISTS "Students can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Students can view their own credit notes" ON public.credit_notes;
DROP POLICY IF EXISTS "Students can view their own payments" ON public.payments;

-- Supprimer la table profiles qui sert pour l'authentification des étudiants
DROP TABLE IF EXISTS public.profiles;