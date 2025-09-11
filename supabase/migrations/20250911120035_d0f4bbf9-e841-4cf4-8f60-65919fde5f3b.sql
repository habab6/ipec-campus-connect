-- Créer une table profiles pour les utilisateurs étudiants
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  student_reference TEXT UNIQUE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leur propre profil
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Politique pour que les admins puissent tout voir (pour la gestion)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Modifier les politiques RLS pour les documents des étudiants

-- Politique pour les attestations d'inscription - les étudiants peuvent voir leurs propres attestations
CREATE POLICY "Students can view their own attestations" 
ON public.registration_attestations 
FOR SELECT 
USING (
  student_id IN (
    SELECT student_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Politique pour les factures - les étudiants peuvent voir leurs propres factures
CREATE POLICY "Students can view their own invoices" 
ON public.invoices 
FOR SELECT 
USING (
  student_id IN (
    SELECT student_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Politique pour les notes de crédit - les étudiants peuvent voir leurs propres notes de crédit
CREATE POLICY "Students can view their own credit notes" 
ON public.credit_notes 
FOR SELECT 
USING (
  student_id IN (
    SELECT student_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Politique pour les paiements - les étudiants peuvent voir leurs propres paiements
CREATE POLICY "Students can view their own payments" 
ON public.payments 
FOR SELECT 
USING (
  student_id IN (
    SELECT student_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Fonction pour mettre à jour updated_at sur profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();