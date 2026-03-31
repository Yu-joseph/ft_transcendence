import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import PlayerList from "../components/PlayerList";
import PlayerState from "../components/PlayerState";
import TournamentList from "../components/TournamentList";
import Leaderboard from "../components/Leaderboard";
// import { SiEpicgames } from "react-icons/si";
import { PiGameControllerFill } from "react-icons/pi";
import { TbTournament } from "react-icons/tb";
// import { GiTicTacToe } from "react-icons/gi";
import Bar from '../components/Bar'
import CreateTourn from "../components/CreateTourn";
import { socket } from "./socket/sock";
import { type AuthUser, useCustomAuth } from "../hooks/useCustomAuth";




export default function Dashboard() {
  const navigate = useNavigate();
  const { isSignedIn } = useCustomAuth();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [opnePop, setOpenPop] = useState<boolean>(false);

  useEffect(() => {
    let isActive = true;

    const fetchUserProfile = async () => {
      try {
        const response = await fetch("http://localhost:8080/authent/getuser/", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          console.error("getuser failed", response.status, response.statusText);
          return;
        }

        const data = await response.json();
        console.log("getuser response", data);

        // Use the username directly from the endpoint payload; only fallback if it's completely absent
        const rawId = data.id ?? data.user?.id ?? data.profile?.id;
        const rawUsername = data.username ?? data.user?.username ?? data.profile?.username ?? "";

        const normalized: AuthUser = {
          id: rawId ? String(rawId) : "",
          username: rawUsername,
          fullName: rawUsername, // keep UI consistent with username
          email: data.email ?? data.user?.email ?? data.profile?.email,
        };
        console.log("getuser normalized", normalized);

        if (!normalized.id && !normalized.username) {
          console.error("getuser missing id/username", data);
          return;
        }
        if (isActive) {
          setUser(normalized);
        }
      } catch (error) {
        console.error("Failed to load user profile", error);
      }
    };

    void fetchUserProfile();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const onTournamentCreated = (data: { tournamentId: string; tournament: { name: string; creatorId: string } }) => {
      if (user) {
        sessionStorage.setItem('activeTournament', JSON.stringify({
          tournamentId: data.tournamentId,
          userId: user.id,
          username: user.username ?? user.fullName ?? 'Player',
        }));
      }
      navigate("/Tournament");
    };
    socket.on("tournament-created", onTournamentCreated);
    return () => {
      socket.off("tournament-created", onTournamentCreated);
    };
  }, [navigate, user]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white text-xl mb-4">You need to sign in to continue.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 text-lg font-semibold rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:scale-105 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 flex flex-col">
      <Bar />
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 pb-32">
          <div className="flex flex-col lg:flex-row gap-8 w-full">

            {/* Left column */}
            <div className="flex flex-col gap-6 flex-1">
            <h2 className="text-2xl font-bold text-white">Welcome, {user?.fullName ?? user?.username ?? "Player"}!</h2>
            <p className="text-gray-300">Choose an option below to get started.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg mt-4">
              <button
                onClick={() => navigate("/AiChallange")}
                className="flex flex-col items-center gap-3 p-8 rounded-xl bg-slate-800 border border-blue-700 hover:border-amber-500 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <span className="text-4xl"><PiGameControllerFill /></span>
                <span className="text-amber-500 text-xl font-semibold">AiChallange</span>
                <span className="text-gray-400 text-sm">Find players and start a match</span>
              </button>
              <button
                onClick={() => setOpenPop(true)}
                className="flex flex-col items-center gap-3 p-8 rounded-xl bg-slate-800 border border-blue-700 hover:border-amber-500 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <span className="text-4xl"><TbTournament /></span>
                <span className="text-amber-500 text-xl font-semibold">Create Tournament</span>
                <span className="text-gray-400 text-sm">Create Tournmanet</span>
              </button>
            </div>
            {/* <div className="grid grid-cols-1 gap-6"> */}
              <PlayerList />
              <TournamentList />
            {/* </div> */}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6 w-full max-w-xl">
            <PlayerState userId={user?.id ?? ""} />
            <Leaderboard />
            </div>

          </div>
      </main>

      <BottomNav />
      <CreateTourn
        isOpen={opnePop}
        onClose={() => setOpenPop(false)}
        onCreate={(name, maxPlayers) => {
          socket.emit("create-tournament", {
            name,
            userId: user?.id,
            username: user?.username ?? user?.fullName ?? "Player",
            maxPlayers,
          });
        }}
      />
    </div>
  );
}