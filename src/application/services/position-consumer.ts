import { PositionMessage } from '../../domain/position';
import { Logger } from '../interfaces/logger';
import { Socket } from '../interfaces/socket';

interface PositionConsumerService {
  handle: (message: PositionMessage) => Promise<void>;
}

const handle = async (
  message: PositionMessage,
  socket: Socket,
  logger: Logger
): Promise<void> => {
  logger.info(`consuming message: ${JSON.stringify(message)}`);

  const { responsible, school, status } = message;

  await socket.emit('student-arrived', {
    msg: { responsible, school, children: [1, 2, 3, 4, 5, 6], status },
    group: school.name
  });
};

const newPositionConsumerService = (
  socket: Socket,
  logger: Logger
): PositionConsumerService => ({
  handle: async (message: PositionMessage) => handle(message, socket, logger)
});

export { newPositionConsumerService, PositionConsumerService };
