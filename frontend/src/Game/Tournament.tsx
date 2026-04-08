import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Bar from '../components/Bar'
import BottomNav from '../components/BottomNav'
import TournamentLoadingPage from '../components/TournamentLoadingPage'
import { gameSocket } from '../socket/sock'
import { GiPodiumWinner } from "react-icons/gi";
import { useAuth } from '../auth/useAuth'


interface Player {
  id: string
  username: string
  socketId: string
  isReady: boolean
}

interface TournamentMatch {
  roundNumber: number
  matchIndex: number
  matchId: string | null
  player1: Player | null
  player2: Player | null
  winnerId: string | null
  status: 'pending' | 'ready' | 'playing' | 'finished'
  requestedBy: string | null
}

interface TournamentState {
  id: string
  name: string
  creatorId: string
  status: 'waiting' | 'in-progress' | 'finished'
  currentRound: number
  bracket: TournamentMatch[]
  players: Player[]
  winner: string | null
}

function MatchCard({ match, userId, onPlay,}: { match: TournamentMatch ; userId: string ;onPlay: () => void }) 
{
  const isInMatch = match.player1?.id === userId || match.player2?.id === userId
  const canPlay = match.status === 'ready' && isInMatch
  const hasRequested = match.requestedBy === userId

  const p1Name = match.player1?.username ?? 'plyaer1'
  const p2Name = match.player2?.username ?? 'player2'
/// ststaus to css class to set color for each status
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
        <span
          className={`text-sm font-semibold truncate ${
            match.winnerId === match.player1?.id ? 'text-amber-400' : 'text-white'
          }`}
        >
          {p1Name}
        </span>
        <div className="border-t border-slate-600/60" />
        <span
          className={`text-sm font-semibold truncate ${
            match.winnerId === match.player2?.id ? 'text-amber-400' : 'text-white'
          }`}
        >
          {p2Name}
        </span>
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

function Bracket({ tournament, userId, }: {tournament: TournamentState ;userId: string }) 
{
  const rounds = Array.from(new Set(tournament.bracket.map(m => m.roundNumber))).sort((a, b) => a - b,)
  const totalRounds = rounds.length;

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

function Tournament() 
{
  const { user: authUser } = useAuth()
  const currentUserId = authUser?.id ?? ''
  const navigate = useNavigate()
  const location = useLocation()
  const joinInfo = useMemo(() => {
    const navState = location.state as { tournamentId?: string; username?: string } | null
    if (navState?.tournamentId) {
      return navState
    }

    const stored = sessionStorage.getItem('activeTournament')
    if (!stored) {
      return null
    }

    try {
      return JSON.parse(stored) as { tournamentId?: string; username?: string }
    } catch {
      sessionStorage.removeItem('activeTournament')
      return null
    }
  }, [location.state])
  const shouldJoinTournament = Boolean(joinInfo?.tournamentId)
  const persistedUsername = authUser?.username ?? joinInfo?.username ?? 'Player'

  const persistActiveTournament = useCallback((tournamentId: string) => {
    sessionStorage.setItem('activeTournament', JSON.stringify({
      tournamentId,
      username: persistedUsername,
    }))
  }, [persistedUsername])
  //location hold the cuurent react location
  const [activeTournament, setActiveTournament] = useState<TournamentState | null>(null)
  const [loading, setLoading] = useState(shouldJoinTournament)
  const [showWinnerScreen, setShowWinnerScreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!gameSocket.connected) 
      gameSocket.connect()

    
    const onUpdate = (data: TournamentState) => {
      setActiveTournament(data)
      setLoading(false)

      if (data.status !== 'finished') {
        persistActiveTournament(data.id)
      }

      if (data.status === 'finished') {
        sessionStorage.removeItem('activeTournament')
        if (data.winner === currentUserId) {
          setShowWinnerScreen(true)
          redirectTimeoutRef.current = setTimeout(() => navigate('/Dashboard'), 4000)
        } else {
          navigate('/Dashboard', { replace: true })
        }
      }
    }

    const onCreated = (data: { tournamentId: string; tournament: TournamentState }) => {
      setActiveTournament(data.tournament)
      persistActiveTournament(data.tournament.id)
      setLoading(false)
    }

    const onMatchFound = (data: {
      matchId: string
      match: { id: string; players: Player[]; board: (string | null)[]; currentTurn: string | null; status: string; winner: string | null }
      symbol: string
    }) => {
      const stored = sessionStorage.getItem('activeTournament')
      const tournamentId = stored ? (JSON.parse(stored) as { tournamentId?: string }).tournamentId : null
      navigate(`/game/${data.matchId}`, { state: { symbol: data.symbol, match: data.match, tournamentId } })
    }

    const onError = (data: { message: string }) => {
      setError(data.message)
      setTimeout(() => setError(null), 3500)
    }

    gameSocket.on('tournament-update', onUpdate)
    gameSocket.on('tournament-created', onCreated)
    gameSocket.on('match-found', onMatchFound)
    gameSocket.on('tournament-error', onError)

    // Re-emit join so the server resends tournament-update after page reload
    // location.state is used on normal navigation; sessionStorage survives refresh
    if (joinInfo?.tournamentId) {
      gameSocket.emit('join-tournament', {
        tournamentId: joinInfo.tournamentId,
        username: persistedUsername,
      })
    }

    
    
    //waitig for server to rspond and waiting in leading page
    const timeout = shouldJoinTournament
      ? setTimeout(() => setLoading(false), 5000)
      : null

    return () => {
      gameSocket.off('tournament-update', onUpdate)
      gameSocket.off('tournament-created', onCreated)
      gameSocket.off('match-found', onMatchFound)
      gameSocket.off('tournament-error', onError)
      if (timeout) clearTimeout(timeout)
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current)
    }
  }, [navigate, currentUserId, joinInfo, shouldJoinTournament, persistedUsername, persistActiveTournament])

  const handleStart = () => {
    if (!activeTournament) 
      return
    gameSocket.emit('start-tournament', { tournamentId: activeTournament.id })
  }

  const handleLeaveTournament = () => {
    if (!activeTournament || activeTournament.status !== 'waiting') {
      return
    }

    gameSocket.emit('leave-tournament', { tournamentId: activeTournament.id })
    sessionStorage.removeItem('activeTournament')
    setActiveTournament(null)
    navigate('/Dashboard')
  }

  const isCreator = activeTournament?.creatorId === currentUserId
  const winnerPlayer = activeTournament?.winner
    ? activeTournament.players.find(p => p.id === activeTournament.winner)
    : null

  if (showWinnerScreen) {
    return <TournamentLoadingPage loading={false} onBack={() => navigate('/Dashboard')} />
  }

  // Waiting for server to send tournament state
  if (!activeTournament) {
    if (!loading) {
      return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 flex flex-col">
          <Bar />
          <main className="flex-1 px-6 pt-32 py-8 pb-28 max-w-3xl mx-auto w-full flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-blue-700 bg-slate-800/80 p-6 text-center shadow-lg">
              <h2 className="text-xl font-semibold text-amber-400 mb-2">No tournament yet</h2>
              <p className="text-sm text-gray-300 mb-5">Invite friends or join one from Dashboard to start playing.</p>
              <button
                onClick={() => navigate('/Dashboard')}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition"
              >
                Go to Dashboard
              </button>
            </div>
          </main>
          <BottomNav />
        </div>
      )
    }
    return <TournamentLoadingPage loading={loading} onBack={() => navigate('/Dashboard')} />
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 flex flex-col">
      <Bar />
      <main className="flex-1 px-6 pt-32 py-8 pb-28 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-amber-500">{activeTournament.name}</h1>
            <p className="text-sm text-gray-400">
              {activeTournament.players.length} players ·{' '}
              <span className="capitalize">{activeTournament.status}</span>
              {activeTournament.status === 'in-progress' &&
                ` · Round ${activeTournament.currentRound}`}
            </p>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem('activeTournament'); setActiveTournament(null); navigate('/Dashboard'); }}
            className="text-sm px-4 py-2 rounded-xl border border-slate-600 text-gray-300 hover:bg-slate-700 transition"
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-900/40 border border-red-500 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Waiting lobby */}
        {activeTournament.status === 'waiting' && (
          <div className="bg-slate-800 border border-blue-700 rounded-xl p-6 max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">Waiting for players…</h2>
            <ul className="space-y-2 mb-6">
              {activeTournament.players.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 text-white">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-800 text-xs font-bold text-amber-400">
                    {i + 1}
                  </span>
                  {p.username}
                  {p.id === activeTournament.creatorId && (
                    <span className="text-xs text-amber-500 ml-1">(host)</span>
                  )}
                </li>
              ))}
            </ul>
            {isCreator ? (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleStart}
                  disabled={activeTournament.players.length < 3}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold disabled:opacity-40 transition"
                >
                  Start Tournament
                </button>
                <button
                  onClick={handleLeaveTournament}
                  className="px-6 py-2 rounded-xl border border-red-500 text-red-300 hover:bg-red-900/30 transition"
                >
                  Leave Tournament
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-gray-400 text-sm">Waiting for the host to start…</p>
                <button
                  onClick={handleLeaveTournament}
                  className="px-4 py-2 rounded-xl border border-red-500 text-red-300 text-sm font-medium hover:bg-red-900/30 transition"
                >
                  Leave Tournament
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bracket */}
        {(activeTournament.status === 'in-progress' || activeTournament.status === 'finished') && (
          <div className="bg-slate-800 border border-blue-700 rounded-xl p-6">
            {activeTournament.status === 'finished' && winnerPlayer && (
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
                <span className="text-3xl"><GiPodiumWinner /></span>
                <div>
                  <span className="text-xl font-bold text-amber-400">{winnerPlayer.username} wins!</span>
                  <p className="text-sm text-gray-400 mt-1">Redirecting to Dashboard…</p>
                </div>
              </div>
            )}
            <h2 className="text-lg font-semibold text-white mb-5">Bracket</h2>
            <Bracket tournament={activeTournament} userId={currentUserId} />
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}

export default Tournament