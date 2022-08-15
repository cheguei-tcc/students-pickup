import { Responsible } from '../../domain/responsible';
import { RankingCriteria, ResponsibleRanking } from '../dtos/ranking';

interface RankingRepository {
  getRanking: (key: string) => Promise<ResponsibleRanking[]>;
  updateRanking: (key: string, responsible: Responsible, rankingCriteria: RankingCriteria) => Promise<void>;
  lastRankingCriteriaByResponsible: (responsible: Responsible) => Promise<RankingCriteria>;
  updateLastRankingCriteriaByResponsible: (responsible: Responsible, rankingCriteria: RankingCriteria) => Promise<void>;
  cleanRankings: () => Promise<void>;
}

export { RankingRepository };
