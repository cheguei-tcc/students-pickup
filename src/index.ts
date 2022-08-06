import Pino from 'pino';
import { Config, configFromEnv } from './infrastructure/config';
import { newServer } from './infrastructure/server';

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

  const { httpServer } = newServer(logger);

  try {
    httpServer.listen(config.port, () =>
      logger.info(`listening on port: ${config.port}`)
    );
  } catch (err) {
    logger.error(`server error: ${err.message}\n${err.stack}`);
  }
};

const main = async () => {
  const config = configFromEnv();
  await initDependencies(config);
};

main();
