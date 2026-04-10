type Session = {
  session_id: string
  title: string
  message_count: number
}

type SidebarProps = {
  onNewChat: () => void
  sessions: Session[]
  activeSession: string | null
  onSelectSession: (sessionId: string) => void
  disabled?: boolean
}

function Sidebar({ onNewChat, sessions, activeSession, onSelectSession, disabled = false }: SidebarProps) {
  return (
    <div className="w-60 bg-slate-900/70 border border-blue-800 rounded-2xl flex flex-col py-5 px-4 gap-2 shadow-xl">
      <div className="mb-4 px-1.5 text-sm text-slate-300 uppercase tracking-widest">
        Mission Control
      </div>

      <button
        disabled={disabled}
        className="flex items-center justify-center gap-2 bg-amber-500 text-slate-900 rounded-lg py-2.5 px-4 text-[13px] font-semibold w-full transition hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={onNewChat}
      >
        + New Chat
      </button>

      <div className="mt-2 flex-1 min-h-0 overflow-y-auto pr-1 space-y-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sessions.map(session => (
          <div
            key={session.session_id}
            className={`py-2 px-3 rounded-lg text-[13px] truncate transition-all border ${
              disabled
                ? 'opacity-60 cursor-not-allowed bg-slate-800/70 text-slate-400 border-transparent'
                : session.session_id === activeSession
                  ? 'cursor-pointer bg-amber-500/20 text-amber-300 border-amber-400'
                  : 'cursor-pointer bg-slate-800/70 text-slate-300 border-transparent hover:border-blue-700 hover:bg-slate-800'
            }`}
            onClick={() => {
              if (!disabled) onSelectSession(session.session_id)
            }}
          >
            💬 {session.title}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar