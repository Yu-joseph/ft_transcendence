import { useNavigate } from "react-router-dom";
import { GiTicTacToe } from "react-icons/gi";
import { useAuth } from "../auth/useAuth";

function Bar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Normalize avatar URL to hit the auth service media endpoint via nginx (/authent/ -> auth:8000)
  const normalizeAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url; // already absolute

    const base = "http://localhost:8080/authent";
    // Ensure we always request /media/<file>
    const withMediaPrefix = url.startsWith("/media/")
      ? url
      : url.startsWith("media/")
        ? `/${url}`
        : `/media/${url}`;

    return `${base}${withMediaPrefix}`;
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/authent/logout/", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      navigate("/");
    }
  };

  const displayName = user?.fullName ?? user?.username ?? "Player";
  const displayInitial = displayName.trim().charAt(0).toUpperCase() || "P";
  const avatarUrl = user?.avatar ? normalizeAvatarUrl(user.avatar) : undefined;

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
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-9 w-9 rounded-full object-cover border border-amber-400"
            />
          ) : (
            <span className="h-9 w-9 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-semibold border border-amber-400">
              {displayInitial}
            </span>
          )}
          <span className="text-amber-500 text-sm">
            {displayName}
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