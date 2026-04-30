import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import PlayerList from "../components/PlayerList";
import PlayerState from "../components/PlayerState";
import TournamentList from "../components/TournamentList";
import Leaderboard from "../components/Leaderboard";
import MyTournamentsTable from "../components/MyTournamentsTable";
// import { SiEpicgames } from "react-icons/si";
import { PiGameControllerFill } from "react-icons/pi";
import { TbTournament } from "react-icons/tb";
// import { GiTicTacToe } from "react-icons/gi";
import Bar from '../components/Bar'
import CreateTourn from "../components/CreateTourn";
import { gameSocket } from "../socket/sock";
import { useAuth } from "../auth/useAuth";
import UserMatchHistory from "../components/MatchHistory";




export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [opnePop, setOpenPop] = useState<boolean>(false);

  useEffect(() => {
        //create a callback function and stores it in variable
    const onTournamentCreated = (data: { tournamentId: string; tournament: { name: string; creatorId: string } }) => {
      if (user) {
        sessionStorage.setItem('activeTournament', JSON.stringify({
          tournamentId: data.tournamentId,
          // userId: user.id,
          username: user.username ?? user.fullName ?? 'Player',
        }));
      }
      navigate("/Tournament");
    };
    gameSocket.on("tournament-created", onTournamentCreated);
    return () => {
      gameSocket.off("tournament-created", onTournamentCreated);
    };
  }, [navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <p className="text-white text-lg">Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white text-xl mb-4">You need to sign in to continue.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 text-lg font-semibold rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white hover:scale-105 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-950 flex flex-col">
      <Bar />
      {/* Main Content */}
      <main className="flex-1 w-full max-w-none pl-4 pr-4 pt-8 pb-32 sm:pl-5 sm:pr-6 lg:pl-6 lg:pr-8">
          <div className="grid grid-cols-1 gap-8 w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">

            {/* Left column */}
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold text-white">
                Welcome, <span className="text-amber-500">{user?.username ?? "Player"}</span>!
              </h2>
              <p className="text-gray-300">Challenge players live, dominate tournaments, and become the champion.</p>
              <div className="grid md:grid-cols-1 lg:grid-cols-2 sm:grid-cols-2 gap-6 w-full mt-4">
                <button onClick={() => navigate("/AiChallange")} className="flex flex-col items-center gap-3 p-8 rounded-b-4xl bg-slate-800 border border-black hover:border-amber-500 hover:scale-102 transition-all duration-300 shadow-lg">
                  <span className="text-4xl"><PiGameControllerFill /></span>
                  <span className="text-amber-500 text-xl font-semibold">AiChallange</span>
                  <span className="text-gray-400 text-sm">Find players and start a match</span>
                </button>
                <button onClick={() => setOpenPop(true)} className="flex flex-col items-center gap-3 p-8 rounded-b-4xl bg-slate-800 border border-black hover:border-amber-500 hover:scale-102 transition-all duration-300 shadow-lg">
                  <span className="text-4xl"><TbTournament /></span>
                  <span className="text-amber-500 text-xl font-semibold">Create Tournament</span>
                  <span className="text-gray-400 text-sm">Create Tournmanet</span>
                </button>
              </div>
              <PlayerList />
              <TournamentList />
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              <PlayerState />
              <MyTournamentsTable />
            </div>

            <div className="flex flex-col gap-6">
              <Leaderboard />
              <UserMatchHistory limit={8} />
            </div>


          </div>
      </main>

      <BottomNav />
      <CreateTourn
        isOpen={opnePop}
        onClose={() => setOpenPop(false)}
        onCreate={(name, maxPlayers) => {
          gameSocket.emit("create-tournament", {
            name,
            // userId: user?.id,
            username: user?.username ?? user?.fullName ?? "Player",
            maxPlayers,
          });
        }}
      />
    </div>
  );
}