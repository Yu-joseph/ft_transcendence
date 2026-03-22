import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import ChatWindow from '../components/ChatWindow'

function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [loadedMessages, setLoadedMessages] = useState([])
  const [chatKey, setChatKey] = useState(0)

  // Load sessions from database on start
  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSessions(data)
        }
      })
      .catch(err => console.log('Could not load sessions'))
  }, [])

  const handleNewChat = async () => {
    try {
      const res = await fetch('/api/new-session', { method: 'POST' })
      const data = await res.json()

      const newSession = {
        session_id: data.session_id,
        title: 'New Chat',
        message_count: 0
      }

      setSessions(prev => [newSession, ...prev])
      setActiveSession(data.session_id)
      setLoadedMessages([])
      setChatKey(prev => prev + 1)
    } catch (error) {
      console.log('Could not create new session')
    }
  }

  const handleSelectSession = async (sessionId) => {
    setActiveSession(sessionId)

    try {
      const res = await fetch('/api/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      })
      const data = await res.json()

      const messages = (data.messages || []).map(m => ({
        role: m.role === 'assistant' ? 'ai' : m.role,
        text: m.content
      }))

      setLoadedMessages(messages)
      setChatKey(prev => prev + 1)
    } catch (error) {
      console.log('Could not load session')
    }
  }

  const updateSessionTitle = (firstMessage) => {
    setSessions(prev =>
      prev.map(s =>
        s.session_id === activeSession
          ? { ...s, title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '') }
          : s
      )
    )
  }

  return (
    <div className="app-layout">
      <Sidebar
        onNewChat={handleNewChat}
        sessions={sessions}
        activeSession={activeSession}
        onSelectSession={handleSelectSession}
      />
      <div className="main-area">
        <Topbar />
        <ChatWindow
          key={chatKey}
          onFirstMessage={updateSessionTitle}
          initialMessages={loadedMessages}
        />
      </div>
    </div>
  )
}

export default Dashboard