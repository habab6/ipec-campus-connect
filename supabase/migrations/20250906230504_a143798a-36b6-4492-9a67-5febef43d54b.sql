-- Clear all data from the database tables
-- Delete in order to respect foreign key constraints

DELETE FROM payment_installments;
DELETE FROM credit_notes;
DELETE FROM invoices;
DELETE FROM payments;
DELETE FROM registration_attestations;
DELETE FROM student_academic_history;
DELETE FROM students;
DELETE FROM academic_years;