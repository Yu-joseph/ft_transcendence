import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GiPodiumWinner } from "react-icons/gi";
import { GiTrophy } from "react-icons/gi";
// import { MdOutlineSentimentVeryDissatisfied } from "react-icons/md";
import { IoMdClose } from "react-icons/io";


interface WinModalProps {
  show: boolean;
  isWinner: boolean;
  winnerName: string;
  message?: string;
<<<<<<< HEAD
<<<<<<< HEAD
  timerTransfer?: number; // ms, default 4000
  redirectTo?: string; // default /Dashboard
=======
  redirectDelay?: number; // ms, default 4000
>>>>>>> e2ddfd1 (adding win medals)
=======
  timerTransfer?: number; // ms, default 4000
>>>>>>> 6d4554a (frontend)
}

export default function WinModal({
  show,
  isWinner,
  winnerName,
  message,
<<<<<<< HEAD
<<<<<<< HEAD
  timerTransfer = 4000,
  redirectTo = '/Dashboard',
=======
  redirectDelay = 4000,
>>>>>>> e2ddfd1 (adding win medals)
=======
  timerTransfer = 4000,
>>>>>>> 6d4554a (frontend)
}: WinModalProps) {
  const navigate = useNavigate();

  //
  useEffect(() => {
    if (!show) 
        return;
<<<<<<< HEAD
<<<<<<< HEAD
    const timer = setTimeout(() => navigate(redirectTo), timerTransfer);
=======
    const timer = setTimeout(() => navigate("/Dashboard"), redirectDelay);
>>>>>>> e2ddfd1 (adding win medals)
=======
    const timer = setTimeout(() => navigate("/Dashboard"), timerTransfer);
>>>>>>> 6d4554a (frontend)
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
        <div className="text-6xl mb-4 flex justify-center">
          {isWinner ? (
            <GiTrophy className="text-blue-700" />
          ) : (
            <IoMdClose className="text-red-400" />
          )}
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

<<<<<<< HEAD
        <p className="text-slate-400 text-sm mt-3">Redirecting{redirectTo === '/Tournament' ? ' to Tournament…' : ' to Dashboard…'}</p>
=======
        <p className="text-slate-400 text-sm mt-3">Redirecting to Dashboard...</p>
>>>>>>> e2ddfd1 (adding win medals)
      </div>
    </div>
  );
}
