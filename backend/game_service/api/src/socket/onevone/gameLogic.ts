
import { Server, Socket } from 'socket.io';
import { Match } from '../../types/game';
import { emitLobbyPlayersUpdate, getUserRoom } from './lobbyPresence';
import { clearTurnTimer, startTurnTimerForMatch } from './gameTimers';
import { finalizeGame, updateGameInDB } from './gamePersistence';
import { matches } from './onevoneState';
import { advanceTournamentBracket } from '../tournament/tournamentEngine';

export async function applyMove(
  io: Server,
  match: Match,
  playerId: string,
  oldindex: number,
  newindex: number,
): Promise<boolean> {
  if (match.status !== 'playing') return false;
  if (match.currentTurn !== playerId) return false;
  if (newindex < 0 || newindex >= match.board.length) return false;
  if (match.board[newindex] !== null) return false;

  const player = match.players.find((p) => p.id === playerId);
  if (!player) return false;

  const symbol = match.players[0].id === playerId ? 'X' : 'O';
  const myPieceCount = match.board.filter((c) => c === symbol).length;

  if (myPieceCount < 3) {
    oldindex = -1;
  } else {
    if (oldindex < 0 || oldindex >= match.board.length) return false;
    if (match.board[oldindex] !== symbol) return false;
    if (oldindex === newindex) return false;
    match.board[oldindex] = null;
  }

  match.board[newindex] = symbol;

  const winnerSymbol = checkWinner(match.board);
  if (winnerSymbol) {
    match.status = 'finished';
    match.winner = playerId;
  } else if (!match.board.includes(null)) {
    match.status = 'finished';
    match.winner = null;
  } else {
    match.currentTurn = match.players.find((p) => p.id !== playerId)?.id ?? null;
  }

  for (const p of match.players) {
    io.to(getUserRoom(p.id)).emit('match-update', match);
  }

  try {
    if (match.status === 'finished') {
      clearTurnTimer(match.id);
      await finalizeGame(match);
      matches.delete(match.id);
      emitLobbyPlayersUpdate(io);
      if (match.tournamentId) {
        advanceTournamentBracket(io, match.tournamentId, match);
      }
    } else {
      await updateGameInDB(match);
      startTurnTimerForMatch(io, match.id);
    }
  } catch (err) {
    console.error('Failed to persist move:', err);
  }

  return true;
}

export async function forfeitMatch(io: Server, matchId: string, leaverId: string) {
  const match = matches.get(matchId);
  if (!match || match.status === 'finished') return;

  const opponent = match.players.find((p) => p.id !== leaverId);
  const leaver = match.players.find((p) => p.id === leaverId);
  if (!opponent || !leaver) return;

  match.status = 'finished';
  match.winner = opponent.id;

  // Send fresh match state to both players (all tabs)
  for (const p of match.players) {
    io.to(getUserRoom(p.id)).emit('match-update', match);
  }

  // Winner side tabs
  io.to(getUserRoom(opponent.id)).emit('opponent-forfeited', {
    matchId,
    winner: opponent.username,
    leaver: leaver.username,
  });

  // Leaver side tabs (this is the missing piece)
  io.to(getUserRoom(leaver.id)).emit('you-forfeited', {
    matchId,
    winner: opponent.username,
  });

  try {
    clearTurnTimer(matchId);
    await finalizeGame(match);
    matches.delete(matchId);
    emitLobbyPlayersUpdate(io);
    if (match.tournamentId) {
      advanceTournamentBracket(io, match.tournamentId, match);
    }
  } catch (err) {
    console.error('Failed to finalize forfeited match:', err);
  }

  // console.log(`Match ${matchId} forfeited by ${leaverId}, ${opponent.username} wins`);
}

export function checkWinner(board: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

export async function forfeitAnyActiveMatchForUser(io: Server, userId: string): Promise<void> {
  for (const [matchId, match] of matches) {
    if (match.status !== "playing") continue;
    if (!match.players.some((p) => p.id === userId)) continue;

    await forfeitMatch(io, matchId, userId);
    return;
  }
}