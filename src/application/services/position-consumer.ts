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
  logger.info(`update ranking for responsible: ${responsible.name} from school ${school.name}::${school.CNPJ}`);

  const rankingKey = school.CNPJ;
  const rankingCriteria: RankingCriteria = { distanceMeters, estimatedTime };

  await rankingService.updateRanking(rankingKey, responsible, rankingCriteria);
  const ranking = await rankingService.getRanking(rankingKey);

  socket.emit('responsible-arrived', {
    msg: { ranking },
    group: school.CNPJ
  });

  logger.info(`sent responsible-arrived event to monitors, ranking => school: ${rankingKey} lenght: ${ranking.length}`);
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
