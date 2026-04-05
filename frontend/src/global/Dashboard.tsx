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
import { socket } from "../Game/socket/sock";
import { useAuth } from "../auth/useAuth";




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
          userId: user.id,
          username: user.username ?? user.fullName ?? 'Player',
        }));
      }
      navigate("/Tournament");
    };
    //listen for coming event or {register listner for socket}
    socket.on("tournament-created", onTournamentCreated);
    return () => {
      //removes that listener during cleanup.
      socket.off("tournament-created", onTournamentCreated);
    };
  }, [navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 flex items-center justify-center px-4">
        <p className="text-white text-lg">Loading session...</p>
      </div>
    );
  }

  if (!user) {
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
              <h2 className="text-2xl font-bold text-white">Welcome, {user?.username ?? "Player"}!</h2>
              <p className="text-gray-300">Choose an option below to get started.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg mt-4">
                <button onClick={() => navigate("/AiChallange")} className="flex flex-col items-center gap-3 p-8 rounded-xl bg-slate-800 border border-blue-700 hover:border-amber-500 hover:scale-105 transition-all duration-300 shadow-lg">
                  <span className="text-4xl"><PiGameControllerFill /></span>
                  <span className="text-amber-500 text-xl font-semibold">AiChallange</span>
                  <span className="text-gray-400 text-sm">Find players and start a match</span>
                </button>
                <button onClick={() => setOpenPop(true)} className="flex flex-col items-center gap-3 p-8 rounded-xl bg-slate-800 border border-blue-700 hover:border-amber-500 hover:scale-105 transition-all duration-300 shadow-lg">
                  <span className="text-4xl"><TbTournament /></span>
                  <span className="text-amber-500 text-xl font-semibold">Create Tournament</span>
                  <span className="text-gray-400 text-sm">Create Tournmanet</span>
                </button>
              </div>
              
              {/* PlayerList now uses global auth context */}
              <PlayerList />
              <TournamentList />
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