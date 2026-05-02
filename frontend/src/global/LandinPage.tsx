import {  useNavigate, Navigate } from "react-router-dom";
import Leaderboard from "../components/Leaderboard";
import PlayerState from "../components/PlayerState";
import { useAuth } from "../auth/useAuth";
// import xoBackground from "../Devolopers/xo.jpg";
import bouhammoImage from "../Devolopers/bouhammo.jpg";
import ismailImage from "../Devolopers/eismail_red.jpg";
import maitTajImage from "../Devolopers/mait-taj.jpg";
import sahamZaoImage from "../Devolopers/sahamzao.jpg";
import youssefiImage from "../Devolopers/ysouhail.jpg";


function LandinPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const previewStats = {
    id: "preview-player",
    username: "ArenaPilot",
    wins: 42,
    losses: 18,
    xp: 1560,
    rank: 7,
    tournamentWins: 5,
  };


  const previewLeaderboard = [
    { id: "p1", username: "youssef", wins: 48, losses: 12, xp: 2200, rank: 1 },
    { id: "p2", username: "ismail", wins: 44, losses: 17, xp: 2015, rank: 2 },
    { id: "p3", username: "djangoo", wins: 39, losses: 20, xp: 1880, rank: 3 },
    { id: "p4", username: "xpinzar", wins: 35, losses: 24, xp: 1710, rank: 4 },
    { id: "p5", username: "Mirchal", wins: 33, losses: 26, xp: 1620, rank: 5 },
  ];

  const previewBoard: ("X" | "O" | null)[] = [
    "X",
    null,
    "O",
    null,
    "X",
    "O",
    "O",
    null,
    "X",
  ];

  const developers = [
    { id: "dev-1", name: "Brahim", image: bouhammoImage },
    { id: "dev-2", name: "ismail", image: ismailImage },
    { id: "dev-3", name: "Mouhamed", image: maitTajImage },
    { id: "dev-4", name: "sayf aldin", image: sahamZaoImage },
    { id: "dev-5", name: "Youssef", image: youssefiImage },
  ];


  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
  //       <p className="text-white text-lg">Loading session...</p>
  //     </div>
  //   );
  // }

  if (user) {
    return <Navigate to="/Dashboard" replace />;
  }

  return (
    <div className="landing-root min-h-screen bg-slate-900 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="text-center sm:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Tic-TAC-toe Areana</p>
          <h1 className="text-xl font-semibold text-white">AI play, live chat, ranked battles</h1>
        </div>
        <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-300 sm:w-auto"
          >
            join Platform
          </button>
        </div>
      </div>

      <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr_minmax(0,0.9fr)]">
          <div className="flex flex-col gap-6">
            <PlayerState previewStats={previewStats} />
          </div>
          <div className="flex flex-col gap-6">
            <Leaderboard previewData={previewLeaderboard} />
          </div>
          <div className="flex flex-col gap-6">
            <section className="w-full bg-slate-800 border border-slate-900 rounded-b-md shadow-lg overflow-hidden h-full flex flex-col hover:border-amber-500 hover:-translate-y-0.5 transition-all duration-300">
              <div className="px-6 py-4 border-b border-amber-500">
                <h3 className="text-xl font-semibold text-amber-500">Match preview</h3>
                <p className="text-sm text-white">Small board from a live match</p>
              </div>
              <div className="px-6 py-6 flex-1 flex items-center justify-center">
                <div className="w-full max-w-65 aspect-square grid grid-cols-3 gap-2">
                  {previewBoard.map((cell, index) => {
                    const cellColor =
                      cell === "X" ? "bg-rose-700" :
                      cell === "O" ? "bg-cyan-800" :
                      "bg-slate-900";

                    return (
                      <div
                        key={`preview-cell-${index}`}
                        className={`aspect-square rounded-md flex items-center justify-center text-xl sm:text-2xl font-bold text-white ${cellColor}`}
                      >
                        {cell ?? ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </section>
        <section className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-500">
              AI tactics + live chat
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Special tic-tac-toe battles powered by Creativity and real-time chat.
            </h2>
            <p className="mt-2 text-sm text-white sm:text-base">
              I bet that you can't defeted our (hard) AI challange.
            </p>
            <div className="mt-6 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-500">How to Play</p>
              <h3 className="mt-2 text-lg font-semibold text-white">How to Play OUR Tic Tac Toe Online</h3>
              <ul className="mt-3 space-y-2 text-sm text-white">
                <li>Each player can have only 3 pieces on the board at a time.</li>
                <li>On your turn, place a piece on an empty squa diagonal.</li>
              </ul>
            </div>
          </div>
        </section>
        <section className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-500">
            Developers
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            Meet the team behind the arena
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 justify-items-center sm:grid-cols-3 lg:grid-cols-5">
            {developers.map((developer) => (
              <div
                key={developer.id}
                className="flex flex-col items-center gap-2"
              >
                <div className="group relative flex h-28 w-28 items-end justify-center overflow-hidden rounded-full border border-slate-800 bg-slate-900/40 sm:h-32 sm:w-32">
                  <img
                    src={developer.image}
                    alt={developer.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="text-[0.7rem] font-semibold tracking-wide text-white">{developer.name}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-white sm:flex-row sm:items-center">
          <p>TIC-TAC-TOE AREANA (c) 2026</p>
          <div className="flex gap-4">
              <a href="/privacy" className="transition hover:text-white">
              Privacy Policy
              </a>
              <a href="/terms" className="transition hover:text-white">
              Terms of Service
              </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandinPage;
