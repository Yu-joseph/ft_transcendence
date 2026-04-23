import { useNavigate } from "react-router-dom";
import Leaderboard from "../components/Leaderboard";
import PlayerState from "../components/PlayerState";

function LandinPage() {
  const navigate = useNavigate();

  const previewStats = {
    id: "preview-player",
    username: "ArenaPilot",
    wins: 42,
    losses: 18,
    xp: 1560,
    rank: 7,
  };


  const previewLeaderboard = [
    { id: "p1", username: "youssef", wins: 48, losses: 12, xp: 2200, rank: 1 },
    { id: "p2", username: "ismail", wins: 44, losses: 17, xp: 2015, rank: 2 },
    { id: "p3", username: "djangoo", wins: 39, losses: 20, xp: 1880, rank: 3 },
    { id: "p4", username: "xpinzar", wins: 35, losses: 24, xp: 1710, rank: 4 },
    { id: "p5", username: "Mirchal", wins: 33, losses: 26, xp: 1620, rank: 5 },
  ];

  return (
    <div className="landing-root min-h-screen bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 text-slate-100">
      <style>
        {`
.landing-root {
  --accent-cool: #38bdf8;
  --accent-warm: #f59e0b;
}
        `}
      </style>

      <div
        className="h-1 w-full"
        style={{ background: "linear-gradient(90deg, var(--accent-cool), var(--accent-warm))" }}
      />

      <header className="border-b border-blue-800 bg-slate-900/90">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Infinity Tacos</p>
            <h1 className="text-xl font-semibold text-white">AI play, live chat, ranked battles</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-blue-800 bg-slate-800/60 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/80">
            AI tactics + live chat
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            Special tic-tac-toe battles powered by Creativity  and real-time chat.
          </h2>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Train against adaptive AI, coordinate with friends, and climb ranked tournaments
            without leaving the arena.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { label: "AI modes", value: "Adaptive" },
              { label: "Chat rooms", value: "Live" },
              { label: "Tournaments", value: "Ranked" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-blue-800 bg-slate-800/70 p-4"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-6">
            <PlayerState previewStats={previewStats} />
          </div>
          <div className="flex flex-col gap-6">
            <Leaderboard previewData={previewLeaderboard} />
          </div>
          <div className="flex flex-col gap-6">
            <section className="w-full bg-slate-800 border border-blue-700 rounded-xl shadow-lg overflow-hidden h-fit">
              <div className="px-6 py-4 border-b border-blue-800">
                <h3 className="text-xl font-semibold text-amber-500">AI Challenge</h3>
                <p className="text-sm text-gray-400">A simple training room preview</p>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Opponent</span>
                  <span className="text-white font-semibold">ArenaBot</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Mode</span>
                  <span className="text-cyan-300 font-semibold">Adaptive AI</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Win streak</span>
                  <span className="text-emerald-300 font-semibold">3 wins</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["X", "O", "", "", "X", "", "O", "", ""].map((cell, index) => (
                    <div
                      key={`${cell}-${index}`}
                      className="flex h-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-lg font-semibold text-cyan-300"
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>Infinity Tacos (c) 2026</p>
          <div className="flex gap-4">
              <a href="/privacy" className="transition hover:text-amber-300">
              Privacy Policy
              </a>
              <a href="/terms" className="transition hover:text-amber-300">
              Terms of Service
              </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandinPage;
