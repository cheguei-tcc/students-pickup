import { PositionMessage } from '../dtos/position';
import { RankingCriteria } from '../dtos/ranking';
import { Logger } from '../interfaces/logger';
import { RankingRepository } from '../interfaces/ranking';
import { Socket } from '../interfaces/socket';
import { RankingService } from './ranking';

interface PositionConsumerService {
  updateRankingAndEmit: (message: PositionMessage) => Promise<void>;
}

const updateRankingAndEmit = async (
  message: PositionMessage,
  rankingRepository: RankingRepository,
  rankingService: RankingService,
  socket: Socket,
  logger: Logger
): Promise<void> => {
  logger.info(`consuming message: ${JSON.stringify(message)}`);
  const { responsible, school, distanceMeters, estimatedTime } = message;
  logger.info(`update ranking for responsible: ${responsible.name} from school ${school.name}::${school.CNPJ}`);

  const rankingKey = school.CNPJ;
  const rankingCriteria: RankingCriteria = { distanceMeters, estimatedTime };

  await rankingRepository.updateRanking(rankingKey, responsible, rankingCriteria);
  await rankingRepository.updateLastRankingCriteriaByResponsible(responsible, rankingCriteria);
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
  rankingRepository: RankingRepository,
  rankingService: RankingService
): PositionConsumerService => ({
  updateRankingAndEmit: async (message: PositionMessage) =>
    updateRankingAndEmit(message, rankingRepository, rankingService, socket, logger)
});

export { newPositionConsumerService, PositionConsumerService };
