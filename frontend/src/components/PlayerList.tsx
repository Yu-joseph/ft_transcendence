import { useEffect, useState } from "react";
import { gameSocket } from "../socket/sock";
import { useAuth } from "../auth/useAuth";
import { MdOnlinePrediction } from "react-icons/md";

type Player = {
  id: string;
  username: string;
  socketId: string;
  status?: "online" | "playing";
};

// Use the global auth context
export default function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sentToast, setSentToast] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return; // Wait until user is fully loaded

    const handlePlayersUpdate = (List: Player[]) => setPlayers(List);
    gameSocket.on("players-update", handlePlayersUpdate);

    return () => {
      gameSocket.off("players-update", handlePlayersUpdate);
    };
  }, [user]);

  const handleSendInvite = (targetSocketId: string, username: string) => {
    gameSocket.emit("send-invite", targetSocketId);
    setSentToast(`Invite sent to ${username}!`);
    setTimeout(() => setSentToast(null), 3000);
  };

  const otherPlayers = players.filter((p) => p.socketId !== gameSocket.id);

  return (
    <>
      <div className="bg-slate-800 border border-blue-700 rounded-xl p-5 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-amber-500 text-xl font-semibold">Online Players</h2>
          <span className="text-green-400 text-sm">{players.length - 1} online</span>
        </div>

        {otherPlayers.length === 0 ? (
          <p className="text-slate-400">No other players online yet...</p>
        ) : (
          <ul className="space-y-2">
            {otherPlayers.map((p) => (
              <li
                key={p.socketId}
                className="flex items-center justify-between bg-slate-700 rounded-lg px-4 py-2"
              >
                <span className="text-white inline-flex items-center gap-1">
                  {p.username} <span className="text-green-400"><MdOnlinePrediction /></span>
                </span>
                <button
                  onClick={() => handleSendInvite(p.socketId, p.username)}
                  className="px-3 py-1 text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
                >
                  Challenge
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {sentToast && (
        <div className="fixed bottom-24 left-1/2 bg-amber-500 text-white px-4 py-3 rounded-xl font-semibold animate-pulse">
          {sentToast}
        </div>
      )}

    </>
  );
}