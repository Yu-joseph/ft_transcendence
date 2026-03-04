import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-blue-800 shadow-2xl z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-center">
        <div className="flex gap-2 py-3">

          {/* Dashboard Button */}
          <button
            onClick={() => navigate("/Dashboard")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all duration-300 transform ${
              pathname === "/Dashboard"
                ? "bg-cyan-600 text-white scale-110 shadow-lg shadow-cyan-500/50"
                : "text-gray-400 hover:text-cyan-300 hover:bg-slate-800/50 hover:scale-105"
            }`}
          >
            <span className="font-semibold">Home</span>
          </button>

          {/* Lobby Button */}
          <button
            onClick={() => navigate("/AiChallange")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all duration-300 transform ${
              pathname === "/AiChallange"
                ? "bg-cyan-600 text-white scale-110 shadow-lg shadow-cyan-500/50"
                : "text-gray-400 hover:text-cyan-300 hover:bg-slate-800/50 hover:scale-105"
            }`}
          >
            <span className="font-semibold">Lobby</span>
          </button>

          {/* Game Button */}
          <button
            onClick={() => navigate("/lobby")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all duration-300 transform ${
              pathname.startsWith("/game")
                ? "bg-cyan-600 text-white scale-110 shadow-lg shadow-cyan-500/50"
                : "text-gray-400 hover:text-cyan-300 hover:bg-slate-800/50 hover:scale-105"
            }`}
          >
            <span className="font-semibold">Game</span>
          </button>

        </div>
      </div>
    </nav>
  );
}
