import { Server, Socket } from 'socket.io';
import { Player } from '../../types/game';
import { LobbyPlayer, matches, players, socketToUser, userSockets } from './onevoneState';

export function getUserRoom(userId: string): string {
  return 'user:' + userId;
}

export function trackSocketForUser(socket: Socket, userId: string) {
  socketToUser.set(socket.id, userId);
  const sockets = userSockets.get(userId) ?? new Set<string>();
  sockets.add(socket.id);
  userSockets.set(userId, sockets);
  socket.join(getUserRoom(userId));
}

export function untrackSocket(socketId: string): { userId: string | null; hasOtherSockets: boolean } {
  const userId = socketToUser.get(socketId) ?? null;
  if (!userId) return { userId: null, hasOtherSockets: false };

  socketToUser.delete(socketId);
  const sockets = userSockets.get(userId);
  if (!sockets) return { userId, hasOtherSockets: false };

  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(userId);
    return { userId, hasOtherSockets: false };
  }

  return { userId, hasOtherSockets: true };
}
export function getLobbyPlayersSnapshot(): LobbyPlayer[] {
  return Array.from(players.values()).map((player) => ({
    ...player,
    status: isPlayerInActiveMatch(player.id) ? 'playing' : 'online',
  }));
}
export function emitLobbyPlayersUpdate(io: Server) {
  io.emit('players-update', getLobbyPlayersSnapshot());
  io.emit('enlineusers', players.size);
}

export function isPlayerInActiveMatch(userId: string): boolean {
  for (const match of matches.values()) {
    if (match.status === 'playing' && match.players.some((p) => p.id === userId)) {
      return true;
    }
  }
  return false;
}
export function bindPlayerToSocket(player: Player, socketId: string) {
  player.socketId = socketId;
  players.set(player.id, player);
}
