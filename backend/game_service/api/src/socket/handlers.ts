import { Server, Socket } from 'socket.io';
import { Player, Match } from '../types/game';
import prisma from '../lib/prisma';
import { advanceTournamentBracket } from './tournament';
import { getUserIdFromToken } from '../auth/identity';


// In-memory storage
const searchQueue: string[] = [];
export const players = new Map<string, Player>();
export const matches = new Map<string, Match>();
const disconnectTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
export { createGameInDB, finalizeGame, updateGameInDB, getRankedUsers };

const XP_PER_WIN = 3;
const XP_PER_LOSS = -2;
const TOURNAMENT_WIN_POINTS = 15;
const TOURNAMENT_SECOND_POINTS = 10;
const TURN_TIMEOUT_MS = 5000;
const turnTimeouts = new Map<string, ReturnType<typeof setTimeout>>();


type BaseStats = {
  id: string;
  username: string;
  wins: number;
  losses: number;
};

type StatsWithXp = BaseStats & {
  tournament_points: number;
  xp: number;
};

type RankedStats = BaseStats & {
  xp: number;
  rank: number;
};


type LobbyPlayer = Player & {
  status: 'online' | 'playing';
};

function getLobbyPlayersSnapshot(): LobbyPlayer[] {
  return Array.from(players.values()).map((player) => ({
    ...player,
    status: isPlayerInActiveMatch(player.id) ? 'playing' : 'online',
  }));
}

export function emitLobbyPlayersUpdate(io: Server) {
  io.emit('players-update', getLobbyPlayersSnapshot());
  io.emit('enlineusers', players.size);
}

function clearTurnTimer(matchId: string) {
  const t = turnTimeouts.get(matchId);
  if (!t) return;
  clearTimeout(t);
  turnTimeouts.delete(matchId);
}

function firstEmptyIndex(board: (string | null)[]): number {
  return board.findIndex((c) => c === null);
}

function buildAutoMove(match: Match, playerId: string): { oldindex: number; newindex: number } | null {
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

async function applyMove(
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
    io.to(p.socketId).emit('match-update', match);
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

async function onTurnTimeout(io: Server, matchId: string, expectedPlayerId: string) {
  const match = matches.get(matchId);
  if (!match || match.status !== 'playing' || !match.currentTurn) return;
  if (match.currentTurn !== expectedPlayerId) return;
  const autoMove = buildAutoMove(match, match.currentTurn);
  if (!autoMove) return;

  console.log('Turn timeout in ' + matchId + ', auto move for ' + match.currentTurn);
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

function computeBaseXp(wins: number, losses: number): number {
  return wins * XP_PER_WIN + losses * XP_PER_LOSS;
}
function addPoints(map: Map<string, number>, userId: string, points: number) {
  map.set(userId, (map.get(userId) ?? 0) + points);
}
function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < Math.max(1, n)) p *= 2;
  return p;
}
async function getTournamentBonusByUser(): Promise<Map<string, number>> {
  const finishedTournaments = await prisma.tournament.findMany({
    where: { status: "finished" },
    select: {
      winnerId: true,
      TournamentParticipant: {
        select: { userId: true, eliminated_in_round: true },
      },
    },
  });

  const bonusByUser = new Map<string, number>();

  for (const tournament of finishedTournaments) {
    const participants = tournament.TournamentParticipant;
    if (participants.length === 0) continue;

    if (tournament.winnerId) {
      addPoints(bonusByUser, tournament.winnerId, TOURNAMENT_WIN_POINTS);
    }

    //second place 

    const totalRounds = Math.log2(nextPowerOf2(participants.length));

    const secondPlace = participants.find(
      (p) => p.eliminated_in_round === totalRounds && p.userId !== tournament.winnerId,
    );
    if (secondPlace) {
      addPoints(bonusByUser, secondPlace.userId, TOURNAMENT_SECOND_POINTS);
    }
  }

  return bonusByUser;
}

function compareForRank(a: StatsWithXp, b: StatsWithXp): number {
  if (b.xp !== a.xp) return b.xp - a.xp;
  if (b.wins !== a.wins) return b.wins - a.wins;
  if (a.losses !== b.losses) return a.losses - b.losses;
  return a.username.localeCompare(b.username);
}

async function getRankedUsers(): Promise<RankedStats[]> {
  const [users, tournamentBonusByUser] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, username: true, wins: true, losses: true },
    }),
    getTournamentBonusByUser(),
  ]);

  const withXp: StatsWithXp[] = users.map((u) => {
    const tournament_points = tournamentBonusByUser.get(u.id) ?? 0;
    const xp = computeBaseXp(u.wins, u.losses) + tournament_points;
    return { ...u, tournament_points, xp };
  });

  const sorted = withXp.sort(compareForRank);

  return sorted.map((u, idx) => ({
    ...u,
    rank: idx + 1,
  }));
}

/**
 * Save a new match to DB when it starts.
 */
async function createGameInDB(match: Match) {
  const boardStrings = match.board.map(cell => cell ?? '');
  await prisma.game.create({
    data: {
      id: match.id,
      board: boardStrings,
      status: 'playing',
      result: 'PENDING',
      playerXId: match.players[0].id,
      playerOId: match.players[1].id,
      tournamentId: match.tournamentId ?? null,
      created_at: new Date(), // fixed field name
    },
  });
  console.log(`Game created in DB: ${match.id}`);
}

/**
 * Update the board in DB after every move.
 */
async function updateGameInDB(match: Match) {
  const boardStrings = match.board.map(cell => cell ?? '');
  await prisma.game.upsert({
    where: { id: match.id },
    update: {
      board: boardStrings,
      status: match.status,
    },
    create: {
      id: match.id,
      board: boardStrings,
      status: match.status,
      result: 'PENDING',
      playerXId: match.players[0].id,
      playerOId: match.players[1].id,
      tournamentId: match.tournamentId ?? null,
      created_at: new Date(),
    },
  });
}

/**
 * Finalize the game: update result, winner, and user stats.
 */
async function finalizeGame(match: Match) {
  const playerXId = match.players[0].id;
  const playerOId = match.players[1].id;

  const winnerId = match.winner ?? null;
  const result =
    winnerId === playerXId ? 'X_WIN' : 'O_WIN';

  const boardStrings = match.board.map(cell => cell ?? '');

  await prisma.game.upsert({
    where: { id: match.id },
    update: {
      board: boardStrings,
      status: 'finished',
      result,
      winnerId,
    },
    create: {
      id: match.id,
      board: boardStrings,
      status: 'finished',
      result,
      winnerId,
      playerXId,
      playerOId,
      tournamentId: match.tournamentId ?? null,
      created_at: new Date(),
    },
  });

  // Tournament games do not affect wins/losses
  if (match.tournamentId) {
    console.log(`Tournament game finished without W/L update: ${match.id}`);
    return;
  }

 if (winnerId)
 {
   const loserId = winnerId === playerXId ? playerOId : playerXId;
   await prisma.$transaction([
     prisma.user.update({ where: { id: winnerId }, data: { wins: { increment: 1 } } }),
     prisma.user.update({ where: { id: loserId }, data: { losses: { increment: 1 } } }),
   ]);
 
   console.log(`Game finished: ${result} | ${match.players[0].username} vs ${match.players[1].username}`);
 }
}

/**
 * Forfeit a match: the leaver loses, the opponent wins.
 */
async function forfeitMatch(io: Server, matchId: string, leaverId: string) {
  const match = matches.get(matchId);
  if (!match || match.status === 'finished') return;

  const opponent = match.players.find(p => p.id !== leaverId);
  if (!opponent) return;

  match.status = 'finished';
  match.winner = opponent.id;

  // Notify the opponent
  io.to(opponent.socketId).emit('match-update', match);
  io.to(opponent.socketId).emit('opponent-forfeited', {
    matchId,
    winner: opponent.username,
  });

  // Persist to DB
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

  console.log(`Match ${matchId} forfeited by ${leaverId}, ${opponent.username} wins`);
}
export function isPlayerInActiveMatch(userId: string): boolean {
  for (const match of matches.values()) {
    if (match.status === 'playing' && match.players.some((p) => p.id === userId)) {
      return true;
    }
  }

  return false;
}

export function setupSocketHandlers(io: Server) {
  io.use(async (socket, next) => {
    try {
      const token = readCookie(socket.handshake.headers.cookie, "access_token");
      if (!token) return next(new Error("unauthorized"));

      const userId = await getUserIdFromToken(token);
      if (!userId) return next(new Error("unauthorized"));

      socket.data.userId = userId;
      next();
    } catch {
      next(new Error("auth service unavailable"));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-lobby', (data: { username?: string }) => {
      const userId = socket.data.userId as string;
      if (!userId) return;

      const username =
        (data?.username && data.username.trim()) || 'Guest';

      for (const [existingSocketId, existing] of players) {
        if (existing.id === userId) {
          players.delete(existingSocketId);
          existing.socketId = socket.id;
          existing.username = username; // optional update
          players.set(socket.id, existing);
          emitLobbyPlayersUpdate(io);
          return;
        }
      }

      const player: Player = {
        id: userId,
        username,
        socketId: socket.id,
        isReady: false,
      };

      players.set(socket.id, player);
      emitLobbyPlayersUpdate(io);
      console.log(`${data.username} joined the lobby`);
    });

    socket.on('send-invite', (targetSocketId: string) => {
      const sender = players.get(socket.id);
      const target = players.get(targetSocketId);
      if (!sender || !target) return;
      if (targetSocketId === socket.id) return;
      if (isPlayerInActiveMatch(target.id)) return;

      io.to(targetSocketId).emit('receive-invite', {
        from: sender,
        inviteId: `invite-${Date.now()}`,
      });
      console.log(`${sender.username} invited ${target.username}`);
    });

    socket.on('accept-invite', async (data: { inviteId: string; fromSocketId: string }) => {
      const player1 = players.get(data.fromSocketId);
      const player2 = players.get(socket.id);
      if (!player1 || !player2) return;
      if (isPlayerInActiveMatch(player1.id) || isPlayerInActiveMatch(player2.id)) return;

      [data.fromSocketId, socket.id].forEach(id => {
        const index = searchQueue.indexOf(id);
        if (index > -1) searchQueue.splice(index, 1);
      });

      const matchId = `match-${Date.now()}`;
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

      // Save to DB immediately
      try {
        await createGameInDB(match);
      } catch (err) {
        console.error('Failed to create game in DB:', err);
      }

      io.to(data.fromSocketId).emit('match-found', { matchId, match, symbol: 'X' });
      io.to(socket.id).emit('match-found', { matchId, match, symbol: 'O' });

      console.log(`Match created via invite: ${player1.username} vs ${player2.username}`);
    });

    socket.on('decline-invite', (data: { inviteId: string; fromSocketId: string }) => {
      const decliner = players.get(socket.id);
      io.to(data.fromSocketId).emit('invite-declined', {
        by: decliner?.username || 'Unknown',
      });
      console.log(`${decliner?.username} declined invite`);
    });

    socket.on('make-move', async (data: { matchId: string; oldindex: number; newindex: number }) => {
      const userId = socket.data.userId as string | undefined;
      if (!userId) return;

      const match = matches.get(data.matchId);
      if (!match) return;

      const player = match.players.find((p) => p.id === userId);
      if (!player) return;

      player.socketId = socket.id;

      const ok = await applyMove(io, match, userId, data.oldindex, data.newindex);

      if (!ok) {
        socket.emit('move-rejected', { reason: 'Invalid move' });
      }
    });

    socket.on('reconnect-match', (data: { matchId: string }) => {
      const userId = socket.data.userId as string | undefined;
      if (!userId) {
        socket.emit('reconnect-match-failed', { reason: 'Unauthorized' });
        return;
      }

      const timeout = disconnectTimeouts.get(userId);
      if (timeout) {
        clearTimeout(timeout);
        disconnectTimeouts.delete(userId);
      }

      const match = matches.get(data.matchId);
      if (!match) {
        socket.emit('reconnect-match-failed', { reason: 'Match not found' });
        return;
      }

      const player = match.players.find((p) => p.id === userId);
      if (!player) {
        socket.emit('reconnect-match-failed', { reason: 'Not a player in this match' });
        return;
      }

      bindPlayerToSocket(player, socket.id);
      emitLobbyPlayersUpdate(io);
      const symbol = match.players[0].id === userId ? 'X' : 'O';
      socket.emit('match-found', { matchId: data.matchId, match, symbol });
    });
    socket.on('leave-match', async (data: { matchId: string }) => {
      const userId = socket.data.userId as string | undefined;
      if (!userId) return;

      const pending = disconnectTimeouts.get(userId);
      if (pending) {
        clearTimeout(pending);
        disconnectTimeouts.delete(userId);
      }
      await forfeitMatch(io, data.matchId, userId);
    });
    socket.on('disconnect', () => {
      const player = players.get(socket.id);

      const queueIndex = searchQueue.indexOf(socket.id);
      if (queueIndex > -1) searchQueue.splice(queueIndex, 1);

      if (player) {
        const existingTimeout = disconnectTimeouts.get(player.id);
        if (existingTimeout) clearTimeout(existingTimeout);

        for (const [matchId, match] of matches) {
          if (match.status === 'playing' && match.players.some(p => p.id === player.id)) {
            const timeout = setTimeout(() => {
              disconnectTimeouts.delete(player.id);

              const reconnectedElsewhere = Array.from(players.entries()).some(
                ([sid, p]) => sid !== socket.id && p.id === player.id
              );
              if (!reconnectedElsewhere) {
                void forfeitMatch(io, matchId, player.id);
              }
            }, RECONNECT_GRACE_MS);

            disconnectTimeouts.set(player.id, timeout);
            break;
          }
        }
      }

      players.delete(socket.id);
      emitLobbyPlayersUpdate(io);
      console.log('User disconnected:', player?.username || socket.id);
    });
  });
}

function checkWinner(board: (string | null)[]): string | null {
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

const RECONNECT_GRACE_MS = 15000;

function bindPlayerToSocket(player: Player, socketId: string) {
  for (const [existingSocketId, existing] of players) {
    if (existing.id === player.id && existingSocketId !== socketId) {
      players.delete(existingSocketId);
    }
  }
  player.socketId = socketId;
  players.set(socketId, player);
}

function readCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const hit = parts.find((p) => p.startsWith(name + "="));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

