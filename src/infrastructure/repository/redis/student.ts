import { createClient } from 'redis';
import { StudentRepository } from '../../../application/interfaces/student';
import { Student } from '../../../domain/student';

type RedisClient = ReturnType<typeof createClient>;

const updateStudentsBySchool = async (redis: RedisClient, schoolId: number, students: Student[]) => {
  const key = `dismissed::school::${schoolId}`;
  const studentsBySchool = await getStudentsBySchool(redis, schoolId);

  studentsBySchool.push(...students);

  await redis.set(key, JSON.stringify(studentsBySchool));
  return studentsBySchool;
};

const getStudentsBySchool = async (redis: RedisClient, schoolId: number) => {
  const key = `dismissed::school::${schoolId}`;
  const data = await redis.get(key);
  let students: Student[] = [];

  if (data) {
    students = JSON.parse(data) as Student[];
  }

  return students;
};

const newRedisStudentRepository = (redis: RedisClient): StudentRepository => ({
  updateStudentsBySchool: async (students: Student[], schoolId: number) =>
    updateStudentsBySchool(redis, schoolId, students),
  getStudentsBySchool: async (schoolId: number) => getStudentsBySchool(redis, schoolId)
});

export { newRedisStudentRepository };
