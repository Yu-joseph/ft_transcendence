import Bar from './Bar'
import BottomNav from './BottomNav'

interface TournamentLoadingPageProps {
  loading: boolean
  onBack: () => void
}

function TournamentLoadingPage({ loading, onBack }: TournamentLoadingPageProps) {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 flex flex-col">
      <Bar />
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {loading ? (
          <>
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Joining tournament…</p>
          </>
        ) : (
          <>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
            <p className="text-gray-400">You won the tournament.</p>
=======
            <p className="text-gray-400">No active tournament.</p>
>>>>>>> 7df0ecb (verfiying files)
=======
            <p className="text-gray-400">You have won  the Tournamnet.</p>
>>>>>>> 3bf2605 ( fixing amount of player for each tournamnet)
=======
            <p className="text-gray-400">You won the tournament.</p>
>>>>>>> 8dd1c5b (fixing tournament cancel match)
            <button
              onClick={onBack}
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition"
            >
<<<<<<< HEAD
<<<<<<< HEAD
              Back to Dashboard
=======
              ← Back to Dashboard
>>>>>>> 7df0ecb (verfiying files)
=======
              Back to Dashboard
>>>>>>> 3bf2605 ( fixing amount of player for each tournamnet)
            </button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

export default TournamentLoadingPage
