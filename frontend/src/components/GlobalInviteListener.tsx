import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ensureSocketConnected, gameSocket } from "../socket/sock";
import { useAuth } from "../auth/useAuth";
import type { AuthUser } from "../auth/auth-context";

type Invite = {
  inviteId: string;
  from: {
    id: string;
    username: string;
    avatar: string | null;
  };
};

export default function GlobalInviteListener() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <GlobalInviteListenerInner user={user} />;
}

function GlobalInviteListenerInner({ user }: { user: AuthUser }) {
  const [pendingInvite, setPendingInvite] = useState<Invite | null>(null);
  const [declinedBy, setDeclinedBy] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id, username } = user;

  useEffect(() => {

    const handleConnect = () => {
      gameSocket.emit("join-lobby");
    };

    const handleInviteResolved = (data: { inviteId: string; status: 'accepted' | 'declined' }) => {
      setPendingInvite((curr) => {
        if (!curr) return curr;
        return curr.inviteId === data.inviteId ? null : curr;
      });
    };

    const handleReceiveInvite = (invite: Invite) => setPendingInvite(invite);

    const handleMatchFound = (data: { matchId: string; match: unknown; symbol: string }) => {
      navigate(`/game/${data.matchId}`, {
        state: { symbol: data.symbol, match: data.match },
      });
    };

    const handleInviteDeclined = (data: { by: string }) => {
      setDeclinedBy(data.by);
    };

    gameSocket.on("connect", handleConnect);
    gameSocket.on("invite-resolved", handleInviteResolved);
    gameSocket.on("receive-invite", handleReceiveInvite);
    gameSocket.on("match-found", handleMatchFound);
    gameSocket.on("invite-declined", handleInviteDeclined);

    if (!gameSocket.connected) {
      ensureSocketConnected(gameSocket);
    } else {
      handleConnect();
    }

    return () => {
      gameSocket.off("connect", handleConnect);
      gameSocket.off("invite-resolved", handleInviteResolved);
      gameSocket.off("receive-invite", handleReceiveInvite);
      gameSocket.off("match-found", handleMatchFound);
      gameSocket.off("invite-declined", handleInviteDeclined);
    };
  }, [navigate]);

  useEffect(() => {
    if (!declinedBy) return;
    const timeoutId = window.setTimeout(() => {
      setDeclinedBy(null);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [declinedBy]);

  useEffect(() => {
    if (!pendingInvite) return;
    const invite = pendingInvite;
    const timeoutId = window.setTimeout(() => {
      gameSocket.emit('decline-invite', {
          inviteId: invite.inviteId,
        });
      setPendingInvite(null);
    }, 10000);

    return () => window.clearTimeout(timeoutId);
  }, [pendingInvite]);

  const handleAcceptInvite = () => {
    if (!pendingInvite) return;
    gameSocket.emit("accept-invite", {
      inviteId: pendingInvite.inviteId,
    });
    setPendingInvite(null);
  };

  const handleDeclineInvite = () => {
    if (!pendingInvite) return;
    gameSocket.emit("decline-invite", {
      inviteId: pendingInvite.inviteId,
    });
    setPendingInvite(null);
  };

  if (!pendingInvite && !declinedBy) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-60 w-72 max-w-[calc(100vw-2rem)] space-y-3">
      {pendingInvite && (
        <div className="bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-700">
          <div className="flex flex-col justify-center items-center gap-1">
            <h3 className="text-white text-base font-semibold mb-2">Game Invite</h3>
            <img src={pendingInvite.from.avatar} className="w-10 h-10 object-cover rounded-full" alt="" /> 
            <p className="text-emerald-400 font-semibold">
              {pendingInvite.from.username}
            </p>
            <p className="text-slate-300 text-sm mb-4">
              wants to play with you!
            </p>

          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAcceptInvite}
              className="flex-1 px-3 py-2 rounded-lg bg-amber-500 text-white text-sm hover:bg-amber-800 transition"
            >
              Accept
            </button>
            <button
              onClick={handleDeclineInvite}
              className="flex-1 px-3 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-900 transition"
            >
              Decline
            </button>
          </div>
        </div>
      )}
      {declinedBy && (
        <div className="bg-slate-900/95 rounded-lg p-3 shadow-lg border border-slate-700">
          <p className="text-slate-200 text-sm">
            <span className="text-amber-400 font-semibold">{declinedBy}</span> declined your invite.
          </p>
        </div>
      )}
    </div>
  );
}
