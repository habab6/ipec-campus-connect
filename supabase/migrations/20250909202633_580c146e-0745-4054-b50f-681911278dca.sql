-- Vider toutes les tables dans l'ordre correct pour éviter les conflits de références

-- Supprimer les versements de paiement
DELETE FROM public.payment_installments;

-- Supprimer les factures
DELETE FROM public.invoices;

-- Supprimer les notes de crédit
DELETE FROM public.credit_notes;

-- Supprimer les attestations d'inscription
DELETE FROM public.registration_attestations;

-- Supprimer l'historique académique des étudiants
DELETE FROM public.student_academic_history;

-- Supprimer les paiements
DELETE FROM public.payments;

-- Supprimer les étudiants
DELETE FROM public.students;

-- Supprimer les années académiques
DELETE FROM public.academic_years;