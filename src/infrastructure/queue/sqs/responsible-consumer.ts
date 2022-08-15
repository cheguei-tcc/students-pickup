import { Consumer } from 'sqs-consumer';
import { ResponsibleMessage } from '../../../application/dtos/responsible';
import { ResponsibleConsumerService } from '../../../application/services/responsible-consumer';
import { Config } from '../../config';

const createResponsibleSQSConsumer = async (config: Config, handler: ResponsibleConsumerService) =>
  Consumer.create({
    region: config.awsRegion,
    queueUrl: config.responsibleDataQueueUrl,
    handleMessage: async (message) => handler.updateResponsibleData(JSON.parse(message.Body!) as ResponsibleMessage)
  });

export { createResponsibleSQSConsumer };
