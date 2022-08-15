import { createClient } from 'redis';
import { ResponsibleRepository } from '../../../application/interfaces/responsible';
import { Responsible } from '../../../domain/responsible';

type RedisClient = ReturnType<typeof createClient>;

const getStudents = async (redis: RedisClient, responsibleCPF: string) => {
  const data = await redis.get(`responsible::data::${responsibleCPF}`);
  const responsible = JSON.parse(data!) as Responsible;

  return responsible?.students ? responsible.students : [];
};

const upsert = async (redis: RedisClient, responsible: Responsible) => {
  const key = `responsible::data::${responsible.CPF}`;
  await redis.set(key, JSON.stringify(responsible));
};

const newRedisResponsibleRepository = (redis: RedisClient): ResponsibleRepository => ({
  getStudents: async (responsibleCPF: string) => getStudents(redis, responsibleCPF),
  upsert: async (responsible: Responsible) => upsert(redis, responsible)
});

export { newRedisResponsibleRepository };
