import { useNavigate } from "react-router-dom"
import { GiTicTacToe } from "react-icons/gi";
import { getAuthUser } from "../hooks/useCustomAuth";

function Bar() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/authent/logout/", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      localStorage.removeItem("authUser");
      navigate("/");
    }
  };

  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <header className="bg-slate-900 border-b border-amber-400 shadow-lg">
=======
    <header className="bg-slate-900 border-b border-blue-800 shadow-lg">
>>>>>>> e2ddfd1 (adding win medals)
=======
    <header className="bg-slate-900 border-b border-amber-400 shadow-lg">
>>>>>>> 6d4554a (frontend)
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
        <div className="flex items-center gap-3">
          <span className="text-white text-sm">
            {user?.fullName ?? user?.username ?? "Player"}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md text-sm font-semibold bg-slate-700 text-white hover:bg-slate-600"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Bar