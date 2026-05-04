import { Server, Socket } from 'socket.io';
import { getUserIdFromToken } from '../auth/identity';
import { trackSocketForUser } from './onevone/lobbyPresence';
import { registerLobbyEvents } from './onevone/events/lobbyEvents';
import { registerMatchEvents } from './onevone/events/matchEvents';
import { registerConnectionEvents } from './onevone/events/connectionEvents';
import { readCookie } from '../auth/authCookie';



export function setupSocketHandlers(io: Server) {
  io.use(async (socket, next) => {
    try {
      const token = readCookie(socket.handshake.headers.cookie, 'access_token');
      if (!token) return next(new Error('unauthorized'));

      const userId = await getUserIdFromToken(token);
      if (!userId) return next(new Error('unauthorized'));

      socket.data.userId = userId;
      next();
    } catch {
      next(new Error('auth service unavailable'));
    }
  });

  io.on('connection', (socket: Socket) => {
    // console.log('User connected:', socket.id);

    const authedUserId = socket.data.userId as string | undefined;
    if (!authedUserId) {
      socket.disconnect(true);
      return;
    }
    trackSocketForUser(socket, authedUserId);
    registerLobbyEvents(io, socket);
    registerMatchEvents(io, socket);
    registerConnectionEvents(io, socket);
  });
}




