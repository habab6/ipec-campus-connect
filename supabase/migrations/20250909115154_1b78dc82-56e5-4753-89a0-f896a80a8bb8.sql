-- Mettre à jour la contrainte de statut pour permettre 'Archivé'
ALTER TABLE public.students 
DROP CONSTRAINT students_status_check;

ALTER TABLE public.students 
ADD CONSTRAINT students_status_check 
CHECK (status = ANY (ARRAY['Actif'::text, 'Inactif'::text, 'Suspendu'::text, 'Archivé'::text]));