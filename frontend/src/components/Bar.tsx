import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GiTicTacToe } from "react-icons/gi";
import { useAuth } from "../auth/useAuth";
import { chatSocket, gameSocket } from "../socket/sock";
import { withMediaPrefix } from "../chat-system/components/shared/sharedUtils";


function Bar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [avatar,setAvatar] = useState(withMediaPrefix(user?.avatar || null));

  /**__________ Event listener for update avatar _____________ */
  useEffect(() => {

    const handleUpdateAvatar = (event: Event) => {
      const detail = (event as CustomEvent<{ avatarUrl: string, userId: string | null }>).detail;
      if(detail && detail?.userId !== user?.id)
        return;
      const newAvatar = detail.avatarUrl;
      setAvatar(newAvatar || '');
      if (user?.id) {
        setUser({ ...user, avatar: newAvatar });
      }
    }
    window.addEventListener("avatar:update", handleUpdateAvatar);

    return () => {
      window.removeEventListener('avatar:update', handleUpdateAvatar);
    }
  },[user?.id])

  const emitLogoutPlaying = () =>
  new Promise<void>((resolve) => {
    if (!gameSocket.connected) {
      resolve();
      return;
    }

    gameSocket.timeout(1200).emit("logout-playing", {}, () => resolve());
  });

  const handleLogout = async () => {
    try {
      await emitLogoutPlaying();
      chatSocket.disconnect();
      await fetch("/authent/logout/", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      sessionStorage.removeItem("activeTournament");
      localStorage.setItem("auth:logout", String(Date.now()));
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
  const avatarPath = user?.avatar?.trim();
  const avatarUrl = avatarPath
    ? avatarPath.startsWith("http") || avatarPath.startsWith("/authent/")
      ? avatarPath
      : `/media${avatarPath}`
    : undefined;

  return (
    <header className="z-50 w-full bg-slate-800 border-b border-black shadow-lg">
      <div className="w-full py-2 pl-10 pr-8 sm:pr-6 lg:pr-3 flex items-center justify-between">
        <div className="w-1/2">
          <button
            onClick={() => navigate("/Dashboard")}
            className="cursor-pointer group"
          >
            <h1 className="lg:text-4xl md:text-2xl text-xl font-bold text-amber-500 flex items-center gap-1 mb-2 group-hover:text-amber-400 transition-colors duration-200 ">
              <GiTicTacToe /> Tic-Tac-Toe Arena
            </h1>
          </button>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="/privacy" className="transition hover:text-amber-400">
              Privacy Policy
            </a>
            <a href="/terms" className="transition hover:text-amber-400">
              Terms of Service
            </a>
          </div>
        </div>
        <div
          className="relative w-1/2 flex items-center justify-end pr-2 sm:pr-0 lg:justify-end md:justify-end"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex items-center gap-4 rounded-2xl px-4 py-3 border border-transparent hover:border-amber-400/40 hover:bg-slate-800/60 transition"
          >
            {avatar ? (
              <img
                src={avatar || ""}
                alt={displayName}
                className="h-11 w-11 rounded-full object-cover border border-amber-400"
              />
            ) : (
              <span className="h-11 w-11 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-base font-semibold border border-amber-400">
                {displayInitial}
              </span>
            )}
            <span className="hidden sm:inline text-amber-500 text-base">{displayName}</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl z-50">
              <div className="flex items-center gap-4 pb-3 border-b border-slate-700">
                {avatar ? (
                  <img
                    src={avatar}
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