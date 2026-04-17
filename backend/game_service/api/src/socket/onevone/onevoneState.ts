// onevoneState.ts
import { Player, Match } from '../../types/game';

export type LobbyPlayer = Player & {
  status: 'online' | 'playing';
};

export type PendingInvite = {
  fromUserId: string;
  toUserId: string;
  createdAt: number;
};

// Shared runtime state
export const players = new Map<string, Player>();
export const matches = new Map<string, Match>();

export const userSockets = new Map<string, Set<string>>();
export const socketToUser = new Map<string, string>();

export const disconnectTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
export const turnTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
export const pendingInvites = new Map<string, PendingInvite>();

// Timing constants
export const TURN_TIMEOUT_MS = 5000;
export const INVITE_TTL_MS = 15000;
export const RECONNECT_GRACE_MS = 15000;