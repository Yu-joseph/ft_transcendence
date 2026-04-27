import type { Player } from '../Tournament'

type WaitingLobbyProps = {
  players: Player[]
  creatorId: string
  isCreator: boolean
  canStart: boolean
  onStart: () => void
  onLeave: () => void
}

export default function WaitingLobby({
  players,
  creatorId,
  isCreator,
  canStart,
  onStart,
  onLeave,
}: WaitingLobbyProps) {
  return (
    <div className="bg-slate-800 hover:bg-slate-800/70 border border-blue-700 rounded-xl p-6 max-w-md">
      <h2 className="text-lg font-semibold text-white mb-4">Waiting for players…</h2>
      <ul className="space-y-2 mb-6">
        {players.map((p, i) => (
          <li key={p.id} className="flex items-center gap-3 text-white">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-800 text-xs font-bold text-amber-400">
              {i + 1}
            </span>
            {p.avatar && (
              <img
                src={p.avatar}
                alt={p.username}
                className="h-7 w-7 rounded-full object-cover border border-amber-400/60"
              />
            )}
            <span className="truncate">{p.username}</span>
            {p.id === creatorId && (
              <span className="text-xs text-amber-500 ml-1">(host)</span>
            )}
          </li>
        ))}
      </ul>
      {isCreator ? (
        <div className="flex lg:flex-row md:flex-row flex-col gap-3">
          <button
            onClick={onStart}
            disabled={!canStart}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold disabled:opacity-40 transition"
          >
            Start Tournament
          </button>
          <button
            onClick={onLeave}
            className="px-6 py-2 rounded-xl border border-red-500 text-red-300 hover:bg-red-900/30 transition"
          >
            Leave Tournament
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-gray-400 text-sm">Waiting for the host to start…</p>
          <button
            onClick={onLeave}
            className="px-4 py-2 rounded-xl border border-red-500 text-red-300 text-sm font-medium hover:bg-red-900/30 transition"
          >
            Leave Tournament
          </button>
        </div>
      )}
    </div>
  )
}
