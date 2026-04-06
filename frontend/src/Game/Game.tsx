<<<<<<< HEAD
<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { gameSocket } from "../socket/sock";
// import BottomNav from "../components/BottomNav";
import WinModal from "../components/WinModal";
import { useAuth } from "../auth/useAuth";
=======
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { useEffect, useState, useRef } from "react";
=======
import { useEffect, useState } from "react";
>>>>>>> dd5f97c (merging current changes with all team members)
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { gameSocket } from "../socket/sock";
// import BottomNav from "../components/BottomNav";
import WinModal from "../components/WinModal";
<<<<<<< HEAD
>>>>>>> 2d98fb0 (SA)
=======
import { useAuth } from "../auth/useAuth";
>>>>>>> dd5f97c (merging current changes with all team members)


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
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
  const { user } = useUser();
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const location = useLocation();
  //useLocation to access url info
  const tournamentId = (location.state as { tournamentId?: string } | null)?.tournamentId ?? null
  const backToRef = useRef(tournamentId ? '/Tournament' : '/Dashboard')
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [mySymbol, setMySymbol] = useState<"X" | "O" | null>(null);
  const [currentTurn, setCurrentTurn] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<string>("waiting");
  const [players, setPlayers] = useState<Player[]>([]);
>>>>>>> 2d98fb0 (SA)
=======
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
>>>>>>> dd5f97c (merging current changes with all team members)
  const [pieceToRemove, setPieceToRemove] = useState<number | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [openmentLeaver, setopLeave] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> 2d98fb0 (SA)
=======

>>>>>>> dd5f97c (merging current changes with all team members)
  // Derive move count from the current board state
  const getMoveCount = (symbol: "X" | "O"): number => {
    return board.filter(cell => cell === symbol).length;
  };

<<<<<<< HEAD
<<<<<<< HEAD
  // Ensure socket is connected and rejoin match if needed
  useEffect(() => {
    if (!authUserId || !matchId) return;

    if (!gameSocket.connected) {
      gameSocket.connect();
=======
  // Get symbol and initial match from location state (passed from Lobby)
=======
  // Ensure socket is connected and rejoin match if needed
>>>>>>> dd5f97c (merging current changes with all team members)
  useEffect(() => {
    if (!authUserId || !matchId) return;

<<<<<<< HEAD
  // Ensure socket is connected
  useEffect(() => {
     if (!user || !matchId) 
      return;

    if (!socket.connected) {
      socket.connect();
>>>>>>> 2d98fb0 (SA)
=======
    if (!gameSocket.connected) {
      gameSocket.connect();
>>>>>>> dd5f97c (merging current changes with all team members)
    }

    // If we dont have match state (after refresh), ask server to rejoin
    const handleConnect = () => {
<<<<<<< HEAD
<<<<<<< HEAD
      gameSocket.emit('reconnect-match', { userId: authUserId, matchId });
    };

    if (gameSocket.connected) {
      handleConnect();
    } else {
      gameSocket.on('connect', handleConnect);
=======
      socket.emit('reconnect-match', { userId: user.id, matchId });
=======
      gameSocket.emit('reconnect-match', { userId: authUserId, matchId });
>>>>>>> dd5f97c (merging current changes with all team members)
    };

    if (gameSocket.connected) {
      handleConnect();
    } else {
<<<<<<< HEAD
      socket.on('connect', handleConnect);
>>>>>>> 2d98fb0 (SA)
=======
      gameSocket.on('connect', handleConnect);
>>>>>>> dd5f97c (merging current changes with all team members)
    }

    const handleReconnectFailed = (data: { reason: string }) => {
      console.log('Reconnect failed:', data.reason);
<<<<<<< HEAD
<<<<<<< HEAD
      navigate(backTo);
    };

    gameSocket.on('reconnect-match-failed', handleReconnectFailed);

    return () => {
      gameSocket.off('connect', handleConnect);
      gameSocket.off('reconnect-match-failed', handleReconnectFailed);
    };
  }, [authUserId, backTo, matchId, navigate]);
=======
      navigate(backToRef.current);
=======
      navigate(backTo);
>>>>>>> dd5f97c (merging current changes with all team members)
    };

    gameSocket.on('reconnect-match-failed', handleReconnectFailed);

    return () => {
      gameSocket.off('connect', handleConnect);
      gameSocket.off('reconnect-match-failed', handleReconnectFailed);
    };
<<<<<<< HEAD
  }, [user, matchId, navigate]);
>>>>>>> 2d98fb0 (SA)
=======
  }, [authUserId, backTo, matchId, navigate]);
>>>>>>> dd5f97c (merging current changes with all team members)

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
        setShowWinModal(true);
      } else if (match.status === 'finished' && !match.winner) {
        setWinner("Draw");
      }
    };

    const handleOpponentForfeited = () => {
      setopLeave(true);
<<<<<<< HEAD
<<<<<<< HEAD
      setTimeout(() => navigate(backTo), 4000);
=======
      setTimeout(() => navigate(backToRef.current), 4000);
>>>>>>> 2d98fb0 (SA)
=======
      setTimeout(() => navigate(backTo), 4000);
>>>>>>> dd5f97c (merging current changes with all team members)
    };

    const handleTournamentFinished = () => {
      // whole tournament is over — always go back to Dashboard, not Tournament page
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
      backToRef.current = '/Dashboard'
=======
      setBackTo('/Dashboard')
>>>>>>> dd5f97c (merging current changes with all team members)
    };

    gameSocket.on("match-update", handleMatchUpdate);
    gameSocket.on("opponent-forfeited", handleOpponentForfeited);
    gameSocket.on("tournament-finished", handleTournamentFinished);

    return () => {
      gameSocket.off("match-update", handleMatchUpdate);
      gameSocket.off("opponent-forfeited", handleOpponentForfeited);
      gameSocket.off("tournament-finished", handleTournamentFinished);
    };
<<<<<<< HEAD
  }, [matchId]);
>>>>>>> 2d98fb0 (SA)
=======
  }, [backTo, matchId, navigate]);
>>>>>>> dd5f97c (merging current changes with all team members)

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

<<<<<<< HEAD
<<<<<<< HEAD
    gameSocket.on('match-found', handleMatchFound);

    return () => {
      gameSocket.off('match-found', handleMatchFound);
=======
    socket.on('match-found', handleMatchFound);

    return () => {
      socket.off('match-found', handleMatchFound);
>>>>>>> 2d98fb0 (SA)
=======
    gameSocket.on('match-found', handleMatchFound);

    return () => {
      gameSocket.off('match-found', handleMatchFound);
>>>>>>> dd5f97c (merging current changes with all team members)
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
<<<<<<< HEAD
<<<<<<< HEAD
      navigate(backTo);
=======
      navigate(backToRef.current);
>>>>>>> 2d98fb0 (SA)
=======
      navigate(backTo);
>>>>>>> dd5f97c (merging current changes with all team members)
    }
  };

  const handleConfirmLeave = () => {
<<<<<<< HEAD
<<<<<<< HEAD
    gameSocket.emit("leave-match", { matchId, userId: authUser?.id });
    setShowLeaveConfirm(false);
    navigate(backTo);
  };

  // Determine if it's my turn
  const isMyTurn = authUser && currentTurn === authUser.id;

  // Debug states
  useEffect(() => {
    console.log("Debug - user.id:", authUser?.id);
=======
    socket.emit("leave-match", { matchId, userId: user?.id });
=======
    gameSocket.emit("leave-match", { matchId, userId: authUser?.id });
>>>>>>> dd5f97c (merging current changes with all team members)
    setShowLeaveConfirm(false);
    navigate(backTo);
  };

  // Determine if it's my turn
  const isMyTurn = authUser && currentTurn === authUser.id;

  // Debug states
  useEffect(() => {
<<<<<<< HEAD
    console.log("Debug - user.id:", user?.id);
>>>>>>> 2d98fb0 (SA)
=======
    console.log("Debug - user.id:", authUser?.id);
>>>>>>> dd5f97c (merging current changes with all team members)
    console.log("Debug - currentTurn:", currentTurn);
    console.log("Debug - isMyTurn:", isMyTurn);
    console.log("Debug - matchStatus:", matchStatus);
    console.log("Debug - mySymbol:", mySymbol);
<<<<<<< HEAD
<<<<<<< HEAD
  }, [authUser, currentTurn, isMyTurn, matchStatus, mySymbol]);
=======
  }, [user, currentTurn, isMyTurn, matchStatus, mySymbol]);
>>>>>>> 2d98fb0 (SA)
=======
  }, [authUser, currentTurn, isMyTurn, matchStatus, mySymbol]);
>>>>>>> dd5f97c (merging current changes with all team members)

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
<<<<<<< HEAD
<<<<<<< HEAD
    if (!authUser) return;
=======
>>>>>>> 2d98fb0 (SA)
=======
    if (!authUser) return;
>>>>>>> dd5f97c (merging current changes with all team members)
    if (!isMyTurn || winner || matchStatus !== "playing") return;

    const symbol = mySymbol as "X" | "O";
    const myMoveCount = getMoveCount(symbol);

    //  CASE 1 — less than 3 pieces on board
    if (myMoveCount < 3) {
      if (board[index]) return; // Cell is occupied

<<<<<<< HEAD
<<<<<<< HEAD
      gameSocket.emit("make-move", {
        matchId,
        oldindex: -1,          // no removal
        newindex: index,
        userId: authUser.id
=======
      socket.emit("make-move", {
        matchId,
        oldindex: -1,          // no removal
        newindex: index,
        userId: user!.id
>>>>>>> 2d98fb0 (SA)
=======
      gameSocket.emit("make-move", {
        matchId,
        oldindex: -1,          // no removal
        newindex: index,
        userId: authUser.id
>>>>>>> dd5f97c (merging current changes with all team members)
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
<<<<<<< HEAD
<<<<<<< HEAD
      gameSocket.emit("make-move", {
        matchId,
        oldindex: pieceToRemove,
        newindex: index,
        userId: authUser.id
=======
      socket.emit("make-move", {
        matchId,
        oldindex: pieceToRemove,
        newindex: index,
        userId: user!.id
>>>>>>> 2d98fb0 (SA)
=======
      gameSocket.emit("make-move", {
        matchId,
        oldindex: pieceToRemove,
        newindex: index,
        userId: authUser.id
>>>>>>> dd5f97c (merging current changes with all team members)
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
<<<<<<< HEAD
<<<<<<< HEAD

      {!authUser ? (
=======
      {/* <Lobby /> */}
      <SignedOut>
>>>>>>> 2d98fb0 (SA)
=======

      {!authUser ? (
>>>>>>> dd5f97c (merging current changes with all team members)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dd5f97c (merging current changes with all team members)
      ) : (
        <>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-white text-sm">
              {authUser?.fullName ?? authUser?.username ?? authUser?.email ?? "Player"}
              {mySymbol && <span className="ml-2 text-emerald-400">({mySymbol})</span>}
            </span>
<<<<<<< HEAD
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
=======
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
=======
>>>>>>> dd5f97c (merging current changes with all team members)
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
<<<<<<< HEAD
        )}
      </SignedIn>
      <BottomNav />
>>>>>>> 2d98fb0 (SA)
=======

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
>>>>>>> dd5f97c (merging current changes with all team members)
    </header>
    </div>
  );
}

export default Game;