import type { TournamentMatch } from '../Tournament'

type MatchCardProps = {
  match: TournamentMatch
  userId: string
  onPlay: () => void
}

export default function MatchCard({ match, userId, onPlay }: MatchCardProps) {
  const isInMatch = match.player1?.id === userId || match.player2?.id === userId
  const canPlay = match.status === 'ready' && isInMatch
  const hasRequested = match.requestedBy === userId

  const p1Name = match.player1?.username ?? 'plyaer1'
  const p2Name = match.player2?.username ?? 'player2'
  const p1Avatar = match.player1?.avatar ?? null
  const p2Avatar = match.player2?.avatar ?? null

  const cardClass = {
    pending: 'border-slate-600 bg-slate-800/60',
    ready: 'border-amber-500 bg-amber-900/20',
    playing: 'border-cyan-500 bg-cyan-900/20',
    finished: 'border-slate-600 bg-slate-800/40 opacity-70',
  }[match.status]

  const winnerName = match.winnerId
    ? match.player1?.id === match.winnerId
      ? match.player1?.username
      : match.player2?.username
    : null

  return (
    <div className={`rounded-xl border px-4 py-3 w-44 ${cardClass} flex flex-col gap-2 shadow-lg`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {p1Avatar && (
            <img
              src={p1Avatar}
              alt={p1Name}
              className="h-6 w-6 rounded-full object-cover border border-amber-400/60"
            />
          )}
          <span
            className={`text-sm font-semibold truncate ${
              match.winnerId === match.player1?.id ? 'text-amber-400' : 'text-white'
            }`}
          >
            {p1Name}
          </span>
        </div>
        <div className="border-t border-slate-600/60" />
        <div className="flex items-center gap-2">
          {p2Avatar && (
            <img
              src={p2Avatar}
              alt={p2Name}
              className="h-6 w-6 rounded-full object-cover border border-amber-400/60"
            />
          )}
          <span
            className={`text-sm font-semibold truncate ${
              match.winnerId === match.player2?.id ? 'text-amber-400' : 'text-white'
            }`}
          >
            {p2Name}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 capitalize">{match.status}</span>
        {canPlay && (
          <button
            onClick={onPlay}
            disabled={hasRequested}
            className={`text-xs px-3 py-1 rounded-lg font-semibold transition ${
              hasRequested
                ? 'bg-slate-600 text-gray-400 cursor-default'
                : 'bg-amber-500 hover:bg-amber-400 text-white'
            }`}
          >
            {hasRequested ? 'Waiting…' : 'Play'}
          </button>
        )}
        {match.status === 'finished' && winnerName && (
          <span className="text-xs text-amber-400 truncate"> {winnerName}</span>
        )}
      </div>
    </div>
  )
}
