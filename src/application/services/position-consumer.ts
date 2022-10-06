import { PositionMessage, Status } from '../dtos/position';
import { RankingCriteria } from '../dtos/ranking';
import { Logger } from '../interfaces/logger';
import { Socket } from '../interfaces/socket';
import { RankingService } from './ranking';

interface PositionConsumerService {
  updateRankingAndEmit: (message: PositionMessage) => Promise<void>;
}

const updateRankingAndEmit = async (
  message: PositionMessage,
  rankingService: RankingService,
  socket: Socket,
  logger: Logger
): Promise<void> => {
  logger.info(`consuming message: ${JSON.stringify(message)}`);
  const { responsible, school, distanceMeters, estimatedTime, status } = message;

  if (!responsible?.id || !school?.id) {
    logger.info(`[DO NOTHING] missing responsibleId or schoolId on position message => ${JSON.stringify(message)}`);
    return;
  }

  if (status && status === Status.CANCELED) {
    await rankingService.removeResponsible(String(school.id), responsible.id);
    logger.info(`[CANCELED] remove responsible => ${responsible.id} from rank => ${school.id}`);

    const ranking = await rankingService.getRanking(String(school.id));

    socket.emit('responsible-ranking', {
      msg: JSON.stringify({ ranking }),
      group: String(school.id)
    });

    return;
  }

  logger.info(`update ranking for responsible => ${responsible.id} from school ${school.id}`);

  const rankingKey = String(school.id);
  const rankingCriteria: RankingCriteria = { distanceMeters, estimatedTime };

  await rankingService.updateRanking(rankingKey, responsible, rankingCriteria);
  const ranking = await rankingService.getRanking(rankingKey);

  socket.emit('responsible-ranking', {
    msg: JSON.stringify({ ranking }),
    group: String(school.id)
  });

  logger.info(
    `sent responsible-arrived event to monitors, ranking => schoolId: ${rankingKey} lenght: ${ranking.length}`
  );
};

const newPositionConsumerService = (
  socket: Socket,
  logger: Logger,
  rankingService: RankingService
): PositionConsumerService => ({
  updateRankingAndEmit: async (message: PositionMessage) =>
    updateRankingAndEmit(message, rankingService, socket, logger)
});

export { newPositionConsumerService, PositionConsumerService };
