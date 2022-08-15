import { Server as SocketIO } from 'socket.io';
import { Socket } from '../../application/interfaces/socket';
import { Responsible } from '../../domain/responsible';

const getResponsibleSocketId = async (io: SocketIO, responsible: Responsible): Promise<string> => {
  const sockets = await io.in('spinosa').fetchSockets();

  const responsibleSocket = sockets.find((s) => s.data.responsible.CPF === responsible.CPF);
  return responsibleSocket?.id ?? '';
};

const emit = async (io: SocketIO, event: string, data: any): Promise<void> => {
  const { msg, group } = data;

  const room = io.in(group);

  room.emit(event, { ...msg });
};

const newSocketIOAdapter = (io: SocketIO): Socket => ({
  getResponsibleSocketId: async (responsible: Responsible) => getResponsibleSocketId(io, responsible),
  emit: async (event: string, data: any) => emit(io, event, data)
});

export { newSocketIOAdapter };
