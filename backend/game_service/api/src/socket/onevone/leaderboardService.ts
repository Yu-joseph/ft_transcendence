import prisma from "../../lib/prisma";

const XP_PER_WIN = 3;
const XP_PER_LOSS = -2;
const TOURNAMENT_WIN_POINTS = 15;
const TOURNAMENT_SECOND_POINTS = 10;

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

export function computeBaseXp(wins: number, losses: number): number {
  return wins * XP_PER_WIN + losses * XP_PER_LOSS;
}

export function addPoints(map: Map<string, number>, userId: string, points: number) {
  map.set(userId, (map.get(userId) ?? 0) + points);
}

export function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < Math.max(1, n)) p *= 2;
  return p;
}

export async function getTournamentBonusByUser(): Promise<Map<string, number>> {
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

export function compareForRank(a: StatsWithXp, b: StatsWithXp): number {
  if (b.xp !== a.xp) return b.xp - a.xp;
  if (b.wins !== a.wins) return b.wins - a.wins;
  if (a.losses !== b.losses) return a.losses - b.losses;
  return a.username.localeCompare(b.username);
}

export async function getRankedUsers(): Promise<RankedStats[]> {
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