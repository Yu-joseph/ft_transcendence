import { Server, Socket } from 'socket.io';

import {
  players,
  matches,
  userSockets,
  disconnectTimeouts,
  RECONNECT_GRACE_MS,
} from '../onevoneState';
import { emitLobbyPlayersUpdate, untrackSocket } from '../lobbyPresence';
import { forfeitMatch } from '../gameLogic';
import { removePendingInvitesForUser } from '../lobbyInvites';

export function registerConnectionEvents(io: Server, socket: Socket) {

    socket.on('disconnect', () => {
      const { userId, hasOtherSockets } = untrackSocket(socket.id);
      if (!userId) return;

      if (hasOtherSockets) {
        const remainingSocketId = userSockets.get(userId)?.values().next().value as string | undefined;
        const player = players.get(userId);
        if (player && remainingSocketId) {
          player.socketId = remainingSocketId;
          players.set(userId, player);
        }
        return;
      }

      const player = players.get(userId);

      if (player) {
        const existingTimeout = disconnectTimeouts.get(player.id);
        if (existingTimeout) clearTimeout(existingTimeout);

        for (const [matchId, match] of matches) {
          if (match.status === 'playing' && match.players.some((p) => p.id === player.id)) {
            const timeout = setTimeout(() => {
              disconnectTimeouts.delete(player.id);

              const stillConnected = (userSockets.get(player.id)?.size ?? 0) > 0;
              if (!stillConnected) {
                void forfeitMatch(io, matchId, player.id);
              }
            }, RECONNECT_GRACE_MS);

            disconnectTimeouts.set(player.id, timeout);
            break;
          }
        }
      }

      removePendingInvitesForUser(userId);
      players.delete(userId);
      emitLobbyPlayersUpdate(io);
      console.log('User disconnected:', player?.username || userId);
    });
}