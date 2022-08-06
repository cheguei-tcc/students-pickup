import { Responsible } from './responsible';
import { School } from './school';

enum Status {
  ARRIVED = 'ARRIVED',
  ON_THE_WAY = 'ON_THE_WAY',
  CANCELED = 'CANCELED'
}

type PositionMessage = {
  school: School;
  responsible: Responsible;
  status: Status;
};

export { PositionMessage };
