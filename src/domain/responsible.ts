import { School } from './school';
import { Student } from './student';

type Responsible = {
  name?: string;
  CPF: string;
  school?: School;
  students?: Student[];
};

export { Responsible };
