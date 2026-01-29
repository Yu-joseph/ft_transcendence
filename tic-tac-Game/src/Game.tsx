import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { useState } from "react";

type Player = "X" | "O" | null;

const Win_array = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(board: Player[]) {
  for (const [a,b,c] of Win_array) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell !== null)) {
    return "draw";
  }
  else {
    return null;
  }
  //check all cells of there all full with x or o then return draw every is methdo or arrray in js
}


function Game() {
  const { user } = useUser();

  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | "draw" | null>(null);

  let statusText: string;
  if (winner) {
    if (winner === "draw") {
      statusText = "Draw!";
    } else {
      statusText = `Winner: ${winner}`;
      // string template `Winner: ${winner}`;
    }
  } else {
    statusText = `Turn: ${currentPlayer}`;
  }

  const handleClick = (index: number) =>
  {
    if (board[index] || winner)
      return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
// in result u will get winner x or 0
    const result = checkWinner(newBoard);
    if (result) 
      setWinner(result);

    setBoard(newBoard);
    //setting value for next move
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
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

      <SignedOut>
        <div className="flex flex-col items-center gap-4 mt-6">
          <p className="text-white text-xl">Please sign in to play.</p>
          <SignInButton>
            <button
              className="px-6 py-3 text-lg font-semibold rounded-xl 
                             bg-linear-to-r from-indigo-500 to-purple-600
                             text-white hover:scale-105 transition"
            >
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        {/*using clerk to show small icon of player playing*/}
        <div className="flex items-center justify-center gap-3 mt-2">
          <UserButton afterSignOutUrl="/" />
          <span className="text-white text-sm">
            {/*the ? mean pick the first elem is not null */}
            {user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress}
          </span>
        </div>

        <p className="text-white text-xl">{statusText}</p>

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
      </SignedIn>

    </header>
    </div>
  );
}

export default Game;
