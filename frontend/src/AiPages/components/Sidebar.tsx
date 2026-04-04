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
}

function Sidebar({ onNewChat, sessions, activeSession, onSelectSession }: SidebarProps) {
  return (
    <div className="w-60 bg-slate-900/70 border border-blue-800 rounded-2xl flex flex-col py-5 px-4 gap-2 shadow-xl">
      <div className="mb-4 px-1.5 text-sm text-slate-300 uppercase tracking-widest">
        Mission Control
      </div>

      <button
        className="flex items-center justify-center gap-2 bg-amber-500 text-slate-900 rounded-lg py-2.5 px-4 text-[13px] font-semibold w-full transition hover:scale-105 shadow-lg"
        onClick={onNewChat}
      >
        + New Chat
      </button>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1" style={{ scrollbarWidth: 'thin' }}>
        {sessions.map(session => (
          <div
            key={session.session_id}
            className={`py-2 px-3 rounded-lg text-[13px] cursor-pointer truncate transition-all border ${
              session.session_id === activeSession
                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                : 'bg-slate-800/70 text-slate-300 border-transparent hover:border-blue-700 hover:bg-slate-800'
            }`}
            onClick={() => onSelectSession(session.session_id)}
          >
            💬 {session.title}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar