type Config = {
  nodeEnv: string;
  logLevel: string;
  port: string;
  redisUri: string;
  redisHost: string;
  queueUrl: string;
  responsibleDataQueueUrl: string;
  awsRegion: string;
  distanceRankingWeight: number;
  estimatedTimeRankingWeight: number;
  weightedScore: boolean;
};

const configFromEnv = (): Config => ({
  nodeEnv: process.env.NODE_ENV ?? 'local',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  port: process.env.PORT ?? '3000',
  redisUri: process.env.REDIS_URI ?? 'redis://localhost:6379',
  queueUrl: process.env.STUDENTS_PICKUP_QUEUE_URL ?? 'sqs-local',
  responsibleDataQueueUrl: process.env.UPDATE_RESPONSIBLE_QUEUE_URL ?? 'sqs-local',
  awsRegion: process.env.AWS_DEFAULT_REGION ?? 'sa-east-1',
  distanceRankingWeight: Number(process.env.DISTANCE_RANKING_WEIGHT) || 0.9,
  estimatedTimeRankingWeight: Number(process.env.ESTIMATED_TIME_RANKING_WEIGHT) || 0.1,
  redisHost: process.env.REDIS_HOST || 'localhost',
  weightedScore: process.env.WEIGHTED_SCORE === 'true'
});

export { Config, configFromEnv };
