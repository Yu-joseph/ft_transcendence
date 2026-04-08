import { useState } from "react"

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
  const [search, setSearch] = useState("")

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-80 min-w-[260px] max-w-[350px] h-full flex flex-col py-4 px-2 bg-slate-900 border-r border-blue-900">

      <div className="mb-3 px-1 text-xs text-slate-500 uppercase tracking-widest">
        Mission Control
      </div>

      <button
        className="flex items-center justify-center gap-2 bg-amber-500 text-slate-900 rounded-lg py-2.5 px-4 text-[13px] font-semibold w-full transition hover:opacity-90 mb-3"
        onClick={onNewChat}
      >
        + New Chat
      </button>

      <input
        type="text"
        placeholder="Search chats..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg outline-none border border-slate-700 focus:border-blue-500"
      />

      <div className="text-[11px] text-slate-500 uppercase tracking-widest px-3 mb-2">
        Recents
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 pr-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#64748b transparent" }}
      >
        {filteredSessions.length === 0 && (
          <div className="text-slate-500 text-sm px-3 py-2">No chats found</div>
        )}
        {filteredSessions.map((session) => (
          <div
            key={session.session_id}
            className={`py-2 px-3 rounded-lg text-sm cursor-pointer transition-all break-words ${
              session.session_id === activeSession
                ? "bg-slate-700 text-white"
                : "text-slate-200 hover:bg-slate-800 hover:text-white"
            }`}
            onClick={() => onSelectSession(session.session_id)}
            title={session.title}
          >
            {session.title || "New Chat"}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar