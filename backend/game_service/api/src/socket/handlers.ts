import { Server, Socket } from 'socket.io';
import { Player, Match } from '../types/game';
import prisma from '../lib/prisma';
import { advanceTournamentBracket } from './tournament';
import { getUserIdFromToken } from '../auth/identity';

// In-memory storage
export const players = new Map<string, Player>(); // key = userId
export const matches = new Map<string, Match>();

const userSockets = new Map<string, Set<string>>(); // userId -> socketIds
const socketToUser = new Map<string, string>(); // socketId -> userId

const disconnectTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
export { createGameInDB, finalizeGame, updateGameInDB, getRankedUsers, getUserProfile };

const XP_PER_WIN = 3;
const XP_PER_LOSS = -2;
const TOURNAMENT_WIN_POINTS = 15;
const TOURNAMENT_SECOND_POINTS = 10;
const TURN_TIMEOUT_MS = 5000;
const turnTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const INVITE_TTL_MS = 15000;
const pendingInvites = new Map<
  string,
  { fromUserId: string; toUserId: string; createdAt: number }
>();

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

type UserProfile = {
  username: string;
  avatar: string | null;
};

export function getUserRoom(userId: string): string {
  return 'user:' + userId;
}

function trackSocketForUser(socket: Socket, userId: string) {
  socketToUser.set(socket.id, userId);
  const sockets = userSockets.get(userId) ?? new Set<string>();
  sockets.add(socket.id);
  userSockets.set(userId, sockets);
  socket.join(getUserRoom(userId));
}

function untrackSocket(socketId: string): { userId: string | null; hasOtherSockets: boolean } {
  const userId = socketToUser.get(socketId) ?? null;
  if (!userId) return { userId: null, hasOtherSockets: false };

  socketToUser.delete(socketId);
  const sockets = userSockets.get(userId);
  if (!sockets) return { userId, hasOtherSockets: false };

  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(userId);
    return { userId, hasOtherSockets: false };
  }

  return { userId, hasOtherSockets: true };
}

function cleanupExpiredInvites() {
  const now = Date.now();
  for (const [inviteId, invite] of pendingInvites) {
    if (now - invite.createdAt > INVITE_TTL_MS) {
      pendingInvites.delete(inviteId);
    }
  }
}

function removePendingInvitesForUser(userId: string) {
  for (const [inviteId, invite] of pendingInvites) {
    if (invite.fromUserId === userId || invite.toUserId === userId) {
      pendingInvites.delete(inviteId);
    }
  }
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, avatar: true },
  });

  if (!user) return null;

  return {
    username: user.username,
    avatar: user.avatar ?? null,
  };
}

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
    where: { status: 'finished' },
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
  const boardStrings = match.board.map((cell) => cell ?? '');
  await prisma.game.create({
    data: {
      id: match.id,
      board: boardStrings,
      status: 'playing',
      result: 'PENDING',
      playerXId: match.players[0].id,
      playerOId: match.players[1].id,
      tournamentId: match.tournamentId ?? null,
      created_at: new Date(),
    },
  });
  console.log(`Game created in DB: ${match.id}`);
}

/**
 * Update the board in DB after every move.
 */
async function updateGameInDB(match: Match) {
  const boardStrings = match.board.map((cell) => cell ?? '');
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
  const result = winnerId === playerXId ? 'X_WIN' : 'O_WIN';

  const boardStrings = match.board.map((cell) => cell ?? '');

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

  if (match.tournamentId) {
    console.log(`Tournament game finished without W/L update: ${match.id}`);
    return;
  }

  if (winnerId) {
    const loserId = winnerId === playerXId ? playerOId : playerXId;
    await prisma.$transaction([
      prisma.user.update({ where: { id: winnerId }, data: { wins: { increment: 1 } } }),
      prisma.user.update({ where: { id: loserId }, data: { losses: { increment: 1 } } }),
    ]);

    console.log(
      `Game finished: ${result} | ${match.players[0].username} vs ${match.players[1].username}`,
    );
  }
}

/**
 * Forfeit a match: the leaver loses, the opponent wins.
 */
async function forfeitMatch(io: Server, matchId: string, leaverId: string) {
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
      const token = readCookie(socket.handshake.headers.cookie, 'access_token');
      if (!token) return next(new Error('unauthorized'));

      const userId = await getUserIdFromToken(token);
      if (!userId) return next(new Error('unauthorized'));

      socket.data.userId = userId;
      next();
    } catch {
      next(new Error('auth service unavailable'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    const authedUserId = socket.data.userId as string | undefined;
    if (!authedUserId) {
      socket.disconnect(true);
      return;
    }
    trackSocketForUser(socket, authedUserId);

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
      console.log(profile.username + ' joined the lobby');
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

      console.log(sender.username + ' invited ' + target.username);
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

      console.log('Match created via invite: ' + player1.username + ' vs ' + player2.username);
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

      console.log((decliner?.username || 'Unknown') + ' declined invite');
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
      io.to(getUserRoom(userId)).emit('match-found', { matchId: data.matchId, match, symbol });
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
      const { userId, hasOtherSockets } = untrackSocket(socket.id);
      if (!userId) return;

      if (hasOtherSockets) {
        const remainingSocketId = userSockets.get(userId)?.values().next().value as string | undefined;
        const player = players.get(userId);
        if (player && remainingSocketId) {
          player.socketId = remainingSocketId;
          players.set(userId, player);
        }
        return;
      }

      const player = players.get(userId);

      if (player) {
        const existingTimeout = disconnectTimeouts.get(player.id);
        if (existingTimeout) clearTimeout(existingTimeout);

        for (const [matchId, match] of matches) {
          if (match.status === 'playing' && match.players.some((p) => p.id === player.id)) {
            const timeout = setTimeout(() => {
              disconnectTimeouts.delete(player.id);

              const stillConnected = (userSockets.get(player.id)?.size ?? 0) > 0;
              if (!stillConnected) {
                void forfeitMatch(io, matchId, player.id);
              }
            }, RECONNECT_GRACE_MS);

            disconnectTimeouts.set(player.id, timeout);
            break;
          }
        }
      }

      removePendingInvitesForUser(userId);
      players.delete(userId);
      emitLobbyPlayersUpdate(io);
      console.log('User disconnected:', player?.username || userId);
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
  player.socketId = socketId;
  players.set(player.id, player);
}

function readCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map((p) => p.trim());
  const hit = parts.find((p) => p.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

