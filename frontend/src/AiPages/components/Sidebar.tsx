import { useMemo, useState } from 'react'
import { RiDeleteBinLine } from "react-icons/ri";


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
  onDeleteSession: (sessionId: string) => void | Promise<void>
  disabled?: boolean
  deletingSessionId?: string | null
}

function Sidebar({
  onNewChat,
  sessions,
  activeSession,
  onSelectSession,
  onDeleteSession,
  disabled = false,
  deletingSessionId = null,
}: SidebarProps) {
  const [searchValue, setSearchValue] = useState('')

  const filteredSessions = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return sessions

    return sessions.filter((session) => {
      const title = (session.title ?? '').toLowerCase()
      const sessionId = session.session_id.toLowerCase()
      return title.includes(query) || sessionId.includes(query)
    })
  }, [searchValue, sessions])

  return (
    <div className="w-60 bg-slate-900/70 border border-blue-800 rounded-2xl flex flex-col py-5 px-4 gap-2 shadow-xl">
      <div className="mt-2">
        <input
          type="text"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search sessions"
          aria-label="Search sessions"
          className="w-full rounded-lg border border-blue-800 bg-slate-950/70 px-3 py-2 text-[13px] text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-amber-400"
        />
      </div>

      <button
        disabled={disabled}
        className="flex items-center justify-center gap-2 bg-amber-500 text-slate-900 rounded-lg py-2.5 px-4 text-[13px] font-semibold w-full transition hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={onNewChat}
      >
        + New Chat
      </button>

      <div className="mt-2 flex-1 min-h-0 overflow-y-auto pr-1 space-y-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filteredSessions.length === 0 ? (
          <div className="px-2 py-3 text-[12px] text-slate-400">
            No sessions match your search.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isDeleting = deletingSessionId === session.session_id

            return (
              <div
                key={session.session_id}
                className={`group flex items-center gap-2 py-2 px-3 rounded-lg text-[13px] transition-all border ${
                  disabled || isDeleting
                    ? 'opacity-60 cursor-not-allowed bg-slate-800/70 text-slate-400 border-transparent'
                    : session.session_id === activeSession
                      ? 'cursor-pointer bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'cursor-pointer bg-slate-800/70 text-slate-300 border-transparent hover:border-blue-700 hover:bg-slate-800'
                }`}
                onClick={() => {
                  if (!disabled && !isDeleting) onSelectSession(session.session_id)
                }}
              >
                <span className="min-w-0 flex-1 truncate">{session.title || 'New Chat'}</span>
                <button
                  type="button"
                  aria-label="Delete session"
                  disabled={disabled || isDeleting}
                  className="rounded px-2 py-1 text-[11px] text-red-300 bg-red-900/40 hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={(event) => {
                    event.stopPropagation()
                    if (!disabled && !isDeleting) {
                      void onDeleteSession(session.session_id)
                    }
                  }}
                >
                  <RiDeleteBinLine />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Sidebar