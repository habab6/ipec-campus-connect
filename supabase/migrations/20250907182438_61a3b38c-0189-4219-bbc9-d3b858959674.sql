-- Supprimer les triggers et fonctions qui cassent le système

-- Supprimer les triggers
DROP TRIGGER IF EXISTS auto_generate_invoice_trigger ON payments;
DROP TRIGGER IF EXISTS auto_generate_attestation_trigger ON registration_attestations;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS trigger_auto_generate_invoice();
DROP FUNCTION IF EXISTS trigger_auto_generate_attestation();