import { Server, Socket } from 'socket.io';
import { Player, Match } from '../types/game';
import prisma from '../lib/prisma';
// import { advanceTournamentBracket } from './tournament';

// In-memory storage
const searchQueue: string[] = [];
export const players = new Map<string, Player>();
export const matches = new Map<string, Match>();
export { createGameInDB, finalizeGame, updateGameInDB };

async function ensureUser(id: string, username: string) {
  await prisma.user.upsert({
    where: { id },
    update: { username },
    create: { id, username },
  });
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
      // tournamentId: match.tournamentId ?? undefined,
    },
  });
  console.log(`Game created in DB: ${match.id}`);
}

/**
 * Update the board in DB after every move.
 */
async function updateGameInDB(match: Match) {
  const boardStrings = match.board.map(cell => cell ?? '');
  await prisma.game.update({
    where: { id: match.id },
    data: {
      board: boardStrings,
      status: match.status,
    },
  });
}

/**
 * Finalize the game: update result, winner, and user stats.
 */
async function finalizeGame(match: Match) {
  const playerXId = match.players[0].id;
  const playerOId = match.players[1].id;

  let result: string;
  let winnerId: string | null = null;

  if (match.winner) {
    winnerId = match.winner;
    result = match.winner === playerXId ? 'X_WIN' : 'O_WIN';
  } else {
    result = 'DRAW';
  }

  const boardStrings = match.board.map(cell => cell ?? '');

  await prisma.game.update({
    where: { id: match.id },
    data: {
      board: boardStrings,
      status: 'finished',
      result,
      winnerId,
    },
  });

  if (result === 'DRAW') {
    await prisma.user.update({ where: { id: playerXId }, data: { draws: { increment: 1 } } });
    await prisma.user.update({ where: { id: playerOId }, data: { draws: { increment: 1 } } });
  } else {
    const loserId = winnerId === playerXId ? playerOId : playerXId;
    await prisma.user.update({ where: { id: winnerId! }, data: { wins: { increment: 1 } } });
    await prisma.user.update({ where: { id: loserId }, data: { losses: { increment: 1 } } });
  }

  console.log(`Game finished: ${result} | ${match.players[0].username} vs ${match.players[1].username}`);
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
    await finalizeGame(match);
    matches.delete(matchId);
    // if (match.tournamentId) {
    //   advanceTournamentBracket(io, match.tournamentId, match);
    // }
  } catch (err) {
    console.error('Failed to finalize forfeited match:', err);
  }

  console.log(`Match ${matchId} forfeited by ${leaverId}, ${opponent.username} wins`);
}

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-lobby', async (data: { id: string; username: string }) => {
      for (const [existingSocketId, existing] of players) {
        if (existing.id === data.id)
        {
          players.delete(existingSocketId);
          existing.socketId = socket.id;
          players.set(socket.id, existing);
          socket.emit('players-update', Array.from(players.values()));
          return;
        }
      }
      await ensureUser(data.id, data.username);

      const player: Player = {
        id: data.id,
        username: data.username,
        socketId: socket.id,
        isReady: false,
      };

      players.set(socket.id, player);
      io.emit('players-update', Array.from(players.values()));
      console.log(`${data.username} joined the lobby`);
    });

    socket.on('send-invite', (targetSocketId: string) => {
      const sender = players.get(socket.id);
      const target = players.get(targetSocketId);
      if (!sender || !target) return;
      if (targetSocketId === socket.id) return;

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

    socket.on('make-move', async (data: { matchId: string; oldindex: number; newindex: number; userId: string }) => {
      const match = matches.get(data.matchId);
      if (!match) return;

      const player = match.players.find(p => p.id === data.userId);
      if (!player) return;

      player.socketId = socket.id;

      if (match.currentTurn !== player.id) return;
      if (match.board[data.newindex] !== null) return;

      const symbol = match.players[0].id === player.id ? 'X' : 'O';
      match.board[data.newindex] = symbol;
      if (data.oldindex >= 0) match.board[data.oldindex] = null;

      const winner = checkWinner(match.board);
      if (winner) {
        match.status = 'finished';
        match.winner = player.id;
      } else if (!match.board.includes(null)) {
        match.status = 'finished';
      } else {
        match.currentTurn = match.players.find(p => p.id !== player.id)?.id || null;
      }

      // Send update to clients FIRST (instant feedback)
      match.players.forEach(p => {
        io.to(p.socketId).emit('match-update', match);
      });

      // Then persist to DB (non-blocking for the player)
      try {
        if (match.status === 'finished') {
          await finalizeGame(match);
          matches.delete(data.matchId);
          // if (match.tournamentId) {
          //   advanceTournamentBracket(io, match.tournamentId, match);
          // }
        } else {
          await updateGameInDB(match);
        }
      } catch (err) {
        console.error('Failed to update game in DB:', err);
      }
    });

    socket.on('reconnect-match', (data: { userId: string; matchId: string }) => {
      const match = matches.get(data.matchId);
      if (!match) {
        socket.emit('reconnect-match-failed', { reason: 'Match not found' });
        return;
      }

      const player = match.players.find(p => p.id === data.userId);
      if (!player) {
        socket.emit('reconnect-match-failed', { reason: 'Not a player in this match' });
        return;
      }

      player.socketId = socket.id;
      players.set(socket.id, player);
      const symbol = match.players[0].id === data.userId ? 'X' : 'O';
      socket.emit('match-found', { matchId: data.matchId, match, symbol });
      console.log(`${player.username} reconnected to match ${data.matchId}`);
    });
    socket.on('leave-match', async (data: { matchId: string; userId: string }) => {
      await forfeitMatch(io, data.matchId, data.userId);
    });
    socket.on('disconnect', () => {
      const player = players.get(socket.id);

      const queueIndex = searchQueue.indexOf(socket.id);
      if (queueIndex > -1) searchQueue.splice(queueIndex, 1);
      if (player) {
        for (const [matchId, match] of matches) {
          if (match.status === 'playing' && match.players.some(p => p.id === player.id)) {
            forfeitMatch(io, matchId, player.id);
            break;
          }
        }
      }
      players.delete(socket.id);
      io.emit('players-update', Array.from(players.values()));

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