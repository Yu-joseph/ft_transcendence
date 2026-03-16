import { useEffect, useState } from "react";

type PlayerStats = {
  id: string;
  username: string;
  wins: number;
  losses: number;
};

type PlayerStateProps = {
  userId: string;
};

export default function PlayerState({ userId }: PlayerStateProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setStats(null);
      setError(null);
      return;
    }
/// using async to get promise (object) and waiting using await
    const fetchPlayerState = async () => {
      try {
        setLoading(true);
        setError(null);
<<<<<<< HEAD
        const response  = await fetch(`http://${window.location.hostname}:1339/api/users/${userId}/stats`);
=======
        const response  = await fetch(`http://${window.location.hostname}:3000/api/users/${userId}/stats`);
>>>>>>> 2d98fb0 (SA)
        if (!response.ok) 
          throw new Error("User not found");
        const data = (await response.json()) as PlayerStats;
        setStats(data);
      } catch {
        setError("Could not load your stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerState();
  }, [userId]);

  let total = 0;
  if (stats) {
    total = stats.wins + stats.losses;
  }

  let winRate = 0;
  if (total > 0 && stats) {
    winRate = Math.round((stats.wins / total) * 100);
  }

  return (
    <section className="w-full bg-slate-800 border border-blue-700 rounded-xl shadow-lg overflow-hidden h-fit">
      <div className="px-6 py-4 border-b border-blue-800">
        <h3 className="text-xl font-semibold text-amber-500">Your Progress</h3>
        <p className="text-sm text-gray-400">Your personal match statistics</p>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-gray-300">Loading stats...</div>
      ) : !userId ? (
        <div className="px-6 py-8 text-gray-300">Loading your profile...</div>
      ) : error ? (
        <div className="px-6 py-8 text-red-300">{error}</div>
      ) : !stats || total === 0 ? (
        <div className="px-6 py-8 text-gray-300">No games played yet. Go play!</div>
      ) : (
        <div className="px-6 py-5 space-y-5">

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center bg-slate-900/60 rounded-lg py-4">
              <span className="text-2xl font-bold text-emerald-300">{stats.wins}</span>
              <span className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Wins</span>
            </div>
            <div className="flex flex-col items-center bg-slate-900/60 rounded-lg py-4">
              <span className="text-2xl font-bold text-rose-300">{stats.losses}</span>
              <span className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Losses</span>
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
                className="bg-emerald-400 h-3 rounded-full transition-all duration-500"
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