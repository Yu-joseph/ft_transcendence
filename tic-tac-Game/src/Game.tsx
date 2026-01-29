import { SignedOut, SignInButton } from "@clerk/clerk-react";
import { useState } from "react";

type Player = "X" | "O" | null;

const WIN_PATTERNS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(board: Player[]) {
  for (const [a,b,c] of WIN_PATTERNS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.every(cell => cell !== null) ? "draw" : null;
}


function Game() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const handleClick = (index: number) =>
  {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    const result = checkWinner(newBoard);
    if (result) setWinner(result);

    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  };

  return (
    <div className="min-h-screen bg-slate-900"> 
    <header className="min-h-screen flex flex-col items-center justify-start gap-10 pt-12">
      
      {/* Title */}
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

      {/* Sign In Button */}
      <SignedOut>
        {/* Game Status */}
        <p className="text-white text-xl">
          {winner
            ? winner === "draw"
              ? "Draw!"
              : `Winner: ${winner}`
            : `Turn: ${currentPlayer}`}
        </p>

        {/* Board */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              className="w-20 h-20 text-3xl font-bold rounded-lg
                        bg-slate-800 text-white
                        hover:bg-slate-700 transition"
            >
              {cell}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setBoard(Array(9).fill(null));
            setWinner(null);
            setCurrentPlayer("X");
          }}
          className="mt-6 px-6 py-2 rounded-lg bg-emerald-500 text-white"
        >
          Reset Game
        </button>

        <SignInButton>
          <button className="px-6 py-3 text-lg font-semibold rounded-xl 
                             bg-linear-to-r from-indigo-500 to-purple-600
                             text-white hover:scale-105 transition">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>

    </header>
    </div>
  );
}

export default Game;
