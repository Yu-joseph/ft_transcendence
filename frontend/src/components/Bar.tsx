import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GiTicTacToe } from "react-icons/gi";
import { useAuth } from "../auth/useAuth";

function Bar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Normalize avatar URL to hit the auth service media endpoint via nginx (/authent/ -> auth:8000)
  const normalizeAvatarUrl = (url?: string) => {
    if (!url) 
      return undefined;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.startsWith("http://") || lowerUrl.startsWith("https://")) 
      return url; // already absolute

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
      setUser(null);
      sessionStorage.removeItem("activeTournament");
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    if (!showMenu) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showMenu]);

  const openProfile = () => {
    if (!user?.id) {
      return;
    }

    setShowMenu(false);
    navigate(`/profile/${user.id}`);
  };

  const displayName = user?.username ?? "Player";
  const displayInitial = displayName.trim().charAt(0).toUpperCase() || "P";
  const avatarUrl = user?.avatar ? normalizeAvatarUrl(user.avatar) : undefined;

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-slate-900 border-b border-amber-400 shadow-lg">
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
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex items-center gap-3 rounded-xl px-3 py-2 border border-transparent hover:border-amber-400/40 hover:bg-slate-800/60 transition"
          >
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
            <span className="text-amber-500 text-sm">{displayName}</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover border border-amber-400"
                  />
                ) : (
                  <span className="h-10 w-10 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-semibold border border-amber-400">
                    {displayInitial}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="pt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={openProfile}
                  className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 text-left"
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-red-200 bg-red-900/40 hover:bg-red-900/60 text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Bar