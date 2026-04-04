import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

type Cell = "X" | "O" | null;
type Phase = "place" | "move";
type Player = "X" | "O";
type ApiCell = "X" | "O" | "";

interface AiAction {
  oldindex?: number;
  newindex?: number;
  from?: number;
  to?: number;
}

interface AiResponse {
  action?: AiAction;
  error?: string;
}
// add near your types
interface PersistedAiState {
  board: Cell[];
  myTurn: boolean;
  pieceToRemove: number | null;
  status: string;
}

const STORAGE_KEY = "ai-challenge-state-v1";

const makeEmptyBoard = (): Cell[] => Array(9).fill(null);

function loadPersistedAiState (): PersistedAiState  {
  if (typeof window === "undefined") {
    return {
      board: makeEmptyBoard(),
      myTurn: true,
      pieceToRemove: null,
      status: "Your turn",
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        board: makeEmptyBoard(),
        myTurn: true,
        pieceToRemove: null,
        status: "Your turn",
      };
    }

    const parsed = JSON.parse(raw) as Partial<PersistedAiState>;

    const validBoard =
      Array.isArray(parsed.board) &&
      parsed.board.length === 9 &&
      parsed.board.every((c) => c === "X" || c === "O" || c === null);

    return {
      board: validBoard ? (parsed.board as Cell[]) : makeEmptyBoard(),
      myTurn: typeof parsed.myTurn === "boolean" ? parsed.myTurn : true,
      pieceToRemove:
        parsed.pieceToRemove === null || typeof parsed.pieceToRemove === "number"
          ? parsed.pieceToRemove
          : null,
      status: typeof parsed.status === "string" ? parsed.status : "Your turn",
    };
  } catch {
    return {
      board: makeEmptyBoard(),
      myTurn: true,
      pieceToRemove: null,
      status: "Your turn",
    };
  }
};


const HUMAN_PLAYER: Player = "X";
const AI_PLAYER: Player = "O";

const WINNING_LINES: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const getPieceCount = (board: Cell[], symbol: Player): number => {
  return board.reduce((count, cell) => count + (cell === symbol ? 1 : 0), 0);
};

const getPhaseForPlayer = (board: Cell[], symbol: Player): Phase => {
  return getPieceCount(board, symbol) >= 3 ? "move" : "place";
};

const toApiBoard = (board: Cell[]): ApiCell[] => {
  return board.map((cell) => cell ?? "");
};

const getWinner = (board: Cell[]): Player | null => {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const applyMove = (
  board: Cell[],
  symbol: Player,
  oldindex: number,
  newindex: number
): Cell[] | null => {
  if (newindex < 0 || newindex > 8) return null;

  const next = [...board];

  if (oldindex >= 0) {
    if (oldindex < 0 || oldindex > 8) return null;
    if (oldindex === newindex) return null;
    if (next[oldindex] !== symbol) return null;
    if (next[newindex] !== null) return null;

    next[oldindex] = null;
    next[newindex] = symbol;
    return next;
  }

  if (next[newindex] !== null) return null;
  next[newindex] = symbol;
  return next;
};

export function AiChallange() {
  const navigate = useNavigate();

   const [initialState] = useState<PersistedAiState>(() => loadPersistedAiState());

  const [board, setBoard] = useState<Cell[]>(initialState.board);
  const [phase, setPhase] = useState<Phase>("place");
  const [myTurn, setMyTurn] = useState<boolean>(initialState.myTurn);
  const [pieceToRemove, setPieceToRemove] = useState<number | null>(initialState.pieceToRemove);
  const [status, setStatus] = useState<string>(initialState.status);

  const winner = useMemo(() => getWinner(board), [board]);
  const gameOver = winner !== null;

  useEffect(() => {
    setPhase(getPhaseForPlayer(board, HUMAN_PLAYER));
  }, [board]);

  useEffect(() => {
    if (winner === HUMAN_PLAYER) {
      setStatus("You win!");
      return;
    }
    if (winner === AI_PLAYER) {
      setStatus("AI wins");
      return;
    }
    if (myTurn) {
      setStatus("Your turn");
    }
  }, [winner, myTurn]);

  const handlePlayAgain = () => {
    setBoard(makeEmptyBoard());
    setPhase("place");
    setMyTurn(true);
    setPieceToRemove(null);
    setStatus("Your turn");
    localStorage.removeItem(STORAGE_KEY);
  };

  const sendHumanMove = (oldindex: number, newindex: number) => {
    const nextBoard = applyMove(board, HUMAN_PLAYER, oldindex, newindex);
    if (!nextBoard) return;

    setBoard(nextBoard);
    setPieceToRemove(null);

    const humanWinner = getWinner(nextBoard);
    if (humanWinner === HUMAN_PLAYER) {
      setStatus("You win!");
      setMyTurn(false);
      return;
    }

    setStatus("AI thinking...");
    setMyTurn(false);
  };

  const handleCellClick = (index: number) => {
    if (!myTurn || winner) return;

    const currentPhase = getPhaseForPlayer(board, HUMAN_PLAYER);

    if (currentPhase === "place") {
      if (board[index] !== null) return;
      sendHumanMove(-1, index);
      return;
    }

    if (pieceToRemove === null) {
      if (board[index] === HUMAN_PLAYER) setPieceToRemove(index);
      return;
    }

    if (board[index] === HUMAN_PLAYER) {
      setPieceToRemove(index);
      return;
    }

    if (board[index] === null) {
      sendHumanMove(pieceToRemove, index);
    }
  };

  useEffect(() => {
    const shouldAIMove = !myTurn && !winner && status === "AI thinking...";
    if (!shouldAIMove) return;

    let active = true;

    const doAiMove = async () => {
      try {
        const aiPhase = getPhaseForPlayer(board, AI_PLAYER);

        const res = await fetch("/game_br/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            board: toApiBoard(board),
            phase: aiPhase,
            player: AI_PLAYER,
          }),
        });

        if (!res.ok) {
          throw new Error("AI request failed");
        }

        const data = (await res.json()) as AiResponse;
        if (!data.action) {
          throw new Error(data.error || "No AI action");
        }

        const oldindex =
          typeof data.action.oldindex === "number"
            ? data.action.oldindex
            : typeof data.action.from === "number"
            ? data.action.from
            : -1;

        const newindex =
          typeof data.action.newindex === "number"
            ? data.action.newindex
            : typeof data.action.to === "number"
            ? data.action.to
            : -1;

        if (newindex < 0) {
          throw new Error("Invalid AI action");
        }

        const nextBoard = applyMove(board, AI_PLAYER, oldindex, newindex);
        if (!nextBoard) {
          throw new Error("AI move is invalid");
        }

        if (!active) return;

        setBoard(nextBoard);

        const aiWinner = getWinner(nextBoard);
        if (aiWinner === AI_PLAYER) {
          setStatus("AI wins");
          return;
        }

        setMyTurn(true);
        setStatus("Your turn");
      } catch (err) {
        console.error("AI move failed", err);
        if (!active) return;
        setMyTurn(true);
        setStatus("AI unavailable");
      }
    };

    void doAiMove();

    return () => {
      active = false;
    };
  }, [board, myTurn, status, winner]);

  const makeEmptyBoard = (): Cell[] => Array(9).fill(null);

  useEffect(() => {
    loadPersistedAiState();
  }, []);

  useEffect(() => {
    const payload: PersistedAiState = { board, myTurn, pieceToRemove, status };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [board, myTurn, pieceToRemove, status]);

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

      <p className="text-white text-xl">{status}</p>

      {phase === "move" && myTurn && pieceToRemove === null && !winner && (
        <p className="text-yellow-400 text-sm">Click one of your pieces to remove it first</p>
      )}
      {pieceToRemove !== null && (
        <p className="text-green-400 text-sm">Now click an empty cell to place your piece</p>
      )}

      <div className="grid grid-cols-3 gap-3 mt-2">
        {board.map((cell, index) => {
          const isSelectedForRemoval = pieceToRemove === index;
          const isMyPiece = cell === HUMAN_PLAYER;
          const needsToSelectPiece = myTurn && phase === "move" && pieceToRemove === null && !winner;

          const tileClass =
            "w-20 h-20 text-3xl font-bold rounded-lg text-white transition " +
            (isSelectedForRemoval
              ? "bg-red-600 ring-4 ring-red-400 "
              : needsToSelectPiece && isMyPiece
                ? "bg-yellow-700 hover:bg-yellow-600 "
                : "bg-slate-800 ") +
            (myTurn && !winner ? "hover:bg-slate-700 cursor-pointer" : "cursor-not-allowed opacity-80");

          return (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!myTurn || gameOver}
              className={tileClass}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {gameOver && (
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handlePlayAgain}
            className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition font-semibold"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate("/Dashboard")}
            className="px-6 py-2 rounded-lg bg-slate-600 text-white hover:bg-slate-500 transition font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      <BottomNav />
    </header>
  </div>
);
}