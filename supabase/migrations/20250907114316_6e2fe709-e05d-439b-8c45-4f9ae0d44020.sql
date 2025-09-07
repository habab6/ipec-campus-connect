-- Vider toutes les tables de données
-- Supprimer dans l'ordre pour éviter les conflits de clés étrangères

-- Supprimer les données des tables dépendantes en premier
TRUNCATE TABLE public.payment_installments RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.credit_notes RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.invoices RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.registration_attestations RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.student_academic_history RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.payments RESTART IDENTITY CASCADE;

-- Supprimer les données de la table principale
TRUNCATE TABLE public.students RESTART IDENTITY CASCADE;

-- Supprimer les années académiques
TRUNCATE TABLE public.academic_years RESTART IDENTITY CASCADE;