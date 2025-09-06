import type { Student, DbStudent } from '@/types';

// Convert database student to frontend student
export function dbStudentToStudent(dbStudent: DbStudent): Student {
  return {
    id: dbStudent.id,
    reference: dbStudent.reference,
    civilite: dbStudent.civilite,
    firstName: dbStudent.first_name,
    lastName: dbStudent.last_name,
    dateOfBirth: dbStudent.date_of_birth,
    cityOfBirth: dbStudent.city_of_birth,
    countryOfBirth: dbStudent.country_of_birth,
    nationality: dbStudent.nationality,
    identityNumber: dbStudent.identity_number,
    phone: dbStudent.phone,
    email: dbStudent.email,
    address: dbStudent.address,
    program: dbStudent.program,
    studyYear: dbStudent.study_year,
    specialty: dbStudent.specialty,
    academicYear: dbStudent.academic_year,
    notes: dbStudent.notes,
    registrationDate: dbStudent.registration_date,
    registrationYear: dbStudent.registration_year,
    status: dbStudent.status,
    hasMBA2Diploma: dbStudent.has_mba2_diploma
  };
}

// Convert frontend student to database student
export function studentToDbStudent(student: Omit<Student, 'id'>): Omit<DbStudent, 'id' | 'created_at' | 'updated_at'> {
  return {
    reference: student.reference,
    civilite: student.civilite,
    first_name: student.firstName,
    last_name: student.lastName,
    date_of_birth: student.dateOfBirth,
    city_of_birth: student.cityOfBirth,
    country_of_birth: student.countryOfBirth,
    nationality: student.nationality,
    identity_number: student.identityNumber,
    phone: student.phone,
    email: student.email,
    address: student.address,
    program: student.program,
    study_year: student.studyYear,
    specialty: student.specialty,
    academic_year: student.academicYear,
    notes: student.notes,
    registration_date: student.registrationDate,
    registration_year: student.registrationYear,
    status: student.status,
    has_mba2_diploma: student.hasMBA2Diploma
  };
}