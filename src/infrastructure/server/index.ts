import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { Logger } from 'pino';

const healthcheck = async (_request, response) => {
  // default is a "healthcheck" route
  return response.end(JSON.stringify({ health: 'ok' }));
};

export const newServer = (logger: Logger) => {
  const httpServer = createServer(healthcheck);

  const io = new Server(httpServer, {
    // options
  });

  io.on('connection', async (socket) => {
    logger.info(
      `connectig ${socket.id} on room: ${socket.request.headers['user-surrogate-key']}`
    );

    // move every socket connected to it respectivelly room which now is tenantId SCHOOL
    const room = socket.request.headers['user-surrogate-key'];
    io.in(socket.id).socketsJoin(room);

    socket.on('disconnecting', (reason) => {
      logger.info(
        `disconnecting socket: ${
          socket.id
        }, reason: ${reason}, from rooms: ${JSON.stringify([...socket.rooms])}`
      );
    });

    // TCP LOW LEVEL CONNECTION
    socket.conn.once('upgrade', () => {
      // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
      logger.info(`[TCP] upgraded transport ${socket.conn.transport.name}`);
      logger.info(`clients connected: ${io.engine.clientsCount}`);
    });
  });

  return { httpServer, io };
};
