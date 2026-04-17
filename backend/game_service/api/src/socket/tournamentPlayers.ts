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

  if (!profile) {
        return null;
      }

  const current = players.get(socket.id);
  if (current) {
    current.id = userId;
    current.username = profile?.username;
    current.avatar = profile?.avatar;
    current.socketId = socket.id;
    return current;
  }

  const existing = Array.from(players.entries()).find(([, p]) => p.id === userId);
  if (existing) {
    const [oldSocketId, p] = existing;
    players.delete(oldSocketId);
    p.socketId = socket.id;
    p.username = profile.username;
    p.avatar = profile.avatar;
    players.set(socket.id, p);
    return p;
  }

  const created: Player = {
    id: userId,
    username: profile.username,
    avatar: profile.avatar,
    socketId: socket.id,
    isReady: false,
  };
  players.set(socket.id, created);
  return created;
}
