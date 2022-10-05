import { ResponsibleMessage } from '../dtos/responsible';
import { Logger } from '../interfaces/logger';
import { ResponsibleRepository } from '../interfaces/responsible';

interface ResponsibleConsumerService {
  updateResponsibleData: (message: ResponsibleMessage) => Promise<void>;
}

const updateResponsibleData = async (
  logger: Logger,
  responsibleRepository: ResponsibleRepository,
  message: ResponsibleMessage
) => {
  logger.info(`upsert responsible data => ${JSON.stringify(message)}`);

  if (!message.responsible?.id) {
    logger.info(`[DO NOTHING] upsert responsible data without responsibleId => ${JSON.stringify(message)}`);
    return;
  }

  return responsibleRepository.upsert(message.responsible);
};

const newResponsibleConsumerService = (
  logger: Logger,
  responsibleRepository: ResponsibleRepository
): ResponsibleConsumerService => ({
  updateResponsibleData: async (message: ResponsibleMessage) =>
    updateResponsibleData(logger, responsibleRepository, message)
});
export { newResponsibleConsumerService, ResponsibleConsumerService };
