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
  const [joinedTournamentIds, setJoinedTournamentIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const getStoredActiveTournament = () => {
    const stored = sessionStorage.getItem("activeTournament");
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as { tournamentId?: string; username?: string };
    } catch {
      sessionStorage.removeItem("activeTournament");
      return null;
    }
  };

  useEffect(() => {
    const fetchMyTournaments = async () => {
      try {
        const response = await fetch(`http://${window.location.hostname}:1339/api/me/tournaments`, {
          credentials: "include",
        });
        if (!response.ok)
          return;
        const data = (await response.json()) as { tournamentId: string }[];
        setJoinedTournamentIds(data.map((entry) => entry.tournamentId));
      } catch {
        setJoinedTournamentIds([]);
      }
    };

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

    const onCreated = (data: { tournamentId: string }) => {
      setJoinedTournamentIds((prev) => {
        if (prev.includes(data.tournamentId)) {
          return prev;
        }
        return [...prev, data.tournamentId];
      });
      setTournaments((prev) => prev.filter((t) => t.tournamentId !== data.tournamentId));
    };

    const onTournamentError = (data: { message?: string }) => {
      setError(data.message ?? "Could not join tournament.");
      setTimeout(() => setError(null), 3500);
    };

    socket.on("tournaments-list", onList);
    socket.on("tournament-available", onAvailable);
    socket.on("tournament-removed", onRemoved);
    socket.on("tournament-created", onCreated);
    socket.on("tournament-error", onTournamentError);

    fetchMyTournaments();

    if (socket.connected) {
      fetchList();
    } else {
      socket.once("connect", fetchList);
    }

    return () => {
      socket.off("tournaments-list", onList);
      socket.off("tournament-available", onAvailable);
      socket.off("tournament-removed", onRemoved);
      socket.off("tournament-created", onCreated);
      socket.off("tournament-error", onTournamentError);
      socket.off("connect", fetchList);
    };
  }, []);

  const handleJoin = (tournamentId: string, isFull: boolean) => {
    if (!user) 
      return;
    if (isFull)
      return;

    const active = getStoredActiveTournament();
    if (active?.tournamentId && active.tournamentId !== tournamentId) {
      setError("You are already inside another active tournament. Leave it or finish it first.");
      return;
    }

    const joinInfo = {
      tournamentId,
      username: user.username ?? user.fullName ?? "Player",
    };
    setJoinedTournamentIds((prev) => {
      if (prev.includes(tournamentId)) {
        return prev;
      }
      return [...prev, tournamentId];
    });
    sessionStorage.setItem("activeTournament", JSON.stringify(joinInfo));
    socket.emit("join-tournament", joinInfo);
    navigate("/Tournament", { state: joinInfo });
  };

  const availableTournaments = tournaments.filter(
    (t) => !joinedTournamentIds.includes(t.tournamentId),
  );

  return (
    <section className="w-full max-w-lg bg-slate-800 border border-blue-700 rounded-xl shadow-lg overflow-hidden h-fit">
      <div className="px-6 py-4 border-b border-blue-800">
        <h3 className="text-xl font-semibold text-amber-500">Available Tournaments</h3>
        <p className="text-sm text-gray-400">Join an open tournament</p>
      </div>
      {error && (
        <div className="mx-6 mt-4 px-3 py-2 rounded-lg border border-red-500/70 bg-red-900/30 text-red-200 text-sm">
          {error}
        </div>
      )}
      {availableTournaments.length === 0 ? (
        <div className="px-6 py-8 text-gray-400">No tournaments available yet.</div>
      ) : (
        <ul className="divide-y divide-blue-800/50">
          {availableTournaments.map((t) => {
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
