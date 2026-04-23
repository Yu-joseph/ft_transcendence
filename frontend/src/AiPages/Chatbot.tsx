import { useEffect, useRef , useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Bar from '../components/Bar';
import BottomNav from '../components/BottomNav';

type Session = {
  session_id: string;
  title: string;
  message_count: number;
};

type Message = {
  role: 'ai' | 'user' | 'system';
  text: string;
};

function Chatbot() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [chatKey, setChatKey] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const pendingSessionRef = useRef<string | null>(null);
  const ACTIVE_SESSION_STORAGE_KEY = 'chatbot_active_session_id';
  const SESSION_CACHE_STORAGE_KEY = 'chatbot_sessions_cache';
  const didInitRef = useRef(false);

  const parseSessionsPayload = (payload: unknown): Session[] => {
    if (Array.isArray(payload)) return payload as Session[];
    if (
      payload &&
      typeof payload === 'object' &&
      Array.isArray((payload as { sessions?: unknown }).sessions)
    ) {
      return (payload as { sessions: Session[] }).sessions
    }
    return []
  };

  const readCachedSessions = (): Session[] => {
    try {
      const raw = localStorage.getItem(SESSION_CACHE_STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Session[]) : [];
    } catch {
      return []
    }
  };

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(SESSION_CACHE_STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const init = async () => {
      try {
        const res = await fetch('/chatbot/sessions',{
          method: 'GET',
          credentials: 'include',
          
        });
        if (!res.ok) throw new Error('sessions request failed: ' + res.status);

        const payload: unknown = await res.json();
        const fetchedSessions = parseSessionsPayload(payload);

        if (fetchedSessions.length === 0) {
          await handleNewChat();
          return
        }

        setSessions(fetchedSessions);
        localStorage.setItem(SESSION_CACHE_STORAGE_KEY, JSON.stringify(fetchedSessions));

        const savedSessionId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
        const sessionToLoad =
          fetchedSessions.find((s) => s.session_id === savedSessionId)?.session_id ??
          fetchedSessions[0].session_id;

        await handleSelectSession(sessionToLoad);
      } catch (error) {
        console.error('Could not load sessions', error);

        const cachedSessions = readCachedSessions();
        if (cachedSessions.length > 0) {
          setSessions(cachedSessions);

          const savedSessionId = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
          const sessionToLoad =
            cachedSessions.find((s) => s.session_id === savedSessionId)?.session_id ??
            cachedSessions[0].session_id;

          await handleSelectSession(sessionToLoad);
          return
        }

        await handleNewChat();
      }
    };

    void init();
  }, []);

  const handleNewChat = async () => {
    try {
      const res = await fetch('/chatbot/new-session', { 
        method: 'POST',
        credentials: 'include',
      });
      const data: { session_id: string } = await res.json();
      const newSession: Session = {
        session_id: data.session_id,
        title: 'New Chat',
        message_count: 0,
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSession(data.session_id);
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, data.session_id);
      setLoadedMessages([]);
      setChatKey((prev) => prev + 1);
    } catch {
        console.error('Could not create new session');
      }
  };
  const handleSelectSession = async (sessionId: string) => {
    if (isStreaming) {
      pendingSessionRef.current = sessionId
      return
    }
    setActiveSession(sessionId);
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, sessionId);

    try {
      const res = await fetch('/chatbot/set-session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const data: { messages?: Array<{ role: string; content: string }> } = await res.json();

      const messages: Message[] = (data.messages ?? []).map((m) => ({
        role: m.role === 'assistant' ? 'ai' : (m.role as Message['role']),
        text: m.content,
      }));

      setLoadedMessages(messages);
      setChatKey((prev) => prev + 1);
    } catch {
        setLoadedMessages([]);
        console.error('Could not load session');
      }
  };

  const updateSessionTitle = (firstMessage: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.session_id === activeSession
          ? {
              ...s,
              title: firstMessage.length > 30 ? `${firstMessage.slice(0, 30)}...` : firstMessage,
            }
          : s,
      ),
    );
  };

  const requestNewChat = async () => {
    if (isStreaming || deletingSessionId) return
    await handleNewChat()
  }

  const requestSelectSession = async (sessionId: string) => {
    if (deletingSessionId) return
    if (isStreaming) {
      pendingSessionRef.current = sessionId
      return
    }
    await handleSelectSession(sessionId)
  }

  useEffect(() => {
    if (!isStreaming && pendingSessionRef.current) {
      const next = pendingSessionRef.current
      pendingSessionRef.current = null
      void handleSelectSession(next)
    }
  }, [isStreaming])

  const handleDeleteSession = async (sessionId: string) => {
    if (isStreaming || deletingSessionId) return


    setDeletingSessionId(sessionId)

    try {
      
      const res = await fetch("/chatbot/detete-session", {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })

      if (!res.ok) {
        throw new Error('Delete session failed: ' + res.status)
      }

      localStorage.removeItem('chat_stream_' + sessionId)

      const remainingSessions = sessions.filter((s) => s.session_id !== sessionId)
      setSessions(remainingSessions)

      if (activeSession !== sessionId) return

      if (remainingSessions.length === 0) {
        localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
        setActiveSession(null)
        setLoadedMessages([])
        await handleNewChat()
        return
      }

      await handleSelectSession(remainingSessions[0].session_id)
    } catch (error) {
      console.error('Could not delete session', error)
    } finally {
      setDeletingSessionId(null)
    }
  }

  const isUiLocked = isStreaming || deletingSessionId !== null

  return (
    <div className="flex h-screen overflow-hidden flex-col z-10 bg-slate-950">
      <Bar />
      <div className="flex flex-1 p-2 pb-20 bg-linear-to-b from-slate-900 via-blue-900 to-slate-950 overflow-hidden">
        <Sidebar
          onNewChat={requestNewChat}
          sessions={sessions}
          activeSession={activeSession}
          onSelectSession={requestSelectSession}
          onDeleteSession={handleDeleteSession}
          disabled={isUiLocked}
          deletingSessionId={deletingSessionId}
        />
        <div className="flex-1 flex flex-col overflow-hidden px-2">
          <ChatWindow
            key={chatKey}
            sessionId={activeSession}
            onFirstMessage={updateSessionTitle}
            initialMessages={loadedMessages}
            onStreamingChange={setIsStreaming}
          />
        </div>
      </div>
        <BottomNav />
    </div>
  );
}

export default Chatbot;