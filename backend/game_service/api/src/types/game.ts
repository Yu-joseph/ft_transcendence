export interface Player {
  id: string;
  username: string;
  avatar: string | null;
  socketId: string;
  isReady: boolean;
}

export interface Match {
  id: string;
  tournamentId?: string | null;  // null = regular 1v1
  players: Player[];
  board: (string | null)[];
  currentTurn: string | null; // player id
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  winner: string | null;
}

export interface Tournament {
  id: string;
  name: string;
  creatorId: string;
  players: Player[];
  maxPlayers: number;
  bracket: TournamentMatch[];
  status: 'waiting' | 'in-progress' | 'finished';
  currentRound: number;
  winner: string | null;
}


export interface TournamentMatch {
  roundNumber: number;
  matchIndex: number;
  matchId: string | null;
  player1: Player | null;
  player2: Player | null;  // null = bye
  winnerId: string | null;
  status: 'pending' | 'ready' | 'playing' | 'finished';
  requestedBy?: string | null;
}