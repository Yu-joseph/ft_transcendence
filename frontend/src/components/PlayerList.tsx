import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { useUser } from "@clerk/clerk-react";
import { socket } from "../Game/socket/sock";
=======
import { socket } from "../Game/socket/sock";
import { getAuthUser } from "../hooks/useCustomAuth";
>>>>>>> 103627e (merging game with main and fixing login page with jwt)

import { MdOnlinePrediction } from "react-icons/md";
// import { error } from "console";



type Player = {
  id: string;
  username: string;
  socketId: string;
  status?: "online" | "playing";
};

type Invite = {
  from: Player;
  inviteId: string;
};

export default function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [pendingInvite, setPendingInvite] = useState<Invite | null>(null);
  const [sentToast, setSentToast] = useState<string | null>(null);
  const user = getAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user)
      return;

    socket.connect();
//let server know there is new connetcioni
    const handleConnect = () => {
      socket.emit("join-lobby", {
        id: user.id,
        username: user.fullName ?? user.username ?? "Guest",
      });
    };

    const handleOnlineUsers = (count : number) => {
      setOnlineCount(count);
    }
    //yssf
    const handlePlayersUpdate = (List : Player[]) =>{
      setPlayers(List);
    }
    const handleReceiveInvite = (invite: Invite) => setPendingInvite(invite);
    const handleMatchFound = (data: { matchId: string; match: unknown; symbol: string }) => {
      navigate(`/game/${data.matchId}`, {
        state: { symbol: data.symbol, match: data.match },
      });
      // state is for to pass data without showing in urld
      //then gonna read in const { symbol, match } = useLocation().state;
    };
    //yssf broswer error for declane invite
    const handleInviteDeclined = (data: { by: string }) => {
      alert(`${data.by} declined your invite`);
    };

//liste for any eveints
    socket.on("connect", handleConnect);
    socket.on("enlineusers", handleOnlineUsers);
    socket.on("players-update", handlePlayersUpdate);
    socket.on("receive-invite", handleReceiveInvite);
    socket.on("match-found", handleMatchFound);
    socket.on("invite-declined", handleInviteDeclined);

    if (socket.connected) 
      handleConnect();
// sermove all socket events 
    return () => {
      socket.off("connect", handleConnect);
      socket.off("enlineusers", handleOnlineUsers);
      socket.off("players-update", handlePlayersUpdate);
      socket.off("receive-invite", handleReceiveInvite);
      socket.off("match-found", handleMatchFound);
      socket.off("invite-declined", handleInviteDeclined);
    };
  }, [user, navigate]);

  //change  if use or navigate changes ( depndecy array)
  const handleSendInvite = (targetSocketId: string, username: string) => {
    socket.emit("send-invite", targetSocketId);
    setSentToast(`Invite sent to ${username}!`);
    setTimeout(() => setSentToast(null), 3000);
  };

  const handleAcceptInvite = () => {
    if (!pendingInvite) return;
    socket.emit("accept-invite", {
      inviteId: pendingInvite.inviteId,
      fromSocketId: pendingInvite.from.socketId,
    });
    setPendingInvite(null);
  };

  const handleDeclineInvite = () => {
    if (!pendingInvite) return;
    socket.emit("decline-invite", {
      inviteId: pendingInvite.inviteId,
      fromSocketId: pendingInvite.from.socketId,
    });
    setPendingInvite(null);
  };

  

  const otherPlayers = players.filter((p) => p.socketId !== socket.id);

  return (
    <>
      <div className="bg-slate-800 border border-blue-700 rounded-xl p-5 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-amber-500 text-xl font-semibold">Online Players</h2>
          <span className="text-green-400 text-sm">{onlineCount} online</span>
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

      {/* Sent Toast */}
      {sentToast && (
        <div className="fixed bottom-24 left-1/2 bg-amber-500 text-white px-4 py-3 rounded-xl  font-semibold animate-pulse">
          {sentToast}
        </div>
      )}

      {/* Pending Invite Modal */}
      {pendingInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white text-xl font-semibold mb-4">Game Invite</h3>
            <p className="text-slate-300 mb-6">
              <span className="text-emerald-400 font-semibold">
                {pendingInvite.from.username}
              </span>{" "}
              wants to play with you!
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleAcceptInvite}
                className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
              >
                Accept
              </button>
              <button
                onClick={handleDeclineInvite}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
