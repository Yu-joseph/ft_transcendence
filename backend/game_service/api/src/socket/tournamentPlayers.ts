import { Socket } from 'socket.io';
import { Player } from '../types/game';
import { players } from './handlers';
import { getUserProfile } from './handlers';

export function getSocketUserId(socket: Socket): string | null {
  const userId = socket.data.userId as string | undefined;
  return userId ?? null;
}

export async function getOrCreatePlayer(socket: Socket): Promise<Player | null> {
  const userId = getSocketUserId(socket);
  if (!userId) return null;

  const profile = await getUserProfile(userId);
  if (!profile) return null;

  const existing = players.get(userId);
  if (existing) {
    existing.username = profile.username;
    existing.avatar = profile.avatar;
    existing.socketId = socket.id;
    players.set(userId, existing);
    return existing;
  }

  const created: Player = {
    id: userId,
    username: profile.username,
    avatar: profile.avatar,
    socketId: socket.id,
    isReady: false,
  };
  players.set(userId, created);
  return created;
}
