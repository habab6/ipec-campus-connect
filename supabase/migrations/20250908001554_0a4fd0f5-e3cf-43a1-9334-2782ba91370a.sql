-- Ajouter les colonnes pour les informations de remboursement à la table payments
ALTER TABLE public.payments 
ADD COLUMN refund_date date,
ADD COLUMN refund_method text,
ADD COLUMN refund_reason text;