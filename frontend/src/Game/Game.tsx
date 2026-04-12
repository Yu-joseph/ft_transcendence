import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { gameSocket } from "../socket/sock";
// import BottomNav from "../components/BottomNav";
import WinModal from "../components/WinModal";
import { useAuth } from "../auth/useAuth";


type CellValue = "X" | "O" | null;

const TURN_TIMEOUT_MS = 5000;

interface Player {
  id: string;
  username: string;
  socketId: string;
  isReady: boolean;
}

interface Match {
  id: string;
  players: Player[];
  board: (string | null)[];
  currentTurn: string | null;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  winner: string | null;
}

function Game() {
  const { user: authUser } = useAuth();
  const authUserId = authUser?.id;
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const location = useLocation();
  // useLocation to access navigation state (symbol/match/tournament)
  const locationState = location.state as { symbol?: string; match?: Match; tournamentId?: string } | null;
  const tournamentId = locationState?.tournamentId ?? null;
  const initialMatch = locationState?.match;

  const [backTo, setBackTo] = useState(tournamentId ? "/Tournament" : "/Dashboard");
  const [board, setBoard] = useState<CellValue[]>(() =>
    (initialMatch?.board as CellValue[]) ?? Array(9).fill(null)
  );
  const [mySymbol, setMySymbol] = useState<"X" | "O" | null>(
    () => (locationState?.symbol as "X" | "O" | undefined) ?? null
  );
  const [currentTurn, setCurrentTurn] = useState<string | null>(() => initialMatch?.currentTurn ?? null);
  const [winner, setWinner] = useState<string | null>(() => {
    if (!initialMatch?.winner) return null;
    const winnerPlayer = initialMatch.players.find(p => p.id === initialMatch.winner);
    return winnerPlayer?.username ?? initialMatch.winner;
  });
  const [matchStatus, setMatchStatus] = useState<string>(() => initialMatch?.status ?? "waiting");
  const [players, setPlayers] = useState<Player[]>(() => initialMatch?.players ?? []);
  const [pieceToRemove, setPieceToRemove] = useState<number | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [openmentLeaver, setopLeave] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [turnRemainingMs, setTurnRemainingMs] = useState(TURN_TIMEOUT_MS);
  const turnEndsAtRef = useRef<number | null>(null);

  // Derive move count from the current board state
  const getMoveCount = (symbol: "X" | "O"): number => {
    return board.filter(cell => cell === symbol).length;
  };

  // Ensure socket is connected and rejoin match if needed
  useEffect(() => {
    if (!authUserId || !matchId) return;

    if (!gameSocket.connected) {
      gameSocket.connect();
    }

    // If we dont have match state (after refresh), ask server to rejoin
    const handleConnect = () => {
      gameSocket.emit('reconnect-match', {matchId });
    };

    if (gameSocket.connected) {
      handleConnect();
    } else {
      gameSocket.on('connect', handleConnect);
    }

    const handleReconnectFailed = (data: { reason: string }) => {
      console.log('Reconnect failed:', data.reason);
      navigate(backTo);
    };

    gameSocket.on('reconnect-match-failed', handleReconnectFailed);

    return () => {
      gameSocket.off('connect', handleConnect);
      gameSocket.off('reconnect-match-failed', handleReconnectFailed);
    };
  }, [authUserId, backTo, matchId, navigate]);

  // Listen for match updates from server
  useEffect(() => {
    if (!matchId) 
      return;

    const handleMatchUpdate = (match: Match) => {
      console.log("Match update received:", match);
      setBoard(match.board as CellValue[]);
      setCurrentTurn(match.currentTurn);
      setMatchStatus(match.status);
      setPlayers(match.players);
      setPieceToRemove(null); // Reset piece selection on each update

      const isActiveTurn = match.status === "playing" && !match.winner && !!match.currentTurn;
      if (isActiveTurn) {
        turnEndsAtRef.current = Date.now() + TURN_TIMEOUT_MS;
        setTurnRemainingMs(TURN_TIMEOUT_MS);
      } else {
        turnEndsAtRef.current = null;
        setTurnRemainingMs(TURN_TIMEOUT_MS);
      }
      
      if (match.winner) {
        // Find winners username
        const winnerPlayer = match.players.find(p => p.id === match.winner);
        setWinner(winnerPlayer?.username || match.winner);
        setShowWinModal(true);
      } else if (match.status === 'finished' && !match.winner) {
        setWinner("Draw");
      }
    };

    const handleOpponentForfeited = () => {
      setopLeave(true);
      setTimeout(() => navigate(backTo), 4000);
    };

    const handleTournamentFinished = () => {
      // whole tournament is over — always go back to Dashboard, not Tournament page
      sessionStorage.removeItem("activeTournament");
      setBackTo('/Dashboard')
    };

    gameSocket.on("match-update", handleMatchUpdate);
    gameSocket.on("opponent-forfeited", handleOpponentForfeited);
    gameSocket.on("tournament-finished", handleTournamentFinished);

    return () => {
      gameSocket.off("match-update", handleMatchUpdate);
      gameSocket.off("opponent-forfeited", handleOpponentForfeited);
      gameSocket.off("tournament-finished", handleTournamentFinished);
    };
  }, [backTo, matchId, navigate]);

    useEffect(() => {
    if (!matchId) return;

    const handleMatchFound = (data: { matchId: string; match: Match; symbol: string }) => {
      console.log("Match restored:", data.matchId, "Symbol:", data.symbol);
      setMySymbol(data.symbol as "X" | "O");
      setBoard(data.match.board as CellValue[]);
      setCurrentTurn(data.match.currentTurn);
      setMatchStatus(data.match.status);
      setPlayers(data.match.players);

      const isActiveTurn =
        data.match.status === "playing" && !data.match.winner && !!data.match.currentTurn;
      if (isActiveTurn) {
        turnEndsAtRef.current = Date.now() + TURN_TIMEOUT_MS;
        setTurnRemainingMs(TURN_TIMEOUT_MS);
      } else {
        turnEndsAtRef.current = null;
        setTurnRemainingMs(TURN_TIMEOUT_MS);
      }

      if (data.match.winner) {
        const winnerPlayer = data.match.players.find(p => p.id === data.match.winner);
        setWinner(winnerPlayer?.username || data.match.winner);
      }
    };

    gameSocket.on('match-found', handleMatchFound);

    return () => {
      gameSocket.off('match-found', handleMatchFound);
    };
  }, [matchId]);

  // Warn on browser tab close/refresh during active match
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // for popup for leaving this BeforeUnloadEvent typescripts type and it for event object of browser when leaving
      if (matchStatus === "playing" && !winner) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [matchStatus, winner]);

  const handleLeaveAttempt = () => {
    if (matchStatus === "playing" && !winner) {
      setShowLeaveConfirm(true);
    } else {
      navigate(backTo);
    }
  };

  const handleConfirmLeave = () => {
    gameSocket.emit("leave-match", { matchId });
    setShowLeaveConfirm(false);
    navigate(backTo);
  };

  // Determine if it's my turn
  const isMyTurn = authUser && currentTurn === authUser.id;
  const isTurnActive = matchStatus === "playing" && !winner && !!currentTurn;
  const turnSecondsLeft = Math.max(0, Math.ceil(turnRemainingMs / 1000));

  useEffect(() => {
    if (!isTurnActive) {
      turnEndsAtRef.current = null;
      return;
    }

    if (!turnEndsAtRef.current) {
      turnEndsAtRef.current = Date.now() + TURN_TIMEOUT_MS;
    }

    const timerId = setInterval(() => {
      if (!turnEndsAtRef.current) return;
      const remaining = Math.max(0, turnEndsAtRef.current - Date.now());
      setTurnRemainingMs(remaining);
    }, 200);

    return () => clearInterval(timerId);
  }, [currentTurn, isTurnActive]);

  // Debug states
  useEffect(() => {
    console.log("Debug - user.id:", authUser?.id);
    console.log("Debug - currentTurn:", currentTurn);
    console.log("Debug - isMyTurn:", isMyTurn);
    console.log("Debug - matchStatus:", matchStatus);
    console.log("Debug - mySymbol:", mySymbol);
  }, [authUser, currentTurn, isMyTurn, matchStatus, mySymbol]);

  // Determine status text
  let statusText: string;
  if (winner) {
    statusText = winner === "Draw" ? "It's a Draw!" : `Winner: ${winner}`;
  } 
  else if (matchStatus === "waiting") {
    statusText = "Waiting for opponent...";
  } 
  else if (isMyTurn) {
    statusText = `Your turn (${mySymbol})`;
  }
  else {
    statusText = "Opponent's turn...";
  }

  const handleClick = (index: number) => {
    if (!authUser) return;
    if (!isMyTurn || winner || matchStatus !== "playing") return;

    const symbol = mySymbol as "X" | "O";
    const myMoveCount = getMoveCount(symbol);

    //  CASE 1 — less than 3 pieces on board
    if (myMoveCount < 3) {
      if (board[index]) return; // Cell is occupied

      gameSocket.emit("make-move", {
        matchId,
        oldindex: -1,          // no removal
        newindex: index,
      });

      return;
    }

    //  CASE 2 — already 3 pieces on board, must remove one first

    // Step A: select piece to remove (click on own piece)
    if (pieceToRemove === null) {
      if (board[index] === symbol) {
        setPieceToRemove(index);
      }
      return;
    }

    // If clicking on another own piece, change selection
    if (board[index] === symbol) {
      setPieceToRemove(index);
      return;
    }

    // Step B: place new piece on empty cell
    if (!board[index]) {
      gameSocket.emit("make-move", {
        matchId,
        oldindex: pieceToRemove,
        newindex: index,
        userId: authUser.id
      });

      setPieceToRemove(null);
    }
  };
  return (
    <div className="min-h-screen bg-slate-900"> 
    <header className="min-h-screen flex flex-col items-center justify-start gap-10 pt-12">
      <h1 className="text-5xl font-bold text-center">
        {/* <span className="bg-linear-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          Tic
        </span>{" "}
        <span className="bg-linear-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          Tac
        </span>{" "}
        <span className="bg-linear-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Toe
        </span>{" "} */}
        <span className="bg-linear-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
          Game
        </span>
      </h1>

      {!authUser ? (
        <div className="flex flex-col items-center gap-4 mt-6">
          <p className="text-white text-xl">Please sign in to play.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 text-lg font-semibold rounded-xl 
                         bg-linear-to-r from-indigo-500 to-purple-600
                         text-white hover:scale-105 transition"
          >
            Go to Login
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-white text-sm">
              {authUser?.fullName ?? authUser?.username ?? authUser?.email ?? "Player"}
              {mySymbol && <span className="ml-2 text-emerald-400">({mySymbol})</span>}
            </span>
          </div>

          {/* Show players in match */}
          {players.length === 2 && (
            <div className="text-slate-400 text-sm">
              {players[0].username} (X) vs {players[1].username} (O)
            </div>
          )}

          {players.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-md">
              {players.map((player, idx) => {
                const isActivePlayer = isTurnActive && currentTurn === player.id;
                const isMe = player.id === authUser?.id;
                const symbolLabel = idx === 0 ? "X" : "O";

                return (
                  <div
                    key={player.id}
                    className={`rounded-xl px-4 py-3 border
                      ${isActivePlayer ? "border-emerald-400 bg-emerald-500/10" : "border-slate-700 bg-slate-800/50"}`}
                  >
                    <div className="flex items-center justify-between text-slate-200 text-sm">
                      <span>
                        {player.username}
                        {isMe ? " (You)" : ""}
                      </span>
                      <span className="text-xs text-slate-400">{symbolLabel}</span>
                    </div>
                    <div className={`text-2xl font-semibold ${isActivePlayer ? "text-emerald-300" : "text-slate-400"}`}>
                      {isActivePlayer ? `${turnSecondsLeft}s` : "Paused"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-white text-xl">{statusText}</p>

          {/* Instructions when need to remove a piece */}
          {isMyTurn && mySymbol && getMoveCount(mySymbol) >= 3 && pieceToRemove === null && !winner && (
            <p className="text-yellow-400 text-sm">Click one of your pieces to remove it first</p>
          )}
          {pieceToRemove !== null && (
            <p className="text-green-400 text-sm">Now click an empty cell to place your piece</p>
          )}

          {/* Board */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {board.map((cell, index) => {
              const isSelectedForRemoval = pieceToRemove === index;
              const isMyPiece = cell === mySymbol;
              const needsToSelectPiece = isMyTurn && mySymbol && getMoveCount(mySymbol) >= 3 && pieceToRemove === null;
              const cellColor =
                cell === "X" ? "bg-rose-700" :
                cell === "O" ? "bg-cyan-700" :
                "bg-slate-800";
              const baseColor = isSelectedForRemoval
                ? "bg-red-600 ring-4 ring-red-400"
                : needsToSelectPiece && isMyPiece
                  ? "bg-yellow-700 hover:bg-yellow-600"
                  : cellColor;
              const hoverClass = isMyTurn && !winner && !cell ? "hover:bg-slate-700" : "";
              const cursorClass = isMyTurn && !winner ? "cursor-pointer" : "cursor-not-allowed opacity-80";
              
              return (
                <button
                  key={index}
                  onClick={() => handleClick(index)}
                  disabled={!isMyTurn || !!winner}
                  className={`w-20 h-20 text-3xl font-bold rounded-lg
                            ${baseColor}
                            text-white
                            ${hoverClass} ${cursorClass}
                            transition`}
                >
                  {cell}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleLeaveAttempt}
            className="mt-6 px-6 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-500 transition"
          >
            Back to Lobby
          </button>

          {/* Opponent Left Modal */}
        

          {/* Leave Confirmation Modal */}
          {showLeaveConfirm && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-slate-800 border border-red-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                <h3 className="text-white text-xl font-bold mb-2">Leave Match?</h3>
                <p className="text-slate-300 mb-6">
                  If you leave now, you will <span className="text-red-400 font-semibold">Lose the match</span> and your opponent wins.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmLeave}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-semibold"
                  >
                    Leave
                  </button>
                  <button
                    onClick={() => setShowLeaveConfirm(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-500 transition font-semibold"
                  >
                    Stay
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Opponent forfeited → current player always wins */}
          <WinModal
            show={openmentLeaver}
            isWinner={true}
            winnerName={authUser?.fullName ?? authUser?.username ?? "You"}
            message="Your opponent left the match."
            redirectTo={backTo}
          />

          {/* Regular game end */}
          {!openmentLeaver && (
            <WinModal
              show={showWinModal}
              isWinner={!!winner && players.find(p => p.id === authUser?.id)?.username === winner}
              winnerName={winner ?? ""}
              redirectTo={backTo}
            />
          )}
        </>
      )}
      {/* <BottomNav /> */}
    </header>
    </div>
  );
}

export default Game;