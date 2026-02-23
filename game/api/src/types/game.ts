export interface Player {
  id: string;
  username: string;
  socketId: string;
  isReady: boolean;
}

export interface Match {
  id: string;
  players: Player[];
  board: (string | null)[];
  currentTurn: string | null; // player id
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  winner: string | null;
}