import { Consumer } from 'sqs-consumer';
import { PositionMessage } from '../../../application/dtos/position';
import { PositionConsumerService } from '../../../application/services/position-consumer';
import { Config } from '../../config';

const createPositionSQSConsumer = async (config: Config, handler: PositionConsumerService) =>
  Consumer.create({
    region: config.awsRegion,
    queueUrl: config.queueUrl,
    handleMessage: async (message) => handler.updateRankingAndEmit(JSON.parse(message.Body!) as PositionMessage)
  });

export { createPositionSQSConsumer };
