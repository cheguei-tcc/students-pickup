import { Responsible } from '../../domain/responsible';
import { Student } from '../../domain/student';

interface ResponsibleRepository {
  getStudents: (responsibleId: number) => Promise<Student[]>;
  upsert: (responsible: Responsible) => Promise<void>;
}

export { ResponsibleRepository };
