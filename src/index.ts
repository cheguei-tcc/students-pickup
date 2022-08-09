import Pino from 'pino';
import { Config, configFromEnv } from './infrastructure/config';
import { newServer } from './infrastructure/server';
import { Consumer } from 'sqs-consumer';
import { newSocketIOAdapter } from './infrastructure/socket/io';
import { newPositionConsumerService } from './application/services/position-consumer';
import { PositionMessage } from './domain/position';

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

  const { httpServer, io } = newServer(logger);

  const socketIOAdapter = newSocketIOAdapter(io);

  const positionConsumerService = newPositionConsumerService(
    socketIOAdapter,
    logger
  );

  logger.info(`connecting consumer on queueUrl => ${config.queueUrl}`);

  const positionMessageConsumer = Consumer.create({
    region: config.awsRegion,
    queueUrl: config.queueUrl,
    handleMessage: async (message) =>
      positionConsumerService.handle(
        JSON.parse(message.Body) as PositionMessage
      )
  });
  positionMessageConsumer.start();

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
