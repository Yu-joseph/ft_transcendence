import { useEffect, useState } from "react";
import { gameSocket } from "../socket/sock";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

type TournamentEntry = {
  tournamentId: string;
  name: string;
  creatorName: string;
  playerCount: number;
  maxPlayers: number;
};

type JoinedTournamentEntry = {
  tournamentId: string;
  status: string;
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
        const response = await fetch("/game-api/api/me/tournaments", {
          credentials: "include",
        });
        if (!response.ok)
          return;
        const data = (await response.json()) as JoinedTournamentEntry[];
        const active = getStoredActiveTournament();
        if (active?.tournamentId) {
          const stillActive = data.some(
            (entry) => entry.tournamentId === active.tournamentId && entry.status !== "finished",
          );
          if (!stillActive) {
            sessionStorage.removeItem("activeTournament");
          }
        }
        setJoinedTournamentIds(data.map((entry) => entry.tournamentId));
      } catch {
        setJoinedTournamentIds([]);
      }
    };

    const fetchList = () => {
      gameSocket.emit("get-tournaments");
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
      setJoinedTournamentIds((prev) => prev.filter((id) => id !== tournamentId));
      const active = getStoredActiveTournament();
      if (active?.tournamentId === tournamentId) {
        sessionStorage.removeItem("activeTournament");
      }
    };

    const onCreated = (data: { tournamentId: string }) => {
      setJoinedTournamentIds((prev) => {
        if (prev.includes(data.tournamentId)) {
          return prev;
        }
        return [...prev, data.tournamentId];
      });
    };

    const onTournamentError = (data: { message?: string }) => {
      setError(data.message ?? "Could not join tournament.");
      setTimeout(() => setError(null), 3500);
    };

    gameSocket.on("tournaments-list", onList);
    gameSocket.on("tournament-available", onAvailable);
    gameSocket.on("tournament-removed", onRemoved);
    gameSocket.on("tournament-created", onCreated);
    gameSocket.on("tournament-error", onTournamentError);

    fetchMyTournaments();

    if (gameSocket.connected) {
      fetchList();
    } else {
      gameSocket.once("connect", fetchList);
    }

    return () => {
      gameSocket.off("tournaments-list", onList);
      gameSocket.off("tournament-available", onAvailable);
      gameSocket.off("tournament-removed", onRemoved);
      gameSocket.off("tournament-created", onCreated);
      gameSocket.off("tournament-error", onTournamentError);
      gameSocket.off("connect", fetchList);
    };
  }, []);

  const handleJoin = (tournamentId: string, isFull: boolean, isJoined: boolean) => {
    if (!user) 
      return;
    if (!isJoined && isFull)
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
    gameSocket.emit("join-tournament", joinInfo);
    navigate("/Tournament", { state: joinInfo });
  };

  const visibleTournaments = tournaments;

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
      {visibleTournaments.length === 0 ? (
        <div className="px-6 py-8 text-gray-400">No tournaments available yet.</div>
      ) : (
        <ul className="divide-y divide-blue-800/50">
          {visibleTournaments.map((t) => {
            const isFull = t.playerCount >= t.maxPlayers;
            const isJoined = joinedTournamentIds.includes(t.tournamentId);
            return (
              <li key={t.tournamentId} className="flex items-center justify-between px-6 py-4 hover:bg-slate-700/40 transition">
                <div>
                  <p className="text-white font-semibold">{t.name}</p>
                  <p className="text-sm text-gray-400">by {t.creatorName} · {t.playerCount}/{t.maxPlayers} players</p>
                </div>
                <button
                  onClick={() => handleJoin(t.tournamentId, isFull, isJoined)}
                  disabled={!isJoined && isFull}
                  className={`px-4 py-2 rounded-xl text-white text-sm font-semibold transition ${
                    !isJoined && isFull
                      ? "bg-slate-600 cursor-not-allowed opacity-70"
                      : isJoined
                        ? "bg-blue-600 hover:bg-blue-800"
                        : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  {isJoined ? "Open" : isFull ? "Full" : "Join"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}