import { Server } from 'socket.io';
import prisma from '../lib/prisma';
import { Match, Tournament, TournamentMatch } from '../types/game';
import { createGameInDB, emitLobbyPlayersUpdate, matches, startTurnTimerForMatch } from './handlers';
import { getMatchesForRound, nextPowerOf2, propagateWinner } from './tournamentBracket';
import { tournaments } from './tournamentStore';

export function emitTournamentUpdate(io: Server, tournament: Tournament) {
  tournament.players.forEach((p) => {
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

/**
 * Mark matches as 'ready' when both players are present (don't auto-start).
 */
export function markReadyMatches(io: Server, tournament: Tournament) {
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
export function actuallyStartMatch(io: Server, tournament: Tournament, tm: TournamentMatch) {
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
  emitLobbyPlayersUpdate(io);
  startTurnTimerForMatch(io,matchId);
  tm.matchId = matchId;
  tm.status = 'playing';
  tm.requestedBy = null;

  createGameInDB(match).catch((err) =>
    console.error('Failed to create tournament game in DB:', err),
  );

  io.to(tm.player1.socketId).emit('match-found', { matchId, match, symbol: 'X' });
  io.to(tm.player2.socketId).emit('match-found', { matchId, match, symbol: 'O' });

  console.log(
    `Tournament match started: ${tm.player1.username} vs ${tm.player2.username} (Round ${tm.roundNumber})`,
  );
  emitTournamentUpdate(io, tournament);
}

/**
 * Shared logic after a bracket match finishes (real game or forfeit).
 */
function handleBracketMatchFinish(io: Server, tournament: Tournament, bracketMatch: TournamentMatch) {
  const loserId =
    bracketMatch.player1?.id === bracketMatch.winnerId
      ? bracketMatch.player2?.id
      : bracketMatch.player1?.id;

  if (loserId) {
    prisma.tournamentParticipant
      .updateMany({
        where: { tournamentId: tournament.id, userId: loserId },
        data: { eliminated: true, eliminated_in_round: bracketMatch.roundNumber },
      })
      .catch((err) => console.error('Failed to mark participant eliminated:', err));
  }

  propagateWinner(tournament, bracketMatch);

  const currentRoundMatches = getMatchesForRound(tournament.bracket, tournament.currentRound);
  const allDone = currentRoundMatches.every((m) => m.status === 'finished');

  if (allDone) {
    const totalRounds = Math.log2(nextPowerOf2(tournament.players.length));

    if (tournament.currentRound >= totalRounds) {
      const finalMatch = tournament.bracket.find(
        (m) => m.roundNumber === tournament.currentRound && m.matchIndex === 0,
      );
      tournament.winner = finalMatch?.winnerId || null;
      tournament.status = 'finished';

      if (tournament.winner) {
        prisma.tournament
          .update({
            where: { id: tournament.id },
            data: { status: 'finished', winnerId: tournament.winner },
          })
          .catch((err) => console.error('Failed to finalize tournament:', err));
      }

      emitTournamentUpdate(io, tournament);
      const winnerPlayer = tournament.players.find((p) => p.id === tournament.winner);
      console.log(`Tournament "${tournament.name}" won by ${winnerPlayer?.username}`);

      tournament.players.forEach((p) => {
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

  const bracketMatch = tournament.bracket.find((m) => m.matchId === finishedMatch.id);
  if (!bracketMatch) return;

  bracketMatch.winnerId = finishedMatch.winner;
  bracketMatch.status = 'finished';

  handleBracketMatchFinish(io, tournament, bracketMatch);
}
