type MatchInviteModalProps = {
  opponentName: string
  onAccept: () => void
  onDecline: () => void
}

export default function MatchInviteModal({
  opponentName,
  onAccept,
  onDecline,
}: MatchInviteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="text-white text-lg font-semibold mb-2">Match Invite</h3>
        <p className="text-slate-300 mb-5">
          <span className="text-amber-400 font-semibold">{opponentName}</span> wants to start this match.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-800 transition"
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-800 transition"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
