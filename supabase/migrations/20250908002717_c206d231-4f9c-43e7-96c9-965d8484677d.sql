-- Empty all tables in the correct order to respect dependencies
TRUNCATE TABLE public.credit_notes CASCADE;
TRUNCATE TABLE public.invoices CASCADE;
TRUNCATE TABLE public.payment_installments CASCADE;
TRUNCATE TABLE public.registration_attestations CASCADE;
TRUNCATE TABLE public.student_academic_history CASCADE;
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.students CASCADE;
TRUNCATE TABLE public.academic_years CASCADE;