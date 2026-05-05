import { Match } from '../../../types/game';
import { Server, Socket } from 'socket.io';

import {
  players,
  matches,
  pendingInvites,
} from '../onevoneState';
import { getUserProfile } from '../lobbyProfile';
import { emitLobbyPlayersUpdate, getUserRoom, isPlayerInActiveMatch } from '../lobbyPresence';
import { startTurnTimerForMatch } from '../gameTimers';
import { cleanupExpiredInvites } from '../lobbyInvites';
import { createGameInDB } from '../gamePersistence';

export function registerLobbyEvents(io: Server, socket: Socket) {
    socket.on('join-lobby', async () => {
      const userId = socket.data.userId as string | undefined;
      if (!userId) return;

      const profile = await getUserProfile(userId);
      if (!profile) {
        socket.emit('join-lobby-failed', { reason: 'User not found' });
        return;
      }

      const existing = players.get(userId);
      if (existing) {
        existing.username = profile.username;
        existing.avatar = profile.avatar;
        existing.socketId = socket.id;
        players.set(userId, existing);
      } else {
        players.set(userId, {
          id: userId,
          username: profile.username,
          avatar: profile.avatar,
          socketId: socket.id,
          isReady: false,
        });
      }

      emitLobbyPlayersUpdate(io);
      // console.log(profile.username + ' joined the lobby');
    });

    
    socket.on('send-invite', (data: { targetUserId: string }) => {
      const senderUserId = socket.data.userId as string | undefined;
      if (!senderUserId) return;

      const sender = players.get(senderUserId);
      const target = players.get(data.targetUserId);
      if (!sender || !target) return;
      if (sender.id === target.id) return;
      if (isPlayerInActiveMatch(target.id)) return;

      cleanupExpiredInvites();

      const inviteId = 'invite-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      pendingInvites.set(inviteId, {
        fromUserId: sender.id,
        toUserId: target.id,
        createdAt: Date.now(),
      });

      io.to(getUserRoom(target.id)).emit('receive-invite', {
        inviteId,
        from: {
          id: sender.id,
          username: sender.username,
          avatar: sender.avatar,
        },
      });

      // console.log(sender.username + ' invited ' + target.username);
    });

        socket.on('accept-invite', async (data: { inviteId: string }) => {
      const userId = socket.data.userId as string | undefined;
      if (!userId) return;

      cleanupExpiredInvites();

      const invite = pendingInvites.get(data.inviteId);
      if (!invite || invite.toUserId !== userId) {
        socket.emit('accept-invite-failed', { reason: 'Invite expired or invalid' });
        return;
      }

      const player1 = players.get(invite.fromUserId);
      const player2 = players.get(invite.toUserId);
      if (!player1 || !player2) {
        pendingInvites.delete(data.inviteId);
        return;
      }

      if (isPlayerInActiveMatch(player1.id) || isPlayerInActiveMatch(player2.id)) {
        pendingInvites.delete(data.inviteId);
        return;
      }

      pendingInvites.delete(data.inviteId);

      const matchId = 'match-' + Date.now();
      const match: Match = {
        id: matchId,
        players: [player1, player2],
        board: Array(9).fill(null),
        currentTurn: player1.id,
        status: 'playing',
        winner: null,
      };

      matches.set(matchId, match);
      startTurnTimerForMatch(io, matchId);
      emitLobbyPlayersUpdate(io);

      try {
        await createGameInDB(match);
      } catch (err) {
        console.error('Failed to create game in DB:', err);
      }

      io.to(getUserRoom(player1.id)).emit('match-found', { matchId, match, symbol: 'X' });
      io.to(getUserRoom(player2.id)).emit('match-found', { matchId, match, symbol: 'O' });
      io.to(getUserRoom(player2.id)).emit('invite-resolved', {
        inviteId: data.inviteId,
        status: 'accepted',
      });

      // console.log('Match created via invite: ' + player1.username + ' vs ' + player2.username);
    });

    socket.on('decline-invite', (data: { inviteId: string }) => {
      const userId = socket.data.userId as string | undefined;
      if (!userId) return;

      cleanupExpiredInvites();

      const invite = pendingInvites.get(data.inviteId);
      if (!invite || invite.toUserId !== userId) return;

      pendingInvites.delete(data.inviteId);

      const decliner = players.get(userId);
      io.to(getUserRoom(invite.fromUserId)).emit('invite-declined', {
        by: decliner?.username || 'Unknown',
      });
      io.to(getUserRoom(invite.toUserId)).emit('invite-resolved', {
        inviteId: data.inviteId,
        status: 'declined',
      });

      // console.log((decliner?.username || 'Unknown') + ' declined invite');
    });
}

