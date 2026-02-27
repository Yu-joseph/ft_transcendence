import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { socket } from "./socket/sock";
import BottomNav from "./components/BottomNav";

type CellValue = "X" | "O" | null;

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
  const { user } = useUser();
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const location = useLocation();
  //useLocation to access url info
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [mySymbol, setMySymbol] = useState<"X" | "O" | null>(null);
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<string>("waiting");
  const [players, setPlayers] = useState<Player[]>([]);
  const [pieceToRemove, setPieceToRemove] = useState<number | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Derive move count from the current board state
  const getMoveCount = (symbol: "X" | "O"): number => {
    return board.filter(cell => cell === symbol).length;
  };

  // Get symbol and initial match from location state (passed from Lobby)
  useEffect(() => {
    const state = location.state as { symbol?: string; match?: Match } | null;
    if (state?.symbol) {
      setMySymbol(state.symbol as "X" | "O");
    }
    if (state?.match) {
      console.log("Initializing match from state:", state.match);
      setBoard(state.match.board as CellValue[]);
      // casted CellValue cuz the ts should know this protcted before ( and convert it to cellValue)
      setCurrentTurn(state.match.currentTurn);
      setMatchStatus(state.match.status);
      setPlayers(state.match.players);
    }
  },[]);

  // Ensure socket is connected
  useEffect(() => {
     if (!user || !matchId) 
      return;

    if (!socket.connected) {
      socket.connect();
    }

    // If we dont have match state (after refresh), ask server to rejoin
    const handleConnect = () => {
      socket.emit('reconnect-match', { userId: user.id, matchId });
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    const handleReconnectFailed = (data: { reason: string }) => {
      console.log('Reconnect failed:', data.reason);
      navigate('/lobby');
    };

    socket.on('reconnect-match-failed', handleReconnectFailed);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('reconnect-match-failed', handleReconnectFailed);
    };
  }, [user, matchId, navigate]);

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
      
      if (match.winner) {
        // Find winners username
        const winnerPlayer = match.players.find(p => p.id === match.winner);
        setWinner(winnerPlayer?.username || match.winner);
      } else if (match.status === 'finished' && !match.winner) {
        setWinner("Draw");
      }
    };

    socket.on("match-update", handleMatchUpdate);

    return () => {
      socket.off("match-update", handleMatchUpdate);
    };
  }, [matchId]);

    useEffect(() => {
    if (!matchId) return;

    const handleMatchFound = (data: { matchId: string; match: Match; symbol: string }) => {
      console.log("Match restored:", data.matchId, "Symbol:", data.symbol);
      setMySymbol(data.symbol as "X" | "O");
      setBoard(data.match.board as CellValue[]);
      setCurrentTurn(data.match.currentTurn);
      setMatchStatus(data.match.status);
      setPlayers(data.match.players);

      if (data.match.winner) {
        const winnerPlayer = data.match.players.find(p => p.id === data.match.winner);
        setWinner(winnerPlayer?.username || data.match.winner);
      }
    };

    socket.on('match-found', handleMatchFound);

    return () => {
      socket.off('match-found', handleMatchFound);
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
      navigate("/lobby");
    }
  };

  const handleConfirmLeave = () => {
    socket.emit("forfeit-match", { matchId, userId: user?.id });
    setShowLeaveConfirm(false);
    navigate("/lobby");
  };

  // Determine if it's my turn
  const isMyTurn = user && currentTurn === user.id;

  // Debug states
  useEffect(() => {
    console.log("Debug - user.id:", user?.id);
    console.log("Debug - currentTurn:", currentTurn);
    console.log("Debug - isMyTurn:", isMyTurn);
    console.log("Debug - matchStatus:", matchStatus);
    console.log("Debug - mySymbol:", mySymbol);
  }, [user, currentTurn, isMyTurn, matchStatus, mySymbol]);

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
    if (!isMyTurn || winner || matchStatus !== "playing") return;

    const symbol = mySymbol as "X" | "O";
    const myMoveCount = getMoveCount(symbol);

    //  CASE 1 — less than 3 pieces on board
    if (myMoveCount < 3) {
      if (board[index]) return; // Cell is occupied

      socket.emit("make-move", {
        matchId,
        oldindex: -1,          // no removal
        newindex: index,
        userId: user!.id
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
      socket.emit("make-move", {
        matchId,
        oldindex: pieceToRemove,
        newindex: index,
        userId: user!.id
      });

      setPieceToRemove(null);
    }
  };
  return (
    <div className="min-h-screen bg-slate-900"> 
    <header className="min-h-screen flex flex-col items-center justify-start gap-10 pt-12">
      <h1 className="text-5xl font-bold text-center">
        <span className="bg-linear-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          Tic
        </span>{" "}
        <span className="bg-linear-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          Tac
        </span>{" "}
        <span className="bg-linear-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Toe
        </span>{" "}
        <span className="bg-linear-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Game
        </span>
      </h1>
      {/* <Lobby /> */}
      <SignedOut>
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
      </SignedOut> 

      <SignedIn>
        {/* Using Clerk to show the player info */}
        <div className="flex items-center justify-center gap-3 mt-2">
          <UserButton afterSignOutUrl="/" />
          <span className="text-white text-sm">
            {user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress}
            {mySymbol && <span className="ml-2 text-emerald-400">({mySymbol})</span>}
          </span>
        </div>

        {/* Show players in match */}
        {players.length === 2 && (
          <div className="text-slate-400 text-sm">
            {players[0].username} (X) vs {players[1].username} (O)
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
            
            return (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={!isMyTurn || !!winner}
                className={`w-20 h-20 text-3xl font-bold rounded-lg
                          ${isSelectedForRemoval 
                            ? "bg-red-600 ring-4 ring-red-400" 
                            : needsToSelectPiece && isMyPiece
                              ? "bg-yellow-700 hover:bg-yellow-600"
                              : "bg-slate-800"}
                          text-white
                          ${isMyTurn && !winner ? "hover:bg-slate-700 cursor-pointer" : "cursor-not-allowed opacity-80"}
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
      </SignedIn>
      <BottomNav />
    </header>
    </div>
  );
}

export default Game;