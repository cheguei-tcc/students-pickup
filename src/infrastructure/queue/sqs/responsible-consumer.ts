import { Consumer } from 'sqs-consumer';
import { ResponsibleMessage } from '../../../application/dtos/responsible';
import { ResponsibleConsumerService } from '../../../application/services/responsible-consumer';
import { Config } from '../../config';

const createResponsibleSQSConsumer = async (config: Config, handler: ResponsibleConsumerService) =>
  Consumer.create({
    region: config.awsRegion,
    queueUrl: config.responsibleDataQueueUrl,
    handleMessage: async (message) => {
      const parsedMsg = JSON.parse(message.Body!);

      parsedMsg.Type === 'Notification' // if message came from an SNS event
        ? await handler.updateResponsibleData(JSON.parse(parsedMsg.Message) as ResponsibleMessage)
        : await handler.updateResponsibleData(parsedMsg as ResponsibleMessage);
    }
  });

export { createResponsibleSQSConsumer };
