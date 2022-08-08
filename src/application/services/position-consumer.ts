import { PositionMessage } from '../../domain/position';
import { Socket } from '../interfaces/socket';

interface PositionConsumerService {
  handle: (message: PositionMessage) => Promise<void>;
}

const handle = async (
  message: PositionMessage,
  socket: Socket
): Promise<void> => {
  const { responsible, school, status } = message;

  await socket.emit('student-arrived', {
    msg: { responsible, school, children: [1, 2, 3, 4, 5, 6], status },
    group: school.name
  });
};

const newPositionConsumerService = (
  socket: Socket
): PositionConsumerService => ({
  handle: async (message: PositionMessage) => handle(message, socket)
});

export { newPositionConsumerService, PositionConsumerService };
