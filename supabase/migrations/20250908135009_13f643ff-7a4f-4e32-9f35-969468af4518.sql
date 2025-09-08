-- Créer les notes de crédit manquantes pour les paiements remboursés

-- Note de crédit pour le Minerval 2026-2027 (5000€)
INSERT INTO credit_notes (
  student_id,
  original_invoice_id,
  number,
  amount,
  reason,
  date
) VALUES (
  '8abed3cc-4f01-4bef-a49f-d6c98feccd9a',
  '213bb9db-8eb7-4cf4-af09-271325839ae8',
  'IPEC-2025-0003-MIN-NC',
  5000.00,
  'Remboursement automatique',
  '2025-09-08'
);

-- Note de crédit pour le Minerval 2025-2026 (5000€)
INSERT INTO credit_notes (
  student_id,
  original_invoice_id,
  number,
  amount,
  reason,
  date
) VALUES (
  '8abed3cc-4f01-4bef-a49f-d6c98feccd9a',
  '3a5300e8-f8dd-4d2d-9c4b-f483fc21a53c',
  'IPEC-2025-0002-MIN-NC',
  5000.00,
  'Remboursement automatique',
  '2025-09-08'
);

-- Note de crédit pour les Frais d'envoi (120€)
INSERT INTO credit_notes (
  student_id,
  original_invoice_id,
  number,
  amount,
  reason,
  date
) VALUES (
  '8abed3cc-4f01-4bef-a49f-d6c98feccd9a',
  '2c806f90-3608-45b5-b0f7-e11604601776',
  'IPEC-2025-0004-FAC-NC',
  120.00,
  'refus',
  '2025-09-08'
);