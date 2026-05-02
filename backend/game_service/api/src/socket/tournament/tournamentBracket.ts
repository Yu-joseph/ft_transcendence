import { Player, Tournament, TournamentMatch } from '../../types/game';

export function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Generate a single-elimination bracket for N players.
 * Pads to next power of 2; extra slots get byes (null player).
 */
export function generateBracket(playerList: Player[]): TournamentMatch[] {
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

/**
 * Find all bracket matches for a given round.
 */
export function getMatchesForRound(bracket: TournamentMatch[], round: number): TournamentMatch[] {
  return bracket.filter((m) => m.roundNumber === round);
}

/**
 * After a round-1+ match finishes, propagate the winner into the next round slot.
 */
export function propagateWinner(tournament: Tournament, finishedMatch: TournamentMatch) {
  const nextRound = finishedMatch.roundNumber + 1;
  const nextMatchIndex = Math.floor(finishedMatch.matchIndex / 2);
  const isFirstSlot = finishedMatch.matchIndex % 2 === 0;

  const nextMatch = tournament.bracket.find(
    (m) => m.roundNumber === nextRound && m.matchIndex === nextMatchIndex,
  );
  if (!nextMatch) return;

  const winnerPlayer = tournament.players.find((p) => p.id === finishedMatch.winnerId) || null;

  if (isFirstSlot) {
    nextMatch.player1 = winnerPlayer;
  } else {
    nextMatch.player2 = winnerPlayer;
  }
}
