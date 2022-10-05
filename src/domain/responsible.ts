import { School } from './school';
import { Student } from './student';

type Responsible = {
  id: number;
  schoolId?: number;
  name?: string;
  CPF?: string;
  school?: School;
  students?: Student[];
};

export { Responsible };
