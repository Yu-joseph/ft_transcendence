import { useEffect, useState } from "react";
import { socket } from "../Game/socket/sock";
import { gameSocket } from "../socket/sock";

type TournamentOwner = {
  id: string;
  username: string;
};

type MyTournamentEntry = {
  tournamentId: string;
  name: string;
  status: "waiting" | "in-progress" | "finished";
  creator: TournamentOwner | null;
  userStatus: "playing" | "winner" | "eliminated";
  eliminatedInRound: number | null;
  eliminated: boolean;
  seed: number;
  tournamentWinner: TournamentOwner | null;
  createdAt: string;
};

export default function MyTournamentsTable() {
  const [rows, setRows] = useState<MyTournamentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchMyTournaments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/game-api/api/me/tournaments", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to load tournaments (${response.status})`);
        }

        const data = (await response.json()) as MyTournamentEntry[];
        if (mounted) {
          setRows(data);
        }
      } catch {
        if (mounted) {
          setError("Could not load your tournaments.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const refresh = () => {
      fetchMyTournaments();
    };

    fetchMyTournaments();
    gameSocket.on("tournament-created", refresh);
    gameSocket.on("tournament-update", refresh);

    return () => {
      mounted = false;
      gameSocket.off("tournament-created", refresh);
      gameSocket.off("tournament-update", refresh);
    };
  }, []);

  const getDisplayStatus = (entry: MyTournamentEntry) => {
    if (entry.userStatus === "eliminated") {
      return "finished";
    }

    return entry.status;
  };

  return (
    <section className="w-full bg-slate-800 border border-blue-700 rounded-xl shadow-lg overflow-hidden h-fit">
      <div className="px-6 py-4 border-b border-blue-800">
        <h3 className="text-xl font-semibold text-amber-500">My Tournaments</h3>
        <p className="text-sm text-gray-400">Your tournament progress and status</p>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-gray-300">Loading tournaments...</div>
      ) : error ? (
        <div className="px-6 py-8 text-red-300">{error}</div>
      ) : rows.length === 0 ? (
        <div className="px-6 py-8 text-gray-300 hover:bg-slate-700/40">You have not joined any tournament yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <thead className="bg-slate-950">
              <tr>
                <th className="w-1/2 px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Tournament</th>
                <th className="w-1/4 px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Status</th>
                <th className="w-1/4 px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">You</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <tr key={entry.tournamentId} className="border-t border-slate-700/70 hover:bg-slate-700/40">
                  <td className="w-1/2 px-6 py-3 text-white">
                    <p className="font-semibold">{entry.name}</p>
                    <p className="text-xs text-gray-400">By {entry.creator?.username ?? "Unknown"}</p>
                  </td>
                  <td className="w-1/4 px-6 py-3 text-gray-200 capitalize">{getDisplayStatus(entry).replace("-", " ")}</td>
                  <td className="w-1/4 px-6 py-3 text-amber-300 capitalize">
                    {entry.userStatus}
                    {entry.eliminatedInRound ? ` (R${entry.eliminatedInRound})` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
