import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GiPodiumWinner } from "react-icons/gi";
// import { GiTrophy } from "react-icons/gi";
// import { MdOutlineSentimentVeryDissatisfied } from "react-icons/md";
// import { IoMdClose } from "react-icons/io";
import { User } from "lucide-react";


interface WinModalProps {
  show: boolean;
  isWinner: boolean;
  winnerName: string;
  message?: string;
  timerTransfer?: number; // ms, default 4000
  redirectTo?: string; // default /Dashboard
  playerAvatarUrl?: string;
  playerName?: string;
}

export default function WinModal({
  show,
  isWinner,
  winnerName,
  message,
  timerTransfer = 4000,
  redirectTo = '/Dashboard',
  playerAvatarUrl,
  playerName,
}: WinModalProps) {
  const navigate = useNavigate();
  const avatarAlt = playerName ?? "Player";

  //
  useEffect(() => {
    if (!show) 
        return;
    const timer = setTimeout(() => navigate(redirectTo), timerTransfer);
    return () => clearTimeout(timer);
  }, [show]);

  if (!show) 
    return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div
        className={`bg-slate-800 border ${
          isWinner ? "border-emerald-600" : "border-red-700"
        } rounded-xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center`}
      >
        <div className="mb-4 flex items-center justify-center gap-3">
          {playerAvatarUrl ? (
            <img
              src={playerAvatarUrl}
              alt={avatarAlt}
              className="h-14 w-14 rounded-full object-cover border border-amber-400/60"
            />
          ) : (
            <span className="h-14 w-14 rounded-full bg-slate-700 text-amber-300 flex items-center justify-center border border-slate-600">
              <User className="h-7 w-7" />
            </span>
          )}
          {/* {isWinner ? (
            <GiTrophy className="text-blue-700 text-5xl" />
          ) : (
            <IoMdClose className="text-red-400 text-5xl" />
          )} */}
        </div>

        {isWinner ? (
          <>
            <h3 className="text-white text-2xl font-bold mb-2">You Win!</h3>
            <p className="text-slate-300 mb-4">
              {message ?? "Congratulations, you won the match!"}
            </p>
          </>
        ) : (
          <>
            <h3 className="text-white text-2xl font-bold mb-2">You Lose</h3>
            <p className="text-slate-300 mb-4">
              {message ?? (
                <>
                  <span className="text-amber-400 font-semibold">{winnerName}</span> won the match.
                </>
              )}
            </p>
          </>
        )}

        <div className="flex items-center justify-center gap-2 mb-2">
          <GiPodiumWinner className="text-amber-400 text-xl" />
          <span className="text-amber-400 font-semibold">{winnerName}</span>
        </div>

        <p className="text-slate-400 text-sm mt-3">Redirecting{redirectTo === '/Tournament' ? ' to Tournament…' : ' to Dashboard…'}</p>
      </div>
    </div>
  );
}
