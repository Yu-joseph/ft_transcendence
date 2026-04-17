import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import prisma from '../../lib/prisma';
import { Match, Tournament } from '../../types/game';
import { generateBracket, propagateWinner } from './tournamentBracket';
import {
  actuallyStartMatch,
  advanceTournamentBracket,
  emitTournamentUpdate,
  markReadyMatches,
} from './tournamentEngine';
import { getOrCreatePlayer, getSocketUserId } from './tournamentPlayers';
import { tournaments } from './tournamentStore';
import { getUserRoom, isPlayerInActiveMatch } from '../onevone/lobbyPresence';

export { advanceTournamentBracket } from './tournamentEngine';

export function setupTournamentHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    socket.on(
      'create-tournament',
      async (data: { name: string; username?: string; maxPlayers: number }) => {
        const player = await getOrCreatePlayer(socket);
        if (!player) {
          socket.emit('tournament-error', { message: 'Unauthorized' });
          return;
        }

        const rawName = (data.name || '').trim();
        if (rawName.length < 1 || rawName.length > 50) {
          socket.emit('tournament-error', { message: 'Tournament name must be 1-50 characters' });
          return;
        }

        const name = rawName.replace(/<[^>]*>/g, '').trim();
        if (!name) {
          socket.emit('tournament-error', { message: 'Invalid tournament name' });
          return;
        }

        const tournamentId = `tournament-${Date.now()}`;
        const tournament: Tournament = {
          id: tournamentId,
          name: name || `${player.username}'s Tournament`,
          creatorId: player.id,
          players: [player],
          bracket: [],
          status: 'waiting',
          currentRound: 1,
          winner: null,
        };

        tournaments.set(tournamentId, tournament);

        try {
          await prisma.tournament.create({
            data: {
              id: tournamentId,
              name: tournament.name,
              status: 'waiting',
              creatorId: player.id,
              created_at: new Date(),
              TournamentParticipant: {
                create: {
                  id: randomUUID(),
                  userId: player.id,
                  seed: 1,
                  eliminated: false,
                },
              },
            },
          });
        } catch {
          tournaments.delete(tournamentId);
          socket.emit('tournament-error', {
            message: 'Failed to create tournament. Please try again.',
          });
          return;
        }

        socket.emit('tournament-created', { tournamentId, tournament });
        io.emit('tournament-available', {
          tournamentId,
          name: tournament.name,
          creatorName: player.username,
          playerCount: 1,
          maxPlayers: data.maxPlayers || 4,
        });
      },
    );

    socket.on(
      'join-tournament',
      async (data: { tournamentId: string }) => {
        const userId = getSocketUserId(socket);
        if (!userId) {
          socket.emit('tournament-error', { message: 'Unauthorized' });
          return;
        }

        const tournament = tournaments.get(data.tournamentId);
        if (!tournament) {
          socket.emit('tournament-error', { message: 'Tournament not found' });
          return;
        }

        const hydratedPlayer = await getOrCreatePlayer(socket);
        if (!hydratedPlayer) {
          socket.emit('tournament-error', { message: 'Unauthorized' });
          return;
        }

        const existing = tournament.players.find((p) => p.id === userId);
        if (existing) {
          existing.socketId = socket.id;
          existing.username = hydratedPlayer.username;
          existing.avatar = hydratedPlayer.avatar;

          for (const tm of tournament.bracket) {
            if (tm.player1?.id === userId) {
              tm.player1.socketId = socket.id;
              tm.player1.username = hydratedPlayer.username;
              tm.player1.avatar = hydratedPlayer.avatar;
            }
            if (tm.player2?.id === userId) {
              tm.player2.socketId = socket.id;
              tm.player2.username = hydratedPlayer.username;
              tm.player2.avatar = hydratedPlayer.avatar;
            }
          }

          emitTournamentUpdate(io, tournament);
          return;
        }

        if (tournament.status !== 'waiting') {
          socket.emit('tournament-error', { message: 'Tournament already started' });
          return;
        }

        tournament.players.push(hydratedPlayer);

        await prisma.tournamentParticipant.create({
          data: {
            id: randomUUID(),
            tournamentId: data.tournamentId,
            userId,
            seed: tournament.players.length,
            eliminated: false,
          },
        });

        emitTournamentUpdate(io, tournament);
        io.emit('tournament-available', {
          tournamentId: tournament.id,
          name: tournament.name,
          creatorName: tournament.players[0]?.username,
          playerCount: tournament.players.length,
        });
      },
    );

    socket.on('start-tournament', async (data: { tournamentId: string }) => {
      const userId = getSocketUserId(socket);
      if (!userId) {
        socket.emit('tournament-error', { message: 'Unauthorized' });
        return;
      }

      const tournament = tournaments.get(data.tournamentId);
      if (!tournament) {
        socket.emit('tournament-error', { message: 'Tournament not found' });
        return;
      }

      const caller = tournament.players.find((p) => p.id === userId);
      if (!caller || caller.id !== tournament.creatorId) {
        socket.emit('tournament-error', { message: 'Only the creator can start the tournament' });
        return;
      }
      if (tournament.players.length < 3) {
        socket.emit('tournament-error', { message: 'Need at least 3 players to start' });
        return;
      }
      if (tournament.status !== 'waiting') {
        socket.emit('tournament-error', { message: 'Tournament already started' });
        return;
      }

      tournament.status = 'in-progress';
      tournament.bracket = generateBracket(tournament.players);
      tournament.currentRound = 1;

      // Propagate bye winners from round 1 to next rounds.
      for (const tm of tournament.bracket) {
        if (tm.roundNumber === 1 && tm.status === 'finished' && tm.winnerId) {
          propagateWinner(tournament, tm);
        }
      }

      try {
        await prisma.tournament.update({
          where: { id: data.tournamentId },
          data: { status: 'in-progress' },
        });
      } catch (err) {
        console.error('Failed to update tournament status:', err);
      }

      console.log(`Tournament \"${tournament.name}\" started with ${tournament.players.length} players`);
      markReadyMatches(io, tournament);
    });

    socket.on(
      'request-tournament-match',
      (data: {
        tournamentId: string;
        roundNumber: number;
        matchIndex: number;
      }) => {
        const userId = getSocketUserId(socket);
        if (!userId) return;

        const tournament = tournaments.get(data.tournamentId);
        if (!tournament) return;

        const caller = tournament.players.find((p) => p.id === userId);
        if (!caller) return;


        const tm = tournament.bracket.find(
          (m) => m.roundNumber === data.roundNumber && m.matchIndex === data.matchIndex,
        );
        if (!tm || tm.status !== 'ready') return;

        if (tm.player1?.id !== caller.id && tm.player2?.id !== caller.id) return;

        const opponent = tm.player1?.id === caller.id ? tm.player2 : tm.player1;

        if (!opponent) return;
                if (isPlayerInActiveMatch(caller.id) || isPlayerInActiveMatch(opponent.id)) {
          socket.emit('tournament-error', {
            message: 'Cannot request tournament match while one player is already in a match',
          });
          return;
        }

        if (tm.requestedBy && tm.requestedBy !== caller.id) {
          actuallyStartMatch(io, tournament, tm);
          return;
        }

        tm.requestedBy = caller.id;

        io.to(getUserRoom(opponent.id)).emit('tournament-match-confirm', {
          tournamentId: tournament.id,
          roundNumber: tm.roundNumber,
          matchIndex: tm.matchIndex,
          opponentName: caller.username,
        });

        emitTournamentUpdate(io, tournament);
        console.log(
          `${caller.username} requested match (Round ${tm.roundNumber}, Match ${tm.matchIndex})`,
        );
      },
    );

    socket.on(
      'accept-tournament-match',
      (data: {
        tournamentId: string;
        roundNumber: number;
        matchIndex: number;
      }) => {
        const userId = getSocketUserId(socket);
        if (!userId) return;

        const tournament = tournaments.get(data.tournamentId);
        if (!tournament) return;

        const tm = tournament.bracket.find(
          (m) => m.roundNumber === data.roundNumber && m.matchIndex === data.matchIndex,
        );
        if (!tm || tm.status !== 'ready') return;

        if (tm.player1?.id !== userId && tm.player2?.id !== userId) return;
        if (tm.requestedBy === userId) return;
        const p1 = tm.player1;
        const p2 = tm.player2;
        if (!p1 || !p2) return;

        if (isPlayerInActiveMatch(p1.id) || isPlayerInActiveMatch(p2.id)) {
          socket.emit('tournament-error', {
            message: 'Cannot start tournament match while one player is already in a match',
          });
          return;
        }
        actuallyStartMatch(io, tournament, tm);
      },
    );

    socket.on(
      'decline-tournament-match',
      (data: {
        tournamentId: string;
        roundNumber: number;
        matchIndex: number;
      }) => {
        const userId = getSocketUserId(socket);
        if (!userId) return;

        const tournament = tournaments.get(data.tournamentId);
        if (!tournament) return;

        const caller = tournament.players.find((p) => p.id === userId);
        if (!caller) return;

        const tm = tournament.bracket.find(
          (m) => m.roundNumber === data.roundNumber && m.matchIndex === data.matchIndex,
        );
        if (!tm || tm.status !== 'ready') return;

        if (tm.player1?.id !== caller.id && tm.player2?.id !== caller.id) return;

        const opponent = tm.player1?.id === caller.id ? tm.player2 : tm.player1;
        if (!opponent) return;

        // Decliner loses, opponent wins.
        tm.winnerId = opponent.id;
        tm.status = 'finished';
        tm.matchId = tm.matchId ?? `forfeit-${tournament.id}-r${tm.roundNumber}-m${tm.matchIndex}`;

        console.log(`${caller.username} declined match -> ${opponent.username} wins by forfeit`);

        const syntheticFinishedMatch: Match = {
          id: tm.matchId,
          tournamentId: tournament.id,
          players: [tm.player1, tm.player2].filter((p): p is NonNullable<typeof p> => Boolean(p)),
          board: Array(9).fill(null),
          currentTurn: null,
          status: 'finished',
          winner: opponent.id,
        };

        advanceTournamentBracket(io, tournament.id, syntheticFinishedMatch);
      },
    );

    socket.on('leave-tournament', async (data: { tournamentId: string }) => {
      const userId = getSocketUserId(socket);
      if (!userId) return;

      const tournament = tournaments.get(data.tournamentId);
      if (!tournament || tournament.status !== 'waiting') return;

      const caller = tournament.players.find((p) => p.id === userId);
      if (!caller) return;

      tournament.players = tournament.players.filter((p) => p.id !== caller.id);

      try {
        await prisma.tournamentParticipant.deleteMany({
          where: { tournamentId: data.tournamentId, userId: caller.id },
        });
      } catch (err) {
        console.error('Failed to remove tournament participant:', err);
      }

      if (caller.id === tournament.creatorId) {
        tournaments.delete(data.tournamentId);
        try {
          await prisma.tournamentParticipant.deleteMany({
            where: { tournamentId: data.tournamentId },
          });
          await prisma.tournament.delete({ where: { id: data.tournamentId } });
        } catch (err) {
          console.error('Failed to delete tournament:', err);
        }

        tournament.players.forEach((p) => {
          io.to(getUserRoom(p.id)).emit('tournament-cancelled', {
            tournamentId: data.tournamentId,
            reason: 'Creator left',
          });
        });
        io.emit('tournament-removed', { tournamentId: data.tournamentId });
        console.log(`Tournament \"${tournament.name}\" cancelled - creator left`);
        return;
      }

      emitTournamentUpdate(io, tournament);
      io.emit('tournament-available', {
        tournamentId: tournament.id,
        name: tournament.name,
        creatorName: tournament.players[0]?.username,
        playerCount: tournament.players.length,
      });

      console.log(`${caller.username} left tournament \"${tournament.name}\"`);
    });

    socket.on('get-tournaments', () => {
      const list = Array.from(tournaments.values())
        .filter((t) => t.status === 'waiting')
        .map((t) => ({
          tournamentId: t.id,
          name: t.name,
          creatorName: t.players[0]?.username,
          playerCount: t.players.length,
          status: t.status,
        }));
      socket.emit('tournaments-list', list);
    });

    socket.on('reconnect-tournament', async (data: { tournamentId?: string }) => {
      const userId = getSocketUserId(socket);
      if (!userId) {
        socket.emit('tournament-error', { message: 'Unauthorized' });
        return;
      }

      const hydratedPlayer = await getOrCreatePlayer(socket);
      if (!hydratedPlayer) {
        socket.emit('tournament-error', { message: 'Unauthorized' });
        return;
      }

      const tryReconnect = (tournament: Tournament) => {
        const player = tournament.players.find((p) => p.id === userId);
        if (!player) return false;

        player.socketId = socket.id;
        player.username = hydratedPlayer.username;
        player.avatar = hydratedPlayer.avatar;

        socket.emit('tournament-created', { tournamentId: tournament.id, tournament });
        emitTournamentUpdate(io, tournament);
        return true;
      };

      if (data.tournamentId) {
        const t = tournaments.get(data.tournamentId);
        if (t && tryReconnect(t)) return;
      } else {
        for (const [, t] of tournaments) {
          if (tryReconnect(t)) return;
        }
      }

      socket.emit('tournament-error', { message: 'No active tournament found' });
    });

    socket.on('disconnect', () => {
      for (const [, tournament] of tournaments) {
        if (tournament.status !== 'in-progress') continue;

        const player = tournament.players.find((p) => p.socketId === socket.id);
        if (!player) continue;

        console.log(
          `Tournament player ${player.username} disconnected (tournament: ${tournament.name})`,
        );
        break;
      }
    });
  });
}
