// import { useUser } from "@clerk/clerk-react"
import { useNavigate } from "react-router-dom"
// import { SignedIn, UserButton } from "@clerk/clerk-react";
import { GiTicTacToe } from "react-icons/gi";

function Bar() {
  const navigate = useNavigate();
//   const {user} = useUser();
  return (
    <header className="bg-slate-900 border-b border-amber-400 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/Dashboard")}
            className="cursor-pointer group"
          >
            <h1 className="text-4xl font-bold text-amber-500 flex items-center gap-3 mb-2 group-hover:text-emerald-400 transition-colors duration-200 group-hover:underline underline-offset-4">
              <GiTicTacToe /> Tic-Tac-Toe Arena
            </h1>
          </button>
          <p className="text-gray-300">Play online multiplayer tic-tac-toe games and tournaments</p>
        </div>
        {/* <SignedIn> */}
          <div className="flex items-center gap-3">
            {/* <UserButton afterSignOutUrl="/" /> */}
            <span className="text-white text-sm">
              {"Player"}
            </span>
          </div>
        {/* </SignedIn> */}
      </div>
    </header>
  );
}

export default Bar