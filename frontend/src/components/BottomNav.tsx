import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isChatActive = pathname === "/Chat" || pathname.startsWith("/Chat/");
  const isAgentActive = pathname === "/Chatbot" || pathname.startsWith("/Chatbot/");
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-blue-800 shadow-2xl z-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-full flex justify-center">
        <div className="grid grid-cols-5 gap-1 py-2 w-full sm:flex sm:flex-wrap sm:items-center sm:gap-2">

          {/* Dashboard Button */}
          <button
            onClick={() => navigate("/Dashboard")}
            className={`flex items-center justify-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg transition-all duration-300 transform sm:w-auto sm:px-5 sm:py-2 sm:text-sm ${
              pathname === "/Dashboard"
                ? "bg-amber-600 text-white scale-110 shadow-lg "
                : "text-gray-400 hover:text-amber-600 hover:bg-slate-800/50 hover:scale-105"
            }`}
          >
            <span className="font-semibold">Home</span>
          </button>

          {/* Tournament Button */}
          <button
            onClick={() => navigate("/Tournament")}
            className={`flex items-center justify-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg transition-all duration-300 transform sm:w-auto sm:px-5 sm:py-2 sm:text-sm ${
              pathname === "/Tournament"
                ? "bg-amber-600 text-white scale-110 shadow-lg "
                : "text-gray-400 hover:text-amber-600 hover:bg-slate-800/50 hover:scale-105"
            }`}
          >
            <span className="font-semibold">Tournament</span>
          </button>
          <button
            onClick={() => navigate("/Friends")}
            className={`flex items-center justify-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg transition-all duration-300 transform sm:w-auto sm:px-5 sm:py-2 sm:text-sm ${
              pathname === "/Friends"
                ? "bg-amber-600 text-white scale-110 shadow-lg "
                : "text-gray-400 hover:text-amber-600 hover:bg-slate-800/50 hover:scale-105"
            }`}
          >
            <span className="font-semibold">Friend</span>
          </button>

          {/* Game Button */}
          <button
            onClick={() => navigate("/Chat")}
            className={`flex items-center justify-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg transition-all duration-300 transform sm:w-auto sm:px-5 sm:py-2 sm:text-sm ${
              isChatActive
                ? "bg-amber-600 text-white scale-110 shadow-lg "
                : "text-gray-400 hover:text-amber-600 hover:bg-slate-800/50 hover:scale-105"
            }`}
          >
            <span className="font-semibold">Chat</span>
          </button>

          {/* ai agent Button */}
          <button
            onClick={() => navigate("/Chatbot")}
            className={`flex items-center justify-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg transition-all duration-300 transform sm:w-auto sm:px-5 sm:py-2 sm:text-sm ${
              isAgentActive
                ? "bg-amber-600 text-white scale-110 shadow-lg "
                : "text-gray-400 hover:text-amber-600 hover:bg-slate-800/50 hover:scale-105"
            }`}
          >
            <span className="font-semibold">agent</span>
          </button>
          {/* ai agent Button */}
          {/* <button
            onClick={() => navigate("/Chatbot")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all duration-300 transform ${
              pathname.startsWith("/Chatbot")
                ? "bg-amber-600 text-white scale-110 shadow-lg "
                : "text-gray-400 hover:text-amber-600 hover:bg-slate-800/50 hover:scale-105"
            }`}
          >
            <span className="font-semibold">Ai agent</span>
          </button> */}

        </div>
      </div>
    </nav>
  );
}
