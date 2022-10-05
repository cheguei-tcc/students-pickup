import { createClient } from 'redis';
import { ResponsibleRepository } from '../../../application/interfaces/responsible';
import { Responsible } from '../../../domain/responsible';

type RedisClient = ReturnType<typeof createClient>;

const getStudents = async (redis: RedisClient, responsibleId: number) => {
  const data = await redis.get(`responsible::data::${responsibleId}`);
  const responsible = JSON.parse(data!) as Responsible;

  return responsible?.students ? responsible.students : [];
};

const upsert = async (redis: RedisClient, responsible: Responsible) => {
  const key = `responsible::data::${responsible.id}`;
  await redis.set(key, JSON.stringify(responsible));
};

const newRedisResponsibleRepository = (redis: RedisClient): ResponsibleRepository => ({
  getStudents: async (responsibleId: number) => getStudents(redis, responsibleId),
  upsert: async (responsible: Responsible) => upsert(redis, responsible)
});

export { newRedisResponsibleRepository };
