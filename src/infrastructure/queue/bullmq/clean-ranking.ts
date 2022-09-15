import { Job, Queue, Worker, QueueScheduler } from 'bullmq';
import { Logger } from '../../../application/interfaces/logger';
import { RankingRepository } from '../../../application/interfaces/ranking';
import { Config } from '../../config';

const QUEUE_NAME = 'CLEAN_RANKING_QUEUE';

export const createRankingCleanerQueue = async ({ redisHost }: Config, logger: Logger) => {
  const cleanRankingQueue = new Queue(QUEUE_NAME, { connection: { host: redisHost, port: 6379 } });
  const queueScheduler = new QueueScheduler(QUEUE_NAME, { connection: { host: redisHost, port: 6379 } });

  queueScheduler.on('stalled', (jobId, prev) =>
    logger.info(`stalled job event from scheduler, jobId=> ${jobId} prev=> ${prev}`)
  );
  queueScheduler.on('error', (err) => logger.error(`error on queue scheduler, err=> ${JSON.stringify(err)}`));

  const crons = ['* 15 12 * * *', '* 15 18 * * *'];

  for (const cron of crons) {
    await cleanRankingQueue.add(
      'clean',
      {},
      {
        repeat: {
          cron,
          limit: 1,
          tz: 'UTC'
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
      logger.info(`processing job: ${job.name} on ranking cleaner worker`);
      await rankingRepository.cleanRankings();
    },
    { connection: { host: redisHost, port: 6379 } }
  );

  worker.on('completed', ({ id }) => logger.info(`job: ${id} for ranking cleaning complete`));
};
