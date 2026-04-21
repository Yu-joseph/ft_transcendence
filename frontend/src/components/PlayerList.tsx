import { useEffect, useState } from "react";
import { gameSocket } from "../socket/sock";
import { useAuth } from "../auth/useAuth";
import { MdOnlinePrediction } from "react-icons/md";
import { useNavigate } from "react-router-dom";

type Player = {
  id: string;
  username: string;
  socketId: string;
  avatar: string | null;
  status?: "online" | "playing";
};

// Use the global auth context
export default function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sentToast, setSentToast] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return; // Wait until user is fully loaded

    const handlePlayersUpdate = (List: Player[]) => setPlayers(List);
    gameSocket.on("players-update", handlePlayersUpdate);

    return () => {
      gameSocket.off("players-update", handlePlayersUpdate);
    };
  }, [user]);
  const openProfile = (userId: string) => {
    if (!userId) {
      return;
    }

    navigate(`/profile/${userId}`);
  };

  const handleSendInvite = (targetUserId: string, username: string) => {
    gameSocket.emit('send-invite', { targetUserId });
    setSentToast('Invite sent to ' + username + '!');
    setTimeout(() => setSentToast(null), 3000);
  };

  const otherPlayers = players.filter((p) => p.id !== user?.id);

  return (
    <>
      <div className="bg-slate-800 border border-blue-700 rounded-xl p-5 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-amber-500 text-xl font-semibold">Online Players</h2>
          <span className="text-green-400 text-sm">{players.length === 0 ? 0 : players.length - 1} online</span>
        </div>

        {otherPlayers.length === 0 ? (
          <p className="text-slate-400">No other players online yet...</p>
        ) : (
          <ul className="space-y-2">
            {otherPlayers.map((p) => {
              const isPlaying = p.status === "playing";

              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between bg-slate-700 rounded-lg px-4 py-2"
                >
                  <span className="text-white inline-flex items-center gap-2 cursor-pointer group" onClick={() => openProfile(p.id)} >
                    <div className="" > 
                      <img src={p.avatar} className="w-10 h-10 object-cover rounded-full" alt="" /> 
                      </div>
                      <div className="flex flex-col" >
                        {p.username}
                        <span
                          className={isPlaying ? "text-amber-400 text-xs" : "text-green-400 text-xs"}
                        >
                          {isPlaying ? "Playing" : "Online"}
                        </span>
                      </div>
                  </span>

                  <button
                    onClick={() => handleSendInvite(p.id, p.username)}
                    disabled={isPlaying}
                    className={`px-3 py-1 text-sm rounded-lg text-white transition ${
                      isPlaying
                        ? "bg-slate-500 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
                  >
                    {isPlaying ? "In Match" : "Challenge"}
                  </button>
                </li>
              );
            })}
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