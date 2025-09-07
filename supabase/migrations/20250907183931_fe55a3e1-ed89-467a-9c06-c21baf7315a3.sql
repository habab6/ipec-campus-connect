-- Activer Supabase Realtime pour les tables payments, invoices et registration_attestations

-- Configurer REPLICA IDENTITY FULL pour capturer toutes les données lors des mises à jour
ALTER TABLE public.payments REPLICA IDENTITY FULL;
ALTER TABLE public.invoices REPLICA IDENTITY FULL;
ALTER TABLE public.registration_attestations REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication supabase_realtime pour activer le temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.registration_attestations;