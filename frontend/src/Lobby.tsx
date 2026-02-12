import { useEffect, useState } from "react";
import { socket } from "./socket/sock";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

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

function Lobby() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [pendingInvite, setPendingInvite] = useState<Invite | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();

  // Connect socket and join lobby when user is available
  useEffect(() => {
    if (!user) return;

    socket.connect();

    const handleConnect = () => {
      console.log("Connected to server");
      // Emit join-lobby to register this user on the server
      socket.emit("join-lobby", {
        id: user.id,
        username: user.fullName ?? user.username ?? user.primaryEmailAddress?.emailAddress ?? "Guest"
      });
    };

    const handleOnlineUsers = (count: number) => {
      console.log("Online users:", count);
      setOnlineCount(count);
    };

    const handlePlayersUpdate = (playersList: Player[]) => {
      console.log("Players updated:", playersList);
      setPlayers(playersList);
    };

    const handleReceiveInvite = (invite: Invite) => {
      console.log("Received invite from:", invite.from.username);
      setPendingInvite(invite);
    };

    const handleMatchFound = (data: { matchId: string; match: any; symbol: string }) => {
      console.log("Match found:", data.matchId, "Your symbol:", data.symbol);
      navigate(`/game/${data.matchId}`, { state: { symbol: data.symbol, match: data.match } });
    };

    const handleInviteDeclined = (data: { by: string }) => {
      console.log("Invite declined by:", data.by);
      alert(`${data.by} declined your invite`);
    };

    socket.on("connect", handleConnect);
    socket.on("enlineusers", handleOnlineUsers);
    socket.on("players-update", handlePlayersUpdate);
    socket.on("receive-invite", handleReceiveInvite);
    socket.on("match-found", handleMatchFound);
    socket.on("invite-declined", handleInviteDeclined);

    // If already connected, emit join-lobby immediately
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("enlineusers", handleOnlineUsers);
      socket.off("players-update", handlePlayersUpdate);
      socket.off("receive-invite", handleReceiveInvite);
      socket.off("match-found", handleMatchFound);
      socket.off("invite-declined", handleInviteDeclined);
    };
  }, [user, navigate]);

  const handleSendInvite = (targetSocketId: string) => {
    console.log("Sending invite to:", targetSocketId);
    socket.emit("send-invite", targetSocketId);
  };

  const handleAcceptInvite = () => {
    if (!pendingInvite) return;
    socket.emit("accept-invite", {
      inviteId: pendingInvite.inviteId,
      fromSocketId: pendingInvite.from.socketId
    });
    setPendingInvite(null);
  };

  const handleDeclineInvite = () => {
    if (!pendingInvite) return;
    socket.emit("decline-invite", {
      inviteId: pendingInvite.inviteId,
      fromSocketId: pendingInvite.from.socketId
    });
    setPendingInvite(null);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-xl mb-4">You need to sign in to access the lobby.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 text-lg font-semibold rounded-xl 
                         bg-linear-to-r from-indigo-500 to-purple-600
                         text-white hover:scale-105 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <header className="flex flex-col items-center justify-start gap-6 pt-12">
          <h1 className="text-4xl font-bold text-center">
            <span className="bg-linear-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Game Lobby
            </span>
          </h1>

          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <span className="text-white text-sm">
              {user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress}
            </span>
            <span className="text-green-400 text-sm ml-4">
              {onlineCount} online
            </span>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-white text-xl font-semibold mb-4">Online Players</h2>
            {players.filter(p => p.socketId !== socket.id).length === 0 ? (
              <p className="text-slate-400">No other players online yet...</p>
            ) : (
              <ul className="space-y-2">
                {players
                  .filter(p => p.socketId !== socket.id)
                  .map((p) => (
                  <li
                    key={p.socketId}
                    className="flex items-center justify-between bg-slate-700 rounded-lg px-4 py-2"
                  >
                    <span className="text-white">
                      {p.username} <span className="text-green-400">🟢</span>
                    </span>
                    <button
                      onClick={() => handleSendInvite(p.socketId)}
                      className="px-3 py-1 text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition"
                    >
                      Challenge
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pending Invite Modal */}
          {pendingInvite && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full mx-4">
                <h3 className="text-white text-xl font-semibold mb-4">Game Invite</h3>
                <p className="text-slate-300 mb-6">
                  <span className="text-emerald-400 font-semibold">{pendingInvite.from.username}</span> wants to play with you!
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
        </header>
      </SignedIn>
    </div>
  );
}

export default Lobby;
