import { createClient } from 'redis';

import { Config } from '../../config';

const createRedisClient = async (config: Config) => {
  const client = createClient({
    url: config.redisUri
  });

  await client.connect();
  return client;
};

export { createRedisClient };
export { newRedisRankingRepository } from './ranking';
export { newRedisResponsibleRepository } from './responsible';
