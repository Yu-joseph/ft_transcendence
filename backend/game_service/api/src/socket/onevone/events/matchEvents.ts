import { Server, Socket } from 'socket.io';

import {
  matches,
  disconnectTimeouts,
} from '../onevoneState';
import { bindPlayerToSocket, emitLobbyPlayersUpdate, getUserRoom } from '../lobbyPresence';
import { applyMove, forfeitMatch } from '../gameLogic';

export function registerMatchEvents(io: Server, socket: Socket) {

    socket.on('make-move', async (data: { matchId: string; oldindex: number; newindex: number }) => {
      const userId = socket.data.userId as string | undefined;
      if (!userId) return;

      const match = matches.get(data.matchId);
      if (!match) return;

      const player = match.players.find((p) => p.id === userId);
      if (!player) return;

      player.socketId = socket.id;

      const ok = await applyMove(io, match, userId, data.oldindex, data.newindex);

      if (!ok) {
        socket.emit('move-rejected', { reason: 'Invalid move' });
      }
    });

    socket.on('reconnect-match', (data: { matchId: string }) => {
      const userId = socket.data.userId as string | undefined;
      if (!userId) {
        socket.emit('reconnect-match-failed', { reason: 'Unauthorized' });
        return;
      }

      const timeout = disconnectTimeouts.get(userId);
      if (timeout) {
        clearTimeout(timeout);
        disconnectTimeouts.delete(userId);
      }

      const match = matches.get(data.matchId);
      if (!match) {
        socket.emit('reconnect-match-failed', { reason: 'Match not found' });
        return;
      }

      const player = match.players.find((p) => p.id === userId);
      if (!player) {
        socket.emit('reconnect-match-failed', { reason: 'Not a player in this match' });
        return;
      }

      bindPlayerToSocket(player, socket.id);
      emitLobbyPlayersUpdate(io);
      const symbol = match.players[0].id === userId ? 'X' : 'O';
      io.to(getUserRoom(userId)).emit('match-found', { matchId: data.matchId, match, symbol });
    });

    socket.on('leave-match', async (data: { matchId: string }) => {
      const userId = socket.data.userId as string | undefined;
      if (!userId) return;

      const pending = disconnectTimeouts.get(userId);
      if (pending) {
        clearTimeout(pending);
        disconnectTimeouts.delete(userId);
      }
      await forfeitMatch(io, data.matchId, userId);
    });
}