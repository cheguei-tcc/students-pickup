import { Job, Queue, Worker } from 'bullmq';
import { Logger } from '../../../application/interfaces/logger';
import { RankingRepository } from '../../../application/interfaces/ranking';
import { Config } from '../../config';

const QUEUE_NAME = 'CLEAN_RANKING_QUEUE';

export const createRankingCleanerQueue = async ({ redisHost }: Config) => {
  const cleanRankingQueue = new Queue(QUEUE_NAME, { connection: { host: redisHost, port: 6379 } });

  const crons = ['* 15 12 * * *', '* 15 18 * * *'];

  for (const cron of crons) {
    await cleanRankingQueue.add(
      'clean',
      {},
      {
        repeat: {
          cron
        }
      }
    );
  }
};

export const runRankingCleanerWorker = async (
  rankingRepository: RankingRepository,
  logger: Logger,
  { redisHost }: Config
) => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      logger.info(`processing job: ${job.name}`);
      await rankingRepository.cleanRankings();
    },
    { connection: { host: redisHost } }
  );

  worker.on('completed', ({ id }) => logger.info(`job: ${id} for ranking cleaning complete`));
};
