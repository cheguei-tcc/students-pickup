import Pino from 'pino';
import { Config, configFromEnv } from './infrastructure/config';
import { newServer } from './infrastructure/server';
import { newSocketIOAdapter } from './infrastructure/socket/io';
import { newPositionConsumerService } from './application/services/position-consumer';
import {
  createRedisClient,
  newRedisRankingRepository,
  newRedisResponsibleRepository
} from './infrastructure/repository/redis';
import { createPositionSQSConsumer, createResponsibleSQSConsumer } from './infrastructure/queue/sqs';
import { createRankingCleanerQueue, runRankingCleanerWorker } from './infrastructure/queue/bullmq/clean-ranking';
import { newResponsibleConsumerService } from './application/services/responsible-consumer';
import { newRankingService } from './application/services/ranking';

const initDependencies = async (config: Config) => {
  const logger = Pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: true
      }
    }
  });

  const redisClient = await createRedisClient(config, logger);
  const redisRankingRepository = newRedisRankingRepository(redisClient, config);
  const redisResponsibleRepository = newRedisResponsibleRepository(redisClient);

  const rankingService = newRankingService(redisRankingRepository, redisResponsibleRepository);
  const responsibleConsumerService = newResponsibleConsumerService(logger, redisResponsibleRepository);

  // ranking service is on server construct to emit ranking to new monitors connected to socket
  const { httpServer, io } = newServer(logger, rankingService);

  const socketIOAdapter = newSocketIOAdapter(io);

  const positionConsumerService = newPositionConsumerService(socketIOAdapter, logger, rankingService);

  logger.info(`connecting position consumer on queueUrl => ${config.queueUrl}`);
  logger.info(`connecting responsible data consumer on queueUrl => ${config.responsibleDataQueueUrl}`);

  const positionConsumer = await createPositionSQSConsumer(config, positionConsumerService);
  const responsibleConsumer = await createResponsibleSQSConsumer(config, responsibleConsumerService);

  positionConsumer.start();
  responsibleConsumer.start();

  logger.info('starting ranking cleaner queue and worker');

  await createRankingCleanerQueue(config);
  await runRankingCleanerWorker(redisRankingRepository, logger, config);

  try {
    httpServer.listen(config.port, () => logger.info(`listening on port: ${config.port}`));
  } catch (err: any) {
    logger.error(`server error: ${err.message}\n${err.stack}`);
  }
};

const main = async () => {
  const config = configFromEnv();
  await initDependencies(config);
};

main();
