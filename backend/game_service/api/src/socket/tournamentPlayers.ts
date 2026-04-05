import { Socket } from 'socket.io';
import { Player } from '../types/game';
import { players } from './handlers';

export function getSocketUserId(socket: Socket): string | null {
  const userId = socket.data.userId as string | undefined;
  return userId ?? null;
}

export function getOrCreatePlayer(socket: Socket, username?: string): Player | null {
  const userId = getSocketUserId(socket);
  if (!userId) return null;

  const cleanUsername = username?.trim() || 'Guest';

  const current = players.get(socket.id);
  if (current) {
    current.id = userId;
    current.username = cleanUsername;
    current.socketId = socket.id;
    return current;
  }

  const existing = Array.from(players.entries()).find(([, p]) => p.id === userId);
  if (existing) {
    const [oldSocketId, p] = existing;
    players.delete(oldSocketId);
    p.socketId = socket.id;
    p.username = cleanUsername;
    players.set(socket.id, p);
    return p;
  }

  const created: Player = {
    id: userId,
    username: cleanUsername,
    socketId: socket.id,
    isReady: false,
  };
  players.set(socket.id, created);
  return created;
}
