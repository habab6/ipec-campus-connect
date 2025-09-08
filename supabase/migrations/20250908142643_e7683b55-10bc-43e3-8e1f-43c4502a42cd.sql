-- Vider toutes les tables dans l'ordre correct pour éviter les conflits de clés étrangères

-- Supprimer les données des tables dépendantes en premier
DELETE FROM payment_installments;
DELETE FROM credit_notes;
DELETE FROM invoices;
DELETE FROM registration_attestations;
DELETE FROM student_academic_history;
DELETE FROM payments;

-- Supprimer les données des tables principales
DELETE FROM students;
DELETE FROM academic_years;