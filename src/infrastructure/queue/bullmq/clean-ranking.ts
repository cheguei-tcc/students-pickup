import { Job, Queue, Worker, QueueScheduler } from 'bullmq';
import { Logger } from '../../../application/interfaces/logger';
import { RankingRepository } from '../../../application/interfaces/ranking';
import { Config } from '../../config';

const QUEUE_NAME = 'CLEAN_RANKING_QUEUE';

// this process repeats 12:15 UTC and 18:15 UTC every day to clean every sorted set key on redis
export const runRankingCleanerScheduledProcess = async (
  { redisHost }: Config,
  logger: Logger,
  rankingRepository: RankingRepository
) => {
  // creates the queue instance
  const cleanRankingQueue = new Queue(QUEUE_NAME, { connection: { host: redisHost, port: 6379 } });
  // crates the scheduler that handle delayed/repeateble jobs
  const queueScheduler = new QueueScheduler(QUEUE_NAME, { connection: { host: redisHost, port: 6379 } });

  // starts a worker to process jobs from queue
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      logger.info(`processing job: ${job.name} on ranking cleaner worker`);
      await rankingRepository.cleanRankings();
      logger.info('clean ranking');
      await rankingRepository.cleanDismissed();
      logger.info('clean dismisseds');
    },
    { connection: { host: redisHost, port: 6379 } }
  );

  worker.on('completed', ({ id }) => logger.info(`job: ${id} for ranking cleaning complete`));

  queueScheduler.on('stalled', (jobId, prev) =>
    logger.info(`stalled job event from scheduler, jobId=> ${jobId} prev=> ${prev}`)
  );
  queueScheduler.on('error', (err) => logger.error(`error on queue scheduler, err=> ${JSON.stringify(err)}`));

  const crons = ['30 15 12 * * *', '30 15 18 * * *'];

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
