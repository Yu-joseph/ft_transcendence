import { gameSocket } from '../../socket/sock'
import type { TournamentMatch, TournamentState } from '../Tournament'
import MatchCard from './MatchCard'

type BracketProps = {
  tournament: TournamentState
  userId: string
}

export default function Bracket({ tournament, userId }: BracketProps) {
  const rounds = Array.from(new Set(tournament.bracket.map(m => m.roundNumber))).sort((a, b) => a - b)
  const totalRounds = rounds.length

  const handlePlay = (match: TournamentMatch) => {
    gameSocket.emit('request-tournament-match', {
      tournamentId: tournament.id,
      roundNumber: match.roundNumber,
      matchIndex: match.matchIndex,
    })
  }

  const roundLabel = (r: number) =>
    r === totalRounds ? 'Final' : r === totalRounds - 1 ? 'Semi-Final' : `Round ${r}`

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-10 min-w-fit py-2">
        {rounds.map(round => {
          const roundMatches = tournament.bracket
            .filter(m => m.roundNumber === round)
            .sort((a, b) => a.matchIndex - b.matchIndex)
          const isCurrent = round === tournament.currentRound

          return (
            <div key={round} className="flex flex-col items-center gap-4">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  isCurrent ? 'bg-amber-500 text-white' : 'bg-slate-700 text-gray-400'
                }`}
              >
                {roundLabel(round)}
              </span>
              <div className="flex flex-col gap-6">
                {roundMatches.map(match => (
                  <MatchCard
                    key={`${match.roundNumber}-${match.matchIndex}`}
                    match={match}
                    userId={userId}
                    onPlay={() => handlePlay(match)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
