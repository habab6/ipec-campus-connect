-- Clear all data from all tables and reset sequences
TRUNCATE TABLE 
  public.students,
  public.academic_years,
  public.payments,
  public.payment_installments,
  public.invoices,
  public.credit_notes,
  public.registration_attestations,
  public.student_academic_history
RESTART IDENTITY CASCADE;