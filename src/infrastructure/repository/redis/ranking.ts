import { RankingRepository } from '../../../application/interfaces/ranking';
import { createClient } from 'redis';
import { RankingCriteria, ResponsibleRanking } from '../../../application/dtos/ranking';
import { Responsible } from '../../../domain/responsible';
import { Config } from '../../config';

type RedisClient = ReturnType<typeof createClient>;

const removeResponsible = async (redis: RedisClient, key: string, responsibleId: number) => {
  const redisKey = `ranking::school::${key}`;
  const responsibleKey = `responsible::${responsibleId}`;

  await redis.zRem(redisKey, responsibleKey);
};

const updateRanking = async (
  redis: RedisClient,
  config: Config,
  key: string,
  responsible: Responsible,
  rankingCriteria: RankingCriteria
) => {
  const { distanceMeters, estimatedTime } = rankingCriteria;
  const { distanceRankingWeight, estimatedTimeRankingWeight } = config;

  let score = estimatedTime;

  // if weighted score is set we use the weighted calculation to set score
  if (config.weightedScore) {
    score = distanceMeters * distanceRankingWeight + estimatedTime * estimatedTimeRankingWeight;
  }

  const { id } = responsible;
  const responsibleKey = `responsible::${id}`;
  const redisKey = `ranking::school::${key}`;

  redis.zAdd(redisKey, { score, value: responsibleKey });
};

// key format => responsible::ID
const getResponsibleIDFromKey = (key: string) => key.split('::')[1];

const getRanking = async (redis: RedisClient, key: string): Promise<ResponsibleRanking[]> => {
  // ranking is a array of strings in responsibleKey format => responsible::ID
  // the order is important, the first position is the first children to be delivery
  const ranking = await redis.zRange(`ranking::school::${key}`, 0, -1);
  return ranking.map((key, rank) => ({
    responsible: {
      id: Number(getResponsibleIDFromKey(key))
    },
    rank: {
      value: rank
    }
  }));
};

const lastRankingCriteriaByResponsible = async (
  redis: RedisClient,
  responsible: Responsible
): Promise<RankingCriteria> => {
  const data = await redis.get(`ranking::criteria::responsible::${responsible.id}`);
  return JSON.parse(data!) as RankingCriteria;
};

const updateLastRankingCriteriaByResponsible = async (
  redis: RedisClient,
  responsible: Responsible,
  rankingCriteria: RankingCriteria
) => {
  const key = `ranking::criteria::responsible::${responsible.id}`;
  const json = JSON.stringify(rankingCriteria);
  await redis.set(key, json);
};

const cleanRankings = async (redis: RedisClient) => {
  const keys = await redis.keys('ranking::[^criteria]*');
  // we must delete every sorted set key
  for (const key of keys) {
    const type = await redis.type(key);
    if (type === 'zset') await redis.del(key);
  }
};

const newRedisRankingRepository = (redis: RedisClient, config: Config): RankingRepository => ({
  getRanking: async (key: string) => getRanking(redis, key),
  updateRanking: async (key: string, responsible: Responsible, rankingCriteria: RankingCriteria) =>
    updateRanking(redis, config, key, responsible, rankingCriteria),
  lastRankingCriteriaByResponsible: async (responsible: Responsible) =>
    lastRankingCriteriaByResponsible(redis, responsible),
  updateLastRankingCriteriaByResponsible: async (responsible: Responsible, rankingCriteria: RankingCriteria) =>
    updateLastRankingCriteriaByResponsible(redis, responsible, rankingCriteria),
  cleanRankings: async () => cleanRankings(redis),
  removeResponsible: async (key: string, responsibleId: number) => removeResponsible(redis, key, responsibleId)
});

export { newRedisRankingRepository };
