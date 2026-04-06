import { Server, Socket } from 'socket.io';
import { Player, Match, Tournament, TournamentMatch } from '../types/game';
import { players, matches, createGameInDB } from './handlers';
import prisma from '../lib/prisma';
import { randomUUID } from "crypto";

// In-memory tournament storage
const tournaments = new Map<string, Tournament>();

/**
 * Generate a single-elimination bracket for N players.
 * Pads to next power of 2; extra slots get byes (null player).
 */
function generateBracket(playerList: Player[]): TournamentMatch[] {
  const n = playerList.length;
  const size = nextPowerOf2(n);
  const totalRounds = Math.log2(size);
  const bracket: TournamentMatch[] = [];

  // Shuffle players for random seeding
  const shuffled = [...playerList];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Pad with nulls for byes
  const padded: (Player | null)[] = [...shuffled];
  while (padded.length < size) padded.push(null);

  // Round 1 matches
  for (let i = 0; i < size / 2; i++) {
    const p1 = padded[i * 2];
    const p2 = padded[i * 2 + 1];

    const tm: TournamentMatch = {
      roundNumber: 1,
      matchIndex: i,
      matchId: null,
      player1: p1,
      player2: p2,
      winnerId: null,
      status: 'pending',
      requestedBy: null,
    };

    // If one player is null (bye), auto-advance the other
    if (!p1 && p2) {
      tm.winnerId = p2.id;
      tm.status = 'finished';
    } else if (p1 && !p2) {
      tm.winnerId = p1.id;
      tm.status = 'finished';
    }

    bracket.push(tm);
  }

  // Create placeholder matches for subsequent rounds
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = size / Math.pow(2, round);
    for (let i = 0; i < matchesInRound; i++) {
      bracket.push({
        roundNumber: round,
        matchIndex: i,
        matchId: null,
        player1: null,
        player2: null,
        winnerId: null,
        status: 'pending',
        requestedBy: null,
      });
    }
  }

  return bracket;
}

function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Find all bracket matches for a given round.
 */
function getMatchesForRound(bracket: TournamentMatch[], round: number): TournamentMatch[] {
  return bracket.filter(m => m.roundNumber === round);
}

/**
 * After a round-1+ match finishes, propagate the winner into the next round slot.
 */
function propagateWinner(tournament: Tournament, finishedMatch: TournamentMatch) {
  const nextRound = finishedMatch.roundNumber + 1;
  const nextMatchIndex = Math.floor(finishedMatch.matchIndex / 2);
  const isFirstSlot = finishedMatch.matchIndex % 2 === 0;

  const nextMatch = tournament.bracket.find(
    m => m.roundNumber === nextRound && m.matchIndex === nextMatchIndex
  );
  if (!nextMatch) return; // This was the final

  const winnerPlayer = tournament.players.find(p => p.id === finishedMatch.winnerId) || null;

  if (isFirstSlot) {
    nextMatch.player1 = winnerPlayer;
  } else {
    nextMatch.player2 = winnerPlayer;
  }
}

/**
 * Mark matches as 'ready' when both players are present (don't auto-start).
 */
function markReadyMatches(io: Server, tournament: Tournament) {
  const currentRoundMatches = getMatchesForRound(tournament.bracket, tournament.currentRound);

  for (const tm of currentRoundMatches) {
    if (tm.status !== 'pending' || !tm.player1 || !tm.player2) continue;
    tm.status = 'ready';
    tm.requestedBy = null;
  }

  emitTournamentUpdate(io, tournament);
}

/**
 * Actually create and start a match when both players have confirmed.
 */
function actuallyStartMatch(io: Server, tournament: Tournament, tm: TournamentMatch) {
  if (!tm.player1 || !tm.player2) return;

  const matchId = `tmatch-${tournament.id}-r${tm.roundNumber}-m${tm.matchIndex}`;
  const match: Match = {
    id: matchId,
    tournamentId: tournament.id,
    players: [tm.player1, tm.player2],
    board: Array(9).fill(null),
    currentTurn: tm.player1.id,
    status: 'playing',
    winner: null,
  };

  matches.set(matchId, match);
  tm.matchId = matchId;
  tm.status = 'playing';
  tm.requestedBy = null;

  createGameInDB(match).catch(err =>
    console.error('Failed to create tournament game in DB:', err)
  );

  io.to(tm.player1.socketId).emit('match-found', { matchId, match, symbol: 'X' });
  io.to(tm.player2.socketId).emit('match-found', { matchId, match, symbol: 'O' });

  console.log(`Tournament match started: ${tm.player1.username} vs ${tm.player2.username} (Round ${tm.roundNumber})`);
  emitTournamentUpdate(io, tournament);
}

/**
 * Shared logic after a bracket match finishes (real game or forfeit).
 */
function handleBracketMatchFinish(io: Server, tournament: Tournament, bracketMatch: TournamentMatch) {
  const loserId = bracketMatch.player1?.id === bracketMatch.winnerId
    ? bracketMatch.player2?.id
    : bracketMatch.player1?.id;

  if (loserId) {
    prisma.tournamentParticipant.updateMany({
      where: { tournamentId: tournament.id, userId: loserId },
      data: { eliminated: true, eliminatedInRound: bracketMatch.roundNumber },
    }).catch(err => console.error('Failed to mark participant eliminated:', err));
  }

  propagateWinner(tournament, bracketMatch);

  const currentRoundMatches = getMatchesForRound(tournament.bracket, tournament.currentRound);
  const allDone = currentRoundMatches.every(m => m.status === 'finished');

  if (allDone) {
    const totalRounds = Math.log2(nextPowerOf2(tournament.players.length));

    if (tournament.currentRound >= totalRounds) {
      const finalMatch = tournament.bracket.find(
        m => m.roundNumber === tournament.currentRound && m.matchIndex === 0
      );
      tournament.winner = finalMatch?.winnerId || null;
      tournament.status = 'finished';

      if (tournament.winner) {
        prisma.tournament.update({
          where: { id: tournament.id },
          data: { status: 'finished', winnerId: tournament.winner },
        }).catch(err => console.error('Failed to finalize tournament:', err));
      }

      emitTournamentUpdate(io, tournament);
      const winnerPlayer = tournament.players.find(p => p.id === tournament.winner);
      console.log(`Tournament "${tournament.name}" won by ${winnerPlayer?.username}`);

      tournament.players.forEach(p => {
        io.to(p.socketId).emit('tournament-finished', {
          tournamentId: tournament.id,
          winner: winnerPlayer,
          bracket: tournament.bracket,
        });
      });

      tournaments.delete(tournament.id);
    } else {
      tournament.currentRound++;
      console.log(`Tournament "${tournament.name}" advancing to round ${tournament.currentRound}`);
      markReadyMatches(io, tournament);
    }
  } else {
    emitTournamentUpdate(io, tournament);
  }
}

/**
 * Called from handlers.ts when a tournament match finishes.
 */
export function advanceTournamentBracket(io: Server, tournamentId: string, finishedMatch: Match) {
  const tournament = tournaments.get(tournamentId);
  if (!tournament) return;

  const bracketMatch = tournament.bracket.find(m => m.matchId === finishedMatch.id);
  if (!bracketMatch) return;

  bracketMatch.winnerId = finishedMatch.winner;
  bracketMatch.status = 'finished';

  handleBracketMatchFinish(io, tournament, bracketMatch);
}

function emitTournamentUpdate(io: Server, tournament: Tournament) {
  tournament.players.forEach(p => {
    io.to(p.socketId).emit('tournament-update', {
      id: tournament.id,
      name: tournament.name,
      creatorId: tournament.creatorId,
      status: tournament.status,
      currentRound: tournament.currentRound,
      bracket: tournament.bracket,
      players: tournament.players,
      winner: tournament.winner,
    });
  });
}

export function setupTournamentHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {

    socket.on('create-tournament', async (data: {
      name: string;
      userId: string;
      username: string;
      maxPlayers: number;
    }) => {
      // --- Input validation ---
      const rawName = (data.name || '').trim();
      if (rawName.length < 1 || rawName.length > 50) {
        socket.emit('tournament-error', { message: 'Tournament name must be 1-50 characters' });
        return;
      }
      // Strip HTML/script tags to prevent XSS
      const name = rawName.replace(/<[^>]*>/g, '').trim();
      if (!name) {
        socket.emit('tournament-error', { message: 'Invalid tournament name' });
        return;
      }
      const creator = players.get(socket.id);
      if (!creator && !data.userId) return;

      const player: Player = creator || {
        id: data.userId,
        username: data.username,
        socketId: socket.id,
        isReady: false,
      };

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
            status: "waiting",
            creatorId: player.id,
<<<<<<< HEAD
<<<<<<< HEAD
            created_at: new Date(),
=======
            createdAt: new Date(),

>>>>>>> 2d98fb0 (SA)
=======
            created_at: new Date(),
>>>>>>> dd5f97c (merging current changes with all team members)
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
      } catch (err) {
        console.error("Failed to create tournament in DB:", err);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dd5f97c (merging current changes with all team members)

        // rollback in-memory state
        tournaments.delete(tournamentId);

        // notify client
        socket.emit("tournament-error", {
          message: "Failed to create tournament. Please try again.",
        });

        return; // stop flow: do not emit success events
<<<<<<< HEAD
=======
>>>>>>> 2d98fb0 (SA)
=======
>>>>>>> dd5f97c (merging current changes with all team members)
      }

      socket.emit("tournament-created", { tournamentId, tournament });
      io.emit("tournament-available", {
        tournamentId,
        name: tournament.name,
        creatorName: player.username,
        playerCount: 1,
        maxPlayers: data.maxPlayers || 4,
      });

      console.log(`Tournament "${tournament.name}" created by ${player.username}`);
    });

    socket.on('join-tournament', async (data: {
      tournamentId: string;
      userId: string;
      username: string;
    }) => {
      const tournament = tournaments.get(data.tournamentId);
      if (!tournament) {
        socket.emit('tournament-error', { message: 'Tournament not found' });
        return;
      }
      const existing = tournament.players.find(p => p.id === data.userId);
      if (existing) {
        existing.socketId = socket.id;
        for (const tm of tournament.bracket) {
          if (tm.player1?.id === data.userId) tm.player1.socketId = socket.id;
          if (tm.player2?.id === data.userId) tm.player2.socketId = socket.id;
        }
        emitTournamentUpdate(io, tournament);
        return;
      }
      if (tournament.status !== 'waiting') {
        socket.emit('tournament-error', { message: 'Tournament already started' });
        return;
      }

      const player: Player = players.get(socket.id) || {
        id: data.userId,
        username: data.username,
        socketId: socket.id,
        isReady: false,
      };

      tournament.players.push(player);

      try {
        await prisma.tournamentParticipant.create({
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dd5f97c (merging current changes with all team members)
          data: {
            id: crypto.randomUUID(),
            tournamentId: data.tournamentId,
            userId: data.userId,
            seed: tournament.players.length,
            eliminated: false,
          },
        });
<<<<<<< HEAD
=======
        data: {
          id: crypto.randomUUID(),
          tournamentId: data.tournamentId,
          userId: data.userId,
          seed: tournament.players.length,
          eliminated: false,
        },
      });
>>>>>>> 2d98fb0 (SA)
=======
>>>>>>> dd5f97c (merging current changes with all team members)
      } catch (err) {
        console.error('Failed to add tournament participant:', err);
      }

      emitTournamentUpdate(io, tournament);

      io.emit('tournament-available', {
        tournamentId: tournament.id,
        name: tournament.name,
        creatorName: tournament.players[0]?.username,
        playerCount: tournament.players.length,
      });

      console.log(`${player.username} joined tournament "${tournament.name}"`);
    });

    socket.on('start-tournament', async (data: { tournamentId: string }) => {
      const tournament = tournaments.get(data.tournamentId);
      if (!tournament) {
        socket.emit('tournament-error', { message: 'Tournament not found' });
        return;
      }

      let caller = players.get(socket.id);
      if (!caller) {
        caller = tournament.players.find(p => p.socketId === socket.id) || undefined;
      }
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

      // Propagate bye winners from round 1 to next rounds
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

      console.log(`Tournament "${tournament.name}" started with ${tournament.players.length} players`);

      // Mark ready matches (don't auto-start — players must click Play)
      markReadyMatches(io, tournament);
    });

    /**
     * Player clicks "Play" on a ready match.
     */
    socket.on('request-tournament-match', (data: {
      tournamentId: string;
      roundNumber: number;
      matchIndex: number;
    }) => {
      const tournament = tournaments.get(data.tournamentId);
      if (!tournament) return;

      const caller = tournament.players.find(p => p.socketId === socket.id);
      if (!caller) return;

      const tm = tournament.bracket.find(
        m => m.roundNumber === data.roundNumber && m.matchIndex === data.matchIndex
      );
      if (!tm || tm.status !== 'ready') return;

      // Verify caller is in this match
      if (tm.player1?.id !== caller.id && tm.player2?.id !== caller.id) return;

      const opponent = tm.player1?.id === caller.id ? tm.player2 : tm.player1;
      if (!opponent) return;

      // If the other player already requested, both are ready → auto-start
      if (tm.requestedBy && tm.requestedBy !== caller.id) {
        actuallyStartMatch(io, tournament, tm);
        return;
      }

      tm.requestedBy = caller.id;

      // Notify opponent with confirmation prompt
      io.to(opponent.socketId).emit('tournament-match-confirm', {
        tournamentId: tournament.id,
        roundNumber: tm.roundNumber,
        matchIndex: tm.matchIndex,
        opponentName: caller.username,
      });

      emitTournamentUpdate(io, tournament);
      console.log(`${caller.username} requested match (Round ${tm.roundNumber}, Match ${tm.matchIndex})`);
    });

    /**
     * Opponent accepts the match.
     */
    socket.on('accept-tournament-match', (data: {
      tournamentId: string;
      roundNumber: number;
      matchIndex: number;
    }) => {
      const tournament = tournaments.get(data.tournamentId);
      if (!tournament) return;

      const tm = tournament.bracket.find(
        m => m.roundNumber === data.roundNumber && m.matchIndex === data.matchIndex
      );
      if (!tm || tm.status !== 'ready') return;

      actuallyStartMatch(io, tournament, tm);
    });

    /**
     * Opponent declines — they forfeit.
     */
    socket.on('decline-tournament-match', (data: {
      tournamentId: string;
      roundNumber: number;
      matchIndex: number;
    }) => {
      const tournament = tournaments.get(data.tournamentId);
      if (!tournament) return;

      const caller = tournament.players.find(p => p.socketId === socket.id);
      if (!caller) return;

      const tm = tournament.bracket.find(
        m => m.roundNumber === data.roundNumber && m.matchIndex === data.matchIndex
      );
      if (!tm || tm.status !== 'ready') return;

      if (tm.player1?.id !== caller.id && tm.player2?.id !== caller.id) return;

      const opponent = tm.player1?.id === caller.id ? tm.player2 : tm.player1;
      if (!opponent) return;

      // Decliner loses, opponent wins
      tm.winnerId = opponent.id;
      tm.status = 'finished';

      console.log(`${caller.username} declined match → ${opponent.username} wins by forfeit`);
      handleBracketMatchFinish(io, tournament, tm);
    });

    socket.on('leave-tournament', async (data: { tournamentId: string }) => {
      const tournament = tournaments.get(data.tournamentId);
      if (!tournament || tournament.status !== 'waiting') return;

      let caller = players.get(socket.id);
      if (!caller) {
        caller = tournament.players.find(p => p.socketId === socket.id) || undefined;
        if (!caller) return;
      }

      tournament.players = tournament.players.filter(p => p.id !== caller.id);

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

        tournament.players.forEach(p => {
          io.to(p.socketId).emit('tournament-cancelled', {
            tournamentId: data.tournamentId,
            reason: 'Creator left',
          });
        });
        io.emit('tournament-removed', { tournamentId: data.tournamentId });
        console.log(`Tournament "${tournament.name}" cancelled — creator left`);
        return;
      }

      emitTournamentUpdate(io, tournament);
      io.emit('tournament-available', {
        tournamentId: tournament.id,
        name: tournament.name,
        creatorName: tournament.players[0]?.username,
        playerCount: tournament.players.length,
      });

      console.log(`${caller.username} left tournament "${tournament.name}"`);
    });

    socket.on('get-tournaments', () => {
      const list = Array.from(tournaments.values())
        .filter(t => t.status === 'waiting')
        .map(t => ({
          tournamentId: t.id,
          name: t.name,
          creatorName: t.players[0]?.username,
          playerCount: t.players.length,
          status: t.status,
        }));
      socket.emit('tournaments-list', list);
    });

    socket.on('reconnect-tournament', (data: { userId: string }) => {
      for (const [, tournament] of tournaments) {
        const player = tournament.players.find(p => p.id === data.userId);
        if (player) {
          player.socketId = socket.id;
          socket.emit('tournament-created', { tournamentId: tournament.id, tournament });
          emitTournamentUpdate(io, tournament);
          return;
        }
      }
      socket.emit('tournament-error', { message: 'No active tournament found' });
    });
    socket.on('disconnect', () => {
      // Give tournament players a grace period to reconnect (e.g., page refresh)
      for (const [, tournament] of tournaments) {
        if (tournament.status !== 'in-progress') continue;

        const player = tournament.players.find(p => p.socketId === socket.id);
        if (!player) continue;

        // Mark the socket as stale but don't remove the player.
        // They can reconnect via 'reconnect-tournament' and get a new socketId.
        // If they're in a ready/pending match, no action needed — they just need
        // to reconnect before their match starts.
        console.log(`Tournament player ${player.username} disconnected (tournament: ${tournament.name})`);
        break;
      }
    });
  });
}