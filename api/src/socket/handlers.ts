import { Server, Socket } from 'socket.io';
import { Player, Match } from '../types/game';

// In-memory storage (use Redis/DB for production)
const players = new Map<string, Player>();
const searchQueue: string[] = [];
const matches = new Map<string, Match>();

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Handle player joining lobby
    socket.on('join-lobby', (data: { id: string; username: string }) => {
      for (const [, existing] of players)
      {
        if(existing.id === data.id)
          return;
      }
      const player: Player = {
        id: data.id,
        username: data.username,
        socketId: socket.id,
        isReady: false
      };
      
      players.set(socket.id, player);
      
      // Broadcast updated player list to all clients
      io.emit('players-update', Array.from(players.values()));
      console.log(`${data.username} joined the lobby`);
    });

    
    // Handle sending invite to a player
    socket.on('send-invite', (targetSocketId: string) => {
      const sender = players.get(socket.id);
      const target = players.get(targetSocketId);
      
      if (!sender || !target) return;
      if (targetSocketId === socket.id) return; // Can't invite yourself
      
      // Send invite to the target player
      io.to(targetSocketId).emit('receive-invite', {
        from: sender,
        inviteId: `invite-${Date.now()}`
      });
      
      console.log(`${sender.username} invited ${target.username}`);
    });

    // Handle accepting an invite
    socket.on('accept-invite', (data: { inviteId: string; fromSocketId: string }) => {
      const player1 = players.get(data.fromSocketId); // Inviter
      const player2 = players.get(socket.id);          // Accepter
      
      if (!player1 || !player2) return;
      
      // Remove both from search queue if they were searching
      [data.fromSocketId, socket.id].forEach(id => {
        const index = searchQueue.indexOf(id);
        if (index > -1) searchQueue.splice(index, 1);
      });
      
      // Create match
      const matchId = `match-${Date.now()}`;
      const match: Match = {
        id: matchId,
        players: [player1, player2],
        board: Array(9).fill(null),
        currentTurn: player1.id,
        status: 'playing',
        winner: null
      };
      
      matches.set(matchId, match);
      
      // Notify both players
      io.to(data.fromSocketId).emit('match-found', { matchId, match, symbol: 'X' });
      io.to(socket.id).emit('match-found', { matchId, match, symbol: 'O' });
      
      console.log(`Match created via invite: ${player1.username} vs ${player2.username}`);
    });

    // Handle declining an invite
    socket.on('decline-invite', (data: { inviteId: string; fromSocketId: string }) => {
      const decliner = players.get(socket.id);
      
      // Notify the inviter that their invite was declined
      io.to(data.fromSocketId).emit('invite-declined', {
        by: decliner?.username || 'Unknown'
      });
      
      console.log(`${decliner?.username} declined invite`);
    });

    // Handle game move
    socket.on('make-move', (data: { matchId: string; index: number; newidx:number }) => {
      const match = matches.get(data.matchId);
      const player = players.get(socket.id);
      
      if (!match || !player) return;
      if (match.currentTurn !== player.id) return; // Not your turn
      if (match.board[data.newidx] !== null) return; // Cell taken
      
      // Determine symbol (first player is X)
      const symbol = match.players[0].id === player.id ? 'X' : 'O';
      match.board[data.newidx] = symbol;
      if (data.index !== 10)
        match.board[data.index] = null;
      
      // Check for winner
      const winner = checkWinner(match.board);
      if (winner) {
        match.status = 'finished';
        match.winner = player.id;
      } else if (!match.board.includes(null)) {
        // Draw
        match.status = 'finished';
      } else {
        // Switch turn
        match.currentTurn = match.players.find(p => p.id !== player.id)?.id || null;
      }
      
      // Broadcast updated match to both players
      match.players.forEach(p => {
        io.to(p.socketId).emit('match-update', match);
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const player = players.get(socket.id);
      
      // Remove from search queue
      const queueIndex = searchQueue.indexOf(socket.id);
      if (queueIndex > -1) {
        searchQueue.splice(queueIndex, 1);
      }
      
      // Remove from players
      players.delete(socket.id);
      
      // Broadcast updated player list
      io.emit('players-update', Array.from(players.values()));
      
      console.log('User disconnected:', player?.username || socket.id);
    });
  });
}

function checkWinner(board: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}