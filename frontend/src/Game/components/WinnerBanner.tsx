import { GiPodiumWinner } from 'react-icons/gi'
import type { Player } from '../Tournament'

type WinnerBannerProps = {
  winner: Player
}

export default function WinnerBanner({ winner }: WinnerBannerProps) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
      <span className="text-3xl"><GiPodiumWinner /></span>
      {winner.avatar && (
        <img
          src={winner.avatar}
          alt={winner.username}
          className="h-10 w-10 rounded-full object-cover border border-amber-400/60"
        />
      )}
      <div>
        <span className="text-xl font-bold text-amber-400">{winner.username} wins!</span>
        <p className="text-sm text-gray-400 mt-1">Redirecting to Dashboard…</p>
      </div>
    </div>
  )
}
