-- Clear all data from the database
-- Delete in order to respect foreign key constraints

-- Clear tables with foreign key dependencies first
DELETE FROM payment_installments;
DELETE FROM invoices;
DELETE FROM credit_notes;
DELETE FROM registration_attestations;
DELETE FROM student_academic_history;
DELETE FROM payments;

-- Clear main tables
DELETE FROM students;
DELETE FROM academic_years;