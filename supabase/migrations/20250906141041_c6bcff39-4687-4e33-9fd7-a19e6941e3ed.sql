-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  civilite TEXT NOT NULL CHECK (civilite IN ('M.', 'Mme', 'Mlle', 'Mx')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  city_of_birth TEXT NOT NULL,
  country_of_birth TEXT NOT NULL,
  nationality TEXT NOT NULL,
  identity_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  program TEXT NOT NULL CHECK (program IN ('BBA', 'MBA', 'MBA Complémentaire')),
  study_year INTEGER NOT NULL,
  specialty TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  notes TEXT,
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  registration_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Actif' CHECK (status IN ('Actif', 'Inactif', 'Suspendu')),
  has_mba2_diploma BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente', 'Payé', 'En retard', 'Remboursé')),
  type TEXT NOT NULL CHECK (type IN ('Frais de dossier', 'Minerval', 'Frais mensuel', 'Matériel', 'Examen', 'Autre')),
  description TEXT NOT NULL,
  method TEXT CHECK (method IN ('Espèces', 'Carte', 'Virement', 'Chèque')),
  invoice_number TEXT,
  invoice_date DATE,
  academic_year TEXT,
  study_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_installments table
CREATE TABLE public.payment_installments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  paid_date DATE NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('Espèces', 'Carte', 'Virement', 'Chèque')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create registration_attestations table
CREATE TABLE public.registration_attestations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  number TEXT NOT NULL UNIQUE,
  academic_year TEXT NOT NULL,
  study_year INTEGER NOT NULL,
  generate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  program TEXT NOT NULL,
  specialty TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  number TEXT NOT NULL UNIQUE,
  generate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL,
  academic_year TEXT,
  study_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit_notes table
CREATE TABLE public.credit_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create academic_years table for managing school years
CREATE TABLE public.academic_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year TEXT NOT NULL UNIQUE, -- e.g., "2024-2025"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_academic_history table to track year progressions
CREATE TABLE public.student_academic_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  study_year INTEGER NOT NULL,
  program TEXT NOT NULL,
  specialty TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('En cours', 'Réussi', 'Redoublant', 'Abandonné')),
  passed_to_next_year BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented yet)
CREATE POLICY "Allow all operations on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payment_installments" ON public.payment_installments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on registration_attestations" ON public.registration_attestations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on credit_notes" ON public.credit_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on academic_years" ON public.academic_years FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on student_academic_history" ON public.student_academic_history FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_academic_history_updated_at
  BEFORE UPDATE ON public.student_academic_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert current academic year
INSERT INTO public.academic_years (year, start_date, end_date, is_current)
VALUES ('2024-2025', '2024-09-01', '2025-08-31', true);