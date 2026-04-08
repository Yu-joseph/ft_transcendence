import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import Bar from '../components/Bar'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../auth/useAuth'

type Session = {
  session_id: string
  title: string
  message_count: number
}

type Message = {
  role: 'ai' | 'user' | 'system'
  text: string
}

function Chatbot() {
  const { user, loading } = useAuth()
  const userId = user?.id ?? ''

  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([])
  const [chatKey, setChatKey] = useState(0)
  const ACTIVE_SESSION_STORAGE_KEY = 'chatbot_active_session_id'

  useEffect(() => {
    if (loading) return
  
    const init = async () => {
      try {
        const res = await fetch('/chatbot/sessions', {
          credentials: 'include',
        })
        const data = (await res.json()) as Session[]
  
        if (Array.isArray(data) && data.length > 0) {
          setSessions(data)
  
          const savedSessionId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY)
          const sessionToLoad =
            data.find(s => s.session_id === savedSessionId)?.session_id ?? data[0].session_id
  
          await handleSelectSession(sessionToLoad)
        } else {
          await handleNewChat()
        }
      } catch {
        console.error('Could not load sessions')
      }
    }
  
    void init()
  }, [userId, loading])


  
  const handleNewChat = async () => {
    try {
      const res = await fetch('/chatbot/new-session', {
        method: 'POST',
        credentials: 'include',
      })
      const data: { session_id: string } = await res.json()
      const newSession: Session = {
        session_id: data.session_id,
        title: 'New Chat',
        message_count: 0,
      }

      setSessions(prev => [newSession, ...prev])
      setActiveSession(data.session_id)
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, data.session_id)
      setLoadedMessages([])
      setChatKey(prev => prev + 1)
    } catch {
      console.error('Could not create new session')
    }
  }

  const handleSelectSession = async (sessionId: string) => {
    setActiveSession(sessionId)
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, sessionId)

    try {
      const res = await fetch('/chatbot/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId }),
      })

      const data: { messages?: Array<{ role: string; content: string }> } = await res.json()

      const messages: Message[] = (data.messages ?? []).map(m => ({
        role: m.role === 'assistant' ? 'ai' : (m.role as Message['role']),
        text: m.content,
      }))

      setLoadedMessages(messages)
      setChatKey(prev => prev + 1)
    } catch {
      setLoadedMessages([])
      console.error('Could not load session')
    }
  }

  const updateSessionTitle = (firstMessage: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.session_id === activeSession
          ? {
              ...s,
              title: firstMessage.length > 30 ? `${firstMessage.slice(0, 30)}...` : firstMessage,
            }
          : s,
      ),
    )
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col z-10 bg-slate-950">
      <Bar />
      <div className="flex flex-1 p-2 pb-20 bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 overflow-hidden">
        <Sidebar
          onNewChat={handleNewChat}
          sessions={sessions}
          activeSession={activeSession}
          onSelectSession={handleSelectSession}
        />
        <div className="flex-1 flex flex-col overflow-hidden px-2">
          <ChatWindow
            key={chatKey}
            sessionId={activeSession}
            onFirstMessage={updateSessionTitle}
            initialMessages={loadedMessages}
            userId={userId}
          />
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

export default Chatbot