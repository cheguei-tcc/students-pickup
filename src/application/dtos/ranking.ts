import { Responsible } from '../../domain/responsible';

type ResponsibleRanking = {
  responsible: Responsible;
  rank: { value: number } & Partial<RankingCriteria>;
};

type RankingCriteria = {
  estimatedTime: number;
  distanceMeters: number;
};

export { ResponsibleRanking, RankingCriteria };
