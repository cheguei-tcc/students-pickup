import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { Logger } from 'pino';
import { RankingService } from '../../application/services/ranking';

const healthcheck = async (request: any, response: any, logger: Logger) => {
  // default is a "healthcheck" route
  logger.info(`received request ${request.method} - ${request.url}`);
  return response.end(JSON.stringify({ health: 'ok' }));
};

export const newServer = (logger: Logger, rankingService: RankingService) => {
  const httpServer = createServer(async (req, res) => healthcheck(req, res, logger));

  const io = new Server(httpServer, {
    // options
  });

  io.on('connection', async (socket) => {
    logger.info(`connectig ${socket.id} on room: ${socket.request.headers['user-surrogate-key']}`);

    // move every socket connected to it respectivelly room which now is the school id for now
    const room = socket.request.headers['user-surrogate-key'];
    await socket.join(room!);
    const ranking = await rankingService.getRanking(room as string);
    // if there is some ranking ensure every new connection will receive it
    socket.emit('responsible-arrived', { ranking });

    socket.on('disconnecting', (reason) => {
      logger.info(
        `disconnecting socket: ${socket.id}, reason: ${reason}, from rooms: ${JSON.stringify([...socket.rooms])}`
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
