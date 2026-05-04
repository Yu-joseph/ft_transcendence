import { useEffect, useState } from 'react'

type LeaderboardPlayer = {
  id: string
  username: string
  wins: number
  losses: number
  xp: number
  rank: number
}

type LeaderboardProps = {
  previewData?: LeaderboardPlayer[]
}

export default function Leaderboard({ previewData }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>(previewData ?? [])
  const [loading, setLoading] = useState(!previewData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isStillOnScreen = true

    if (previewData) {
      setLeaderboard(previewData)
      setLoading(false)
      setError(null)
      return () => {
        isStillOnScreen = false
      }
    }

    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/game-api/api/leaderboard")
        if (!response.ok) 
            throw new Error(`Failed to load leaderboard (${response.status})`)
        const data = (await response.json()) as LeaderboardPlayer[]
        if (isStillOnScreen)
          setLeaderboard(data)
      } 
    catch {
        if (isStillOnScreen) 
            setError('Could not load leaderboard. Please try again.')
      } 
    finally {
        if (isStillOnScreen) 
            setLoading(false)
      }
    }

    fetchLeaderboard()
    return () => { isStillOnScreen = false }
  }, [previewData])

  return (
    <section className="w-full bg-slate-800 border border-black rounded-b-sm shadow-lg overflow-hidden h-fit hover:border-amber-500 hover:scale-102 transition-all duration-300">
      <div className="px-6 py-4 border-b border-black">
        <h3 className="text-xl font-semibold text-amber-500">Leaderboard</h3>
        <p className="text-sm text-gray-400">Top players ranked by the backend</p>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-gray-300">Loading leaderboard...</div>
      ) : error ? (
        <div className="px-6 py-8 text-red-300">{error}</div>
      ) : leaderboard.length === 0 ? (
        <div className="px-6 py-8 text-gray-300">No players on the leaderboard yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Rank</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Player</th>
                <th className="px-8 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">XP</th>
                <th className="px-8 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Wins</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Losses</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player) => (
                <tr key={player.id} className="border-t border-slate-700/70 hover:bg-slate-700/40">
                  <td className="px-6 py-3 text-white font-medium">#{player.rank}</td>
                  <td className="px-6 py-3 text-white">{player.username}</td>
                  <td className="px-10 py-3 text-cyan-300 font-semibold">{player.xp}</td>
                  <td className="px-10 py-3 text-emerald-300 font-semibold">{player.wins}</td>
                  <td className="px-10 py-3 text-rose-300">{player.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}