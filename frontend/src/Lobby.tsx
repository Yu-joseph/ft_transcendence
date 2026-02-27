import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import BottomNav from "./components/BottomNav";
import PlayerList from "./components/PlayerList";

function Lobby() {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900">
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-xl mb-4">You need to sign in to access the lobby.</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 text-lg font-semibold rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:scale-105 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <header className="flex flex-col items-center gap-4 pt-12 px-4 pb-32">
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
          </div>
          <PlayerList />
        </header>
      </SignedIn>

      <BottomNav />
    </div>
  );
}

export default Lobby;
