import { useEffect, useState } from "react";
import { socket } from "../Game/socket/sock";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

type TournamentEntry = {
  tournamentId: string;
  name: string;
  creatorName: string;
  playerCount: number;
  maxPlayers: number;
};

export default function TournamentList() {
  const [tournaments, setTournaments] = useState<TournamentEntry[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = () => {
      socket.emit("get-tournaments");
    };

    const onList = (list: TournamentEntry[]) => {
      setTournaments(list);
    };

    const onAvailable = (entry: TournamentEntry) => {
      setTournaments((prev) => {
        const exists = prev.findIndex((t) => t.tournamentId === entry.tournamentId);
        if (exists !== -1) {
          const updated = [...prev];
          updated[exists] = entry;
          return updated;
        }
        return [...prev, entry];
      });
    };

    const onRemoved = ({ tournamentId }: { tournamentId: string }) => {
      setTournaments((prev) => prev.filter((t) => t.tournamentId !== tournamentId));
    };

    socket.on("tournaments-list", onList);
    socket.on("tournament-available", onAvailable);
    socket.on("tournament-removed", onRemoved);

    if (socket.connected) {
      fetchList();
    } else {
      socket.once("connect", fetchList);
    }

    return () => {
      socket.off("tournaments-list", onList);
      socket.off("tournament-available", onAvailable);
      socket.off("tournament-removed", onRemoved);
      socket.off("connect", fetchList);
    };
  }, []);

  const handleJoin = (tournamentId: string, isFull: boolean) => {
    if (!user) 
      return;
    if (isFull)
      return;
    const joinInfo = {
      tournamentId,
      userId: user.id,
      username: user.username ?? user.fullName ?? "Player",
    };
    sessionStorage.setItem("activeTournament", JSON.stringify(joinInfo));
    socket.emit("join-tournament", joinInfo);
    navigate("/Tournament", { state: joinInfo });
  };

  return (
    <section className="w-full max-w-lg bg-slate-800 border border-blue-700 rounded-xl shadow-lg overflow-hidden h-fit">
      <div className="px-6 py-4 border-b border-blue-800">
        <h3 className="text-xl font-semibold text-amber-500">Available Tournaments</h3>
        <p className="text-sm text-gray-400">Join an open tournament</p>
      </div>
      {tournaments.length === 0 ? (
        <div className="px-6 py-8 text-gray-400">No tournaments available yet.</div>
      ) : (
        <ul className="divide-y divide-blue-800/50">
          {tournaments.map((t) => {
            const isFull = t.playerCount >= t.maxPlayers;
            return (
              <li key={t.tournamentId} className="flex items-center justify-between px-6 py-4 hover:bg-slate-700/40 transition">
                <div>
                  <p className="text-white font-semibold">{t.name}</p>
                  <p className="text-sm text-gray-400">by {t.creatorName} · {t.playerCount}/{t.maxPlayers} players</p>
                </div>
                <button
                  onClick={() => handleJoin(t.tournamentId, isFull)}
                  disabled={isFull}
                  className={`px-4 py-2 rounded-xl text-white text-sm font-semibold transition ${
                    isFull
                      ? "bg-slate-600 cursor-not-allowed opacity-70"
                      : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  {isFull ? "Full" : "Join"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
