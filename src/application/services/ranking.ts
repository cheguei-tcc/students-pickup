import { Responsible } from '../../domain/responsible';
import { Config } from '../../infrastructure/config';
import { RankingCriteria, ResponsibleRanking } from '../dtos/ranking';
import { RankingRepository } from '../interfaces/ranking';
import { ResponsibleRepository } from '../interfaces/responsible';
import { Socket } from '../interfaces/socket';
import { StudentRepository } from '../interfaces/student';

interface RankingService {
  getRanking: (key: string) => Promise<ResponsibleRanking[]>;
  updateRanking: (key: string, responsible: Responsible, rankingCriteria: RankingCriteria) => Promise<void>;
  dismissedStudentFromRanking: (
    key: string,
    responsibleId: number,
    studentsIds: number[],
    socket: Socket
  ) => Promise<void>;
  dismissedResponsibleFromRanking: (key: string, responsibleId: number, socket: Socket) => Promise<void>;
  removeResponsible: (key: string, reponsibleId: number) => Promise<void>;
}

const dismissedResponsibleFromRanking = async (
  studentRepository: StudentRepository,
  rankingRepository: RankingRepository,
  responsibleRepository: ResponsibleRepository,
  socket: Socket,
  config: Config,
  key: string,
  responsibleId: number
) => {
  await rankingRepository.removeResponsible(key, responsibleId);
  const ranking = await getRanking(rankingRepository, responsibleRepository, studentRepository, config, key);

  socket.emit('responsible-ranking', {
    msg: JSON.stringify({ ranking }),
    group: key
  });

  const students = await responsibleRepository.getStudents(responsibleId);
  const dismissedStudents = await studentRepository.updateStudentsBySchool(students, Number(key));

  socket.emit('dismissed-students', {
    msg: JSON.stringify({ students: dismissedStudents }),
    group: key
  });
};

const dismissedStudentFromRanking = async (
  studentRepository: StudentRepository,
  rankingRepository: RankingRepository,
  responsibleRepository: ResponsibleRepository,
  socket: Socket,
  config: Config,
  key: string,
  responsibleId: number,
  studentsIds: number[]
) => {
  const students = await responsibleRepository.getStudents(responsibleId);

  const dismissedStudents = await studentRepository.updateStudentsBySchool(
    students.filter((s) => studentsIds.filter((id) => id === s.id).length > 0),
    Number(key)
  );

  if (students.length === studentsIds.length) await rankingRepository.removeResponsible(key, responsibleId);

  const ranking = await getRanking(rankingRepository, responsibleRepository, studentRepository, config, key);

  socket.emit('responsible-ranking', {
    msg: JSON.stringify({ ranking }),
    group: key
  });

  socket.emit('dismissed-students', {
    msg: JSON.stringify({ students: dismissedStudents }),
    group: key
  });
};

const updateRanking = async (
  rankingRepository: RankingRepository,
  key: string,
  responsible: Responsible,
  rankingCriteria: RankingCriteria
) => {
  await Promise.all([
    rankingRepository.updateRanking(key, responsible, rankingCriteria),
    // we also need to save the last rankingCriteria used by each responsible to populate the dynamic list
    rankingRepository.updateLastRankingCriteriaByResponsible(responsible, rankingCriteria)
  ]);
};

const getRanking = async (
  rankingRepository: RankingRepository,
  responsibleRepository: ResponsibleRepository,
  studentRepository: StudentRepository,
  config: Config,
  key: string
): Promise<ResponsibleRanking[]> => {
  const ranking = await rankingRepository.getRanking(key);

  // we also need to fetch some data that isn't presence on ranking since it persist just the score of given responsible
  for (const responsibleRanked of ranking) {
    const students = await responsibleRepository.getStudents(responsibleRanked.responsible.id);
    const { distanceMeters: lastDistance, estimatedTime: lastEstimatedTime } =
      await rankingRepository.lastRankingCriteriaByResponsible(responsibleRanked.responsible);

    const dismissedStudents = await studentRepository.getStudentsBySchool(Number(key));

    responsibleRanked.responsible.students = students.filter(
      (s) => dismissedStudents.filter((ds) => ds.id === s.id).length === 0
    );
    responsibleRanked.rank.distanceMeters = lastDistance;
    responsibleRanked.rank.estimatedTime = lastEstimatedTime;
    responsibleRanked.rank.arrived = lastEstimatedTime <= config.arrivedThresholdSeconds;
  }

  return ranking;
};

const newRankingService = (
  rankingRepository: RankingRepository,
  responsibleRepository: ResponsibleRepository,
  studentRepository: StudentRepository,
  config: Config
): RankingService => ({
  getRanking: async (key: string) =>
    getRanking(rankingRepository, responsibleRepository, studentRepository, config, key),
  updateRanking: async (key: string, responsible: Responsible, rankingCriteria: RankingCriteria) =>
    updateRanking(rankingRepository, key, responsible, rankingCriteria),
  dismissedStudentFromRanking: async (key: string, responsibleId: number, studentsIds: number[], socket: Socket) =>
    dismissedStudentFromRanking(
      studentRepository,
      rankingRepository,
      responsibleRepository,
      socket,
      config,
      key,
      responsibleId,
      studentsIds
    ),
  dismissedResponsibleFromRanking: async (key: string, responsibleId: number, socket: Socket) =>
    dismissedResponsibleFromRanking(
      studentRepository,
      rankingRepository,
      responsibleRepository,
      socket,
      config,
      key,
      responsibleId
    ),
  removeResponsible: async (key: string, responsibleId: number) =>
    rankingRepository.removeResponsible(key, responsibleId)
});

export { newRankingService, RankingService };
