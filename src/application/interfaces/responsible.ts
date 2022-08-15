import { Responsible } from '../../domain/responsible';
import { Student } from '../../domain/student';

interface ResponsibleRepository {
  getStudents: (responsibleCPF: string) => Promise<Student[]>;
  upsert: (responsible: Responsible) => Promise<void>;
}

export { ResponsibleRepository };
