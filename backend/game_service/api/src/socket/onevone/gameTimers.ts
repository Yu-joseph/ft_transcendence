import { Match } from "../../types/game";
import { Server } from 'socket.io';
import { applyMove } from "./gameLogic";
import { matches } from "./onevoneState";

const TURN_TIMEOUT_MS = 5000;
const turnTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

export function clearTurnTimer(matchId: string) {
  const t = turnTimeouts.get(matchId);
  if (!t) return;
  clearTimeout(t);
  turnTimeouts.delete(matchId);
}

export function firstEmptyIndex(board: (string | null)[]): number {
  return board.findIndex((c) => c === null);
}

export function buildAutoMove(match: Match, playerId: string): { oldindex: number; newindex: number } | null {
  const newindex = firstEmptyIndex(match.board);
  if (newindex < 0) return null;

  const symbol = match.players[0].id === playerId ? 'X' : 'O';
  const ownCells: number[] = [];
  for (let i = 0; i < match.board.length; i++) {
    if (match.board[i] === symbol) ownCells.push(i);
  }

  if (ownCells.length < 3) {
    return { oldindex: -1, newindex };
  }

  return { oldindex: ownCells[0], newindex };
}

export async function onTurnTimeout(io: Server, matchId: string, expectedPlayerId: string) {
  const match = matches.get(matchId);
  if (!match || match.status !== 'playing' || !match.currentTurn) return;
  if (match.currentTurn !== expectedPlayerId) return;
  const autoMove = buildAutoMove(match, match.currentTurn);
  if (!autoMove) return;

  // console.log('Turn timeout in ' + matchId + ', auto move for ' + match.currentTurn);
  await applyMove(io, match, match.currentTurn, autoMove.oldindex, autoMove.newindex);
}

export function startTurnTimerForMatch(io: Server, matchId: string) {
  const match = matches.get(matchId);
  if (!match || match.status !== 'playing' || !match.currentTurn) return;

  const scheduledPlayerId = match.currentTurn;

  clearTurnTimer(matchId);
  const t = setTimeout(() => {
    turnTimeouts.delete(matchId);
    void onTurnTimeout(io, matchId, scheduledPlayerId);
  }, TURN_TIMEOUT_MS);

  turnTimeouts.set(matchId, t);
}