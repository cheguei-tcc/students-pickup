import { Responsible } from '../../domain/responsible';

type ResponsibleRanking = {
  responsible: Responsible;
  rank: { value: number; arrived?: boolean } & Partial<RankingCriteria>;
};

type RankingCriteria = {
  estimatedTime: number;
  distanceMeters: number;
};

export { ResponsibleRanking, RankingCriteria };
