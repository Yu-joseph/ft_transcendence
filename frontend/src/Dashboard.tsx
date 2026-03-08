import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import BottomNav from "./components/BottomNav";
import PlayerList from "./components/PlayerList";
import PlayerState from "./components/PlayerState";
import TournamentList from "./components/TournamentList";
// import { SiEpicgames } from "react-icons/si";
import { PiGameControllerFill } from "react-icons/pi";
import { TbTournament } from "react-icons/tb";
// import { GiTicTacToe } from "react-icons/gi";
import Bar from './components/Bar'
import CreateTourn from "./components/CreateTourn";
import { socket } from "./socket/sock";




type LeaderboardPlayer = {
  id: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [opnePop, setOpenPop] = useState<boolean>(false);


  const apiServerUrl = "http://localhost:3000";

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      try {
        setLeaderboardLoading(true);
        setLeaderboardError(null);
        //wait for fetch to send the http request and return a promise 
        const response = await fetch(`${apiServerUrl}/api/leaderboard`);
        if (!response.ok) {
          throw new Error(`Failed to load leaderboard (${response.status})`);
        }
//wait for promise to finish  for datA to be parsed for leaderboard
        const data = (await response.json()) as LeaderboardPlayer[];
        if (isMounted) {
          setLeaderboard(data);
        }
      } catch {
        if (isMounted) {
          setLeaderboardError("Could not load leaderboard. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLeaderboardLoading(false);
        }
      }
    };

    fetchLeaderboard();
    //
    return () => {
      isMounted = false;
    };
  }, [apiServerUrl]);

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

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 flex flex-col">
      <Bar />
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 pb-32">
        <SignedOut>
          <div className="flex items-center justify-center h-full">
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
        </SignedOut>

        <SignedIn>
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
                <span className="text-amber-500 text-xl font-semibold">Tournament</span>
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
            <section className="w-full bg-slate-800 border border-blue-700 rounded-xl shadow-lg overflow-hidden h-fit">
              <div className="px-6 py-4 border-b border-blue-800">
                <h3 className="text-xl font-semibold text-amber-500">Leaderboard</h3>
                <p className="text-sm text-gray-400">Top players by wins</p>
              </div>

              {leaderboardLoading ? (
                <div className="px-6 py-8 text-gray-300">Loading leaderboard...</div>
              ) : leaderboardError ? (
                <div className="px-6 py-8 text-red-300">{leaderboardError}</div>
              ) : leaderboard.length === 0 ? (
                <div className="px-6 py-8 text-gray-300">No players on the leaderboard yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900">
                      <tr>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Rank</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Player</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Wins</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Losses</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Draws</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((player, index) => (
                        <tr key={player.id} className="border-t border-slate-700/70 hover:bg-slate-700/40">
                          <td className="px-6 py-3 text-white font-medium">#{index + 1}</td>
                          <td className="px-6 py-3 text-white">{player.username}</td>
                          <td className="px-6 py-3 text-emerald-300 font-semibold">{player.wins}</td>
                          <td className="px-6 py-3 text-rose-300">{player.losses}</td>
                          <td className="px-6 py-3 text-sky-300">{player.draws}</td>
                        </tr>
                        //  </tr> It represents a single cell in a table row (<tr>).
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            </div>

          </div>
        </SignedIn>
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