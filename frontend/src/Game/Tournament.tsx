import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Bar from '../components/Bar'
import BottomNav from '../components/BottomNav'
import TournamentLoadingPage from '../components/TournamentLoadingPage'
import Bracket from './components/Bracket'
import MatchInviteModal from './components/MatchInviteModal'
import WaitingLobby from './components/WaitingLobby'
import WinnerBanner from './components/WinnerBanner'
import { gameSocket } from '../socket/sock'
import { useAuth } from '../auth/useAuth'


export interface Player {
  id: string
  username: string
  avatar: string | null
  socketId: string
  isReady: boolean
}

export interface TournamentMatch {
  roundNumber: number
  matchIndex: number
  matchId: string | null
  player1: Player | null
  player2: Player | null
  winnerId: string | null
  status: 'pending' | 'ready' | 'playing' | 'finished'
  requestedBy: string | null
}

export interface TournamentState {
  id: string
  name: string
  creatorId: string
  status: 'waiting' | 'in-progress' | 'finished'
  currentRound: number
  bracket: TournamentMatch[]
  players: Player[]
  winner: string | null
}

export interface TournamentMatchInvite {
  tournamentId: string
  roundNumber: number
  matchIndex: number
  opponentName: string
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
  const [pendingMatchInvite, setPendingMatchInvite] = useState<TournamentMatchInvite | null>(null)
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeTournamentIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!gameSocket.connected) 
      gameSocket.connect()

    
    const onUpdate = (data: TournamentState) => {
      activeTournamentIdRef.current = data.id
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
      activeTournamentIdRef.current = data.tournament.id
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
      const message = data.message ?? 'Something went wrong'
      setError(message)
      if (message === 'Tournament not found' || message === 'No active tournament found') {
        sessionStorage.removeItem('activeTournament')
        activeTournamentIdRef.current = null
        setActiveTournament(null)
      }
      setTimeout(() => setError(null), 3500)
    }

    const onCancelled = (data: { tournamentId: string; reason?: string }) => {
      if (activeTournamentIdRef.current && data.tournamentId !== activeTournamentIdRef.current) {
        return
      }
      sessionStorage.removeItem('activeTournament')
      activeTournamentIdRef.current = null
      setActiveTournament(null)
      setLoading(false)
      navigate('/Dashboard', { replace: true })
    }

    const onMatchInvite = (data: TournamentMatchInvite) => {
      if (activeTournamentIdRef.current && data.tournamentId !== activeTournamentIdRef.current) {
        return
      }
      setPendingMatchInvite(data)
    }

    gameSocket.on('tournament-update', onUpdate)
    gameSocket.on('tournament-created', onCreated)
    gameSocket.on('match-found', onMatchFound)
    gameSocket.on('tournament-error', onError)
    gameSocket.on('tournament-cancelled', onCancelled)
    gameSocket.on('tournament-match-confirm', onMatchInvite)

    // Re-emit join so the server resends tournament-update after page reload
    // location.state is used on normal navigation; sessionStorage survives refresh
    if (joinInfo?.tournamentId) {
      gameSocket.emit('join-tournament', {
        tournamentId: joinInfo.tournamentId,
        username: persistedUsername,
      })
    } else if (currentUserId) {
      gameSocket.emit('reconnect-tournament', {})
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
      gameSocket.off('tournament-cancelled', onCancelled)
      gameSocket.off('tournament-match-confirm', onMatchInvite)
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

  const handleAcceptMatchInvite = () => {
    if (!pendingMatchInvite) {
      return
    }

    gameSocket.emit('accept-tournament-match', {
      tournamentId: pendingMatchInvite.tournamentId,
      roundNumber: pendingMatchInvite.roundNumber,
      matchIndex: pendingMatchInvite.matchIndex,
    })
    setPendingMatchInvite(null)
  }

  const handleDeclineMatchInvite = () => {
    if (!pendingMatchInvite) {
      return
    }

    gameSocket.emit('decline-tournament-match', {
      tournamentId: pendingMatchInvite.tournamentId,
      roundNumber: pendingMatchInvite.roundNumber,
      matchIndex: pendingMatchInvite.matchIndex,
    })
    setPendingMatchInvite(null)
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
        <div className="min-h-screen bg-slate-900 flex flex-col">
          <Bar />
          <main className="flex-1 px-6 pt-8 py-8 pb-28 max-w-3xl mx-auto w-full flex items-center justify-center">
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
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Bar />
      <main className="flex-1 px-6 pt-8 py-8 pb-28 max-w-4xl mx-auto w-full">
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
            onClick={() => navigate('/Dashboard')}
            className="flex items-center justify-center text-sm px-4 h-10 rounded-xl border border-slate-600 text-gray-300 hover:bg-red-700/40 transition"
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
          <WaitingLobby
            players={activeTournament.players}
            creatorId={activeTournament.creatorId}
            isCreator={isCreator}
            canStart={activeTournament.players.length >= 3}
            onStart={handleStart}
            onLeave={handleLeaveTournament}
          />
        )}

        {/* Bracket */}
        {(activeTournament.status === 'in-progress' || activeTournament.status === 'finished') && (
          <div className="bg-slate-800 border border-blue-700 rounded-xl p-6">
            {activeTournament.status === 'finished' && winnerPlayer && (
              <WinnerBanner winner={winnerPlayer} />
            )}
            <h2 className="text-lg font-semibold text-white mb-5">Bracket</h2>
            <Bracket tournament={activeTournament} userId={currentUserId} />
          </div>
        )}
      </main>
      <BottomNav />
      {pendingMatchInvite && (
        <MatchInviteModal
          opponentName={pendingMatchInvite.opponentName}
          onAccept={handleAcceptMatchInvite}
          onDecline={handleDeclineMatchInvite}
        />
      )}
    </div>
  )
}

export default Tournament