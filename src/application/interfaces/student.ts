import { Student } from '../../domain/student';

interface StudentRepository {
  updateStudentsBySchool: (students: Student[], schoolId: number) => Promise<Student[]>;
  getStudentsBySchool: (schoolId: number) => Promise<Student[]>;
}

export { StudentRepository };
