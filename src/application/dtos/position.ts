import { Responsible } from '../../domain/responsible';
import { School } from '../../domain/school';

enum Status {
  ARRIVED = 'ARRIVED',
  ON_THE_WAY = 'ON_THE_WAY',
  CANCELED = 'CANCELED'
}

type PositionMessage = {
  school: School;
  responsible: Responsible;
  status: Status;
  estimatedTime: number;
  distanceMeters: number;
};

export { PositionMessage };
