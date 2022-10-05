import { PositionMessage } from '../dtos/position';
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
  const { responsible, school, distanceMeters, estimatedTime } = message;
  logger.info(`update ranking for responsible => ${responsible.id} from school ${school.id}`);

  const rankingKey = String(school.id);
  const rankingCriteria: RankingCriteria = { distanceMeters, estimatedTime };

  await rankingService.updateRanking(rankingKey, responsible, rankingCriteria);
  const ranking = await rankingService.getRanking(rankingKey);

  socket.emit('responsible-ranking', {
    msg: { ranking },
    group: school.CNPJ
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
