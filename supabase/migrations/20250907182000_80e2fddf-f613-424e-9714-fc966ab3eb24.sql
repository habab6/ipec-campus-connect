-- Créer des triggers pour générer automatiquement les PDFs

-- Fonction pour déclencher la génération automatique de facture
CREATE OR REPLACE FUNCTION trigger_auto_generate_invoice()
RETURNS TRIGGER AS $$
BEGIN
  -- Appeler l'edge function pour générer la facture automatiquement
  PERFORM net.http_post(
    url := 'https://otifwbmkdjjfhlueddrw.supabase.co/functions/v1/auto-generate-invoice',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWZ3Ym1rZGpqZmhsdWVkZHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjczMTcsImV4cCI6MjA3Mjc0MzMxN30.4TgncPatbqzSqmWEIPEofrvrOWSVApaOOOd0pENdDWo"}'::jsonb,
    body := json_build_object('paymentId', NEW.id)::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour déclencher la génération automatique d'attestation  
CREATE OR REPLACE FUNCTION trigger_auto_generate_attestation()
RETURNS TRIGGER AS $$
BEGIN
  -- Appeler l'edge function pour générer l'attestation automatiquement
  PERFORM net.http_post(
    url := 'https://otifwbmkdjjfhlueddrw.supabase.co/functions/v1/auto-generate-attestation',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aWZ3Ym1rZGpqZmhsdWVkZHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjczMTcsImV4cCI6MjA3Mjc0MzMxN30.4TgncPatbqzSqmWEIPEofrvrOWSVApaOOOd0pENdDWo"}'::jsonb,
    body := json_build_object('attestationId', NEW.id)::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour les paiements (génération automatique de factures)
CREATE TRIGGER auto_generate_invoice_trigger
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_generate_invoice();

-- Créer le trigger pour les attestations (génération automatique de PDFs)
CREATE TRIGGER auto_generate_attestation_trigger
  AFTER INSERT ON registration_attestations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_generate_attestation();