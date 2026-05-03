import { useEffect, useState } from "react";

type PlayerStats = {
  id: string;
  username: string;
  wins: number;
  losses: number;
  xp: number;
  rank: number;
  tournamentWins: number;
};

type PlayerStateProps = {
  previewStats?: PlayerStats;
};

export default function PlayerState({ previewStats }: PlayerStateProps) {
  const [stats, setStats] = useState<PlayerStats | null>(previewStats ?? null);
  const [loading, setLoading] = useState(!previewStats);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (previewStats) {
      setStats(previewStats);
      setLoading(false);
      setError(null);
      return;
    }
    /// using async to get promise (object) and waiting using await
    const fetchPlayerState = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/ai_game/api/me/stats", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("User not found");
        }
        const data = (await response.json()) as PlayerStats;
        setStats(data);
      } catch {
        setError("Could not load your stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerState();
  }, [previewStats]);

  const total = stats ? stats.wins + stats.losses : 0;
  const winRate = stats && total > 0 ? Math.round((stats.wins / total) * 100) : 0;

  return (
    <section className="w-full bg-slate-800 border border-black rounded-xl shadow-lg overflow-hidden h-fit hover:border-amber-500 hover:scale-102 transition-all duration-300">
      <div className="px-6 py-4 border-b border-black">
        <h3 className="text-xl font-semibold text-amber-500">Your Progress</h3>
        <p className="text-sm text-gray-400">Your personal match statistics</p>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-gray-300">Loading stats...</div>
      ) : error ? (
        <div className="px-6 py-8 text-red-300">{error}</div>
      ) : !stats ? (
        <div className="px-6 py-8 text-gray-300 ">No games played yet. Go play!</div>
      ) : (
        <div className="px-6 py-5 space-y-5">

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center bg-slate-900/60 hover:bg-slate-700/40 rounded-lg py-4">
              <span className="text-2xl font-bold text-emerald-300">{stats.wins}</span>
              <span className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Wins</span>
            </div>
            <div className="flex flex-col items-center bg-slate-900/60 hover:bg-slate-700/40 rounded-lg py-4">
              <span className="text-2xl font-bold text-rose-300">{stats.losses}</span>
              <span className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Losses</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center bg-slate-900/60 hover:bg-slate-700/40 rounded-lg py-4">
              <span className="text-2xl font-bold text-cyan-300">{stats.xp}</span>
              <span className="text-xs text-gray-400 mt-1 uppercase tracking-wide">XP</span>
            </div>
            <div className="flex flex-col items-center bg-slate-900/60 hover:bg-slate-700/40 rounded-lg py-4">
              <span className="text-2xl font-bold text-amber-300">#{stats.rank}</span>
              <span className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Rank</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col items-center bg-slate-900/60 hover:bg-slate-700/40 rounded-lg py-4">
              <span className="text-2xl font-bold text-violet-300">{stats.tournamentWins}</span>
              <span className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                Tournament Wins
              </span>
            </div>
          </div>

          {/* Win rate bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Win Rate</span>
              <span className="text-emerald-300 font-semibold">{winRate}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className="bg-emerald-400 hover:bg-emerald-300 h-3 rounded-full"
                style={{ width: `${winRate}%` }}
                //style to make with suitabe with bar if win is 40% should bar also be 40%
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{total} total games played</p>
          </div>

        </div>
      )}
    </section>
  );
}