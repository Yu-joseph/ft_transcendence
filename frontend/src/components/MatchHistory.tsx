import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";

type MatchUser = {
  id: string;
  username: string;
};

type MatchHistoryItem = {
  id: string;
  board: string[];
  status: string;
  result: string;
  created_at: string;
  tournamentId: string | null;
  playerOId: string;
  playerXId: string;
  winnerId: string | null;
  User_Game_playerXIdToUser: MatchUser;
  User_Game_playerOIdToUser: MatchUser;
};

type UserMatchHistoryProps = {
  limit?: number;
  id?: string;
};

function getOpponent(match: MatchHistoryItem, currentUserId: string): string {
  if (match.playerXId === currentUserId) {
    return match.User_Game_playerOIdToUser?.username ?? "Unknown";
  }
  if (match.playerOId === currentUserId) {
    return match.User_Game_playerXIdToUser?.username ?? "Unknown";
  }
  return "Unknown";
}

function getOutcome(match: MatchHistoryItem, currentUserId: string): "Win" | "Loss" | "Draw" {
  const resultText = (match.result ?? "").toLowerCase();
  const isDraw = !match.winnerId || resultText.includes("draw");
  if (isDraw) return "Draw";
  return match.winnerId === currentUserId ? "Win" : "Loss";
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Add these helpers/components above UserMatchHistory

function normalizeCellValue(cell: string | undefined): "X" | "O" | "" {
  const value = (cell ?? "").trim().toUpperCase();
  if (value === "X" || value === "O") return value;
  return "";
}

function getBoardCells(board: string[]): Array<"X" | "O" | ""> {
  return Array.from({ length: 9 }, (_, index) => normalizeCellValue(board[index]));
}

function MiniBoardPreview({ board }: { board: string[] }) {
  const cells = getBoardCells(board);

  return (
    <div className="grid grid-cols-3 gap-0.5 rounded-lg border border-slate-700/80 bg-slate-950/70 p-1 w-16 h-16">
      {cells.map((cell, index) => {
        const cellClass =
          cell === "X"
            ? "border-cyan-500/40 bg-cyan-500/20 text-cyan-300"
            : cell === "O"
            ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
            : "border-slate-700/70 bg-slate-800/90 text-slate-600";

        return (
          <div
            key={index}
            className={`flex items-center justify-center rounded-[3px] border text-[10px] font-bold leading-none ${cellClass}`}
          >
            {cell || "-"}
          </div>
        );
      })}
    </div>
  );
}

export default function UserMatchHistory({ limit = 8, id }: UserMatchHistoryProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let isActive = true;

    const fetchMatchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // const userId = id || user?.id;
        const response = await fetch(`/game-api/api/me/games`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to load match history (${response.status})`);
        }

        const data = (await response.json()) as MatchHistoryItem[];
        if (isActive) {
          setMatches(data);
        }
      } catch {
        if (isActive) {
          setError("Could not load your match history.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchMatchHistory();

    return () => {
      isActive = false;
    };
  }, [user?.id, id]);

  const visibleMatches = useMemo(() => matches.slice(0, limit), [matches, limit]);

  return (
    <section className="w-full bg-slate-800 border border-black rounded-xl shadow-lg overflow-hidden h-fit hover:border-amber-500 hover:scale-102 transition-all duration-300">
      <div className="px-6 py-4 border-b border-black">
        <h3 className="text-xl font-semibold text-amber-500">Match History</h3>
        <p className="text-sm text-gray-400">Your most recent games</p>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-gray-300">Loading match history...</div>
      ) : error ? (
        <div className="px-6 py-8 text-red-300">{error}</div>
      ) : visibleMatches.length === 0 ? (
        <div className="px-6 py-8 text-gray-300">No matches yet. Play your first game!</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Board</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Opponent</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Result</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Type</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              {visibleMatches.map((match) => {
                const outcome = getOutcome(match, user?.id ?? "");
                const outcomeClass =
                  outcome === "Win"
                    ? "text-emerald-300"
                    : outcome === "Loss"
                    ? "text-rose-300"
                    : "text-amber-300";

                return (
                  <tr key={match.id} className="border-t border-slate-700/70 hover:bg-slate-700/40">
                    <td className="px-5 py-3">
                      <MiniBoardPreview board={match.board} />
                    </td>
                    <td className="px-5 py-3 text-white">{getOpponent(match, user?.id ?? "")}</td>
                    <td className={`px-5 py-3 font-semibold ${outcomeClass}`}>{outcome}</td>
                    <td className="px-5 py-3 text-cyan-300">
                      {match.tournamentId ? "Tournament" : "1v1"}
                    </td>
                    <td className="px-5 py-3 text-gray-300">{formatDate(match.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}