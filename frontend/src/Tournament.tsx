import Bar from './components/Bar'
import BottomNav from './components/BottomNav'
import PlayerList from './components/PlayerList'
import TournamentList from './components/TournamentList'

function Tournament() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 flex flex-col">
      <Bar />
      <div className="flex flex-row gap-8 pt-12 px-12">
        <div className="flex-10">
          <TournamentList />
          <div className="flex flex-col items-center gap-4 py-8">
            <h1 className="text-2xl font-bold text-amber-500 tracking-wide">Create a Tournament</h1>
            <p className="text-gray-400 text-sm">Start a new bracket and invite players</p>
            <button className="px-8 py-3 text-lg rounded-xl bg-linear-to-br from-amber-600 to-cyan-600 text-white hover:from-indigo-600 active:scale-120 transition-all">
              + Create Tournament
            </button>
          </div>
        </div>
        <div className="w-100">
          <PlayerList />
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export default Tournament