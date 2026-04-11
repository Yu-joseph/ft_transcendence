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

    const base = "/authent";
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
      await fetch("/authent/logout/", {
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
    <header className="z-50 w-full bg-slate-900 border-b border-blue-800 shadow-lg">
      <div className="w-full py-6 pl-10 pr-8 sm:pr-6 lg:pr-3 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/Dashboard")}
            className="cursor-pointer group"
          >
            <h1 className="text-4xl font-bold text-amber-500 flex items-center gap- mb-2 group-hover:text-blue-700 transition-colors duration-200 ">
              <GiTicTacToe /> Tic-Tac-Toe Arena
            </h1>
          </button>
          <p className="text-gray-300">Play online multiplayer tic-tac-toe games and tournaments</p>
        </div>
        <div className="relative ml-8 mr-6" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex items-center gap-4 rounded-2xl px-4 py-3 border border-transparent hover:border-amber-400/40 hover:bg-slate-800/60 transition"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-11 w-11 rounded-full object-cover border border-amber-400"
              />
            ) : (
              <span className="h-11 w-11 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-base font-semibold border border-amber-400">
                {displayInitial}
              </span>
            )}
            <span className="text-amber-500 text-base">{displayName}</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl">
              <div className="flex items-center gap-4 pb-3 border-b border-slate-700">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-12 w-12 rounded-full object-cover border border-amber-400"
                  />
                ) : (
                  <span className="h-12 w-12 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-base font-semibold border border-amber-400">
                    {displayInitial}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-base font-semibold text-white truncate">{displayName}</p>
                  <p className="text-sm text-slate-400 truncate">{user?.email}</p>
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