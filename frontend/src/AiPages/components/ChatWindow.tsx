import { useState, useRef, useEffect } from 'react'
// import './ChatWindow.css'

type Message = {
  role: string
  text: string
}

type ChatWindowProps = {
  onFirstMessage: (firstMessage: string) => void
  initialMessages?: Message[]
  sessionId?: string | null
  onStreamingChange?: (streaming: boolean) => void
}

function ChatWindow({ onFirstMessage, initialMessages = [], sessionId, onStreamingChange }: ChatWindowProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showThinking, setShowThinking] = useState(false)
  const hasSentFirst = useRef(initialMessages.length > 0)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    onStreamingChange?.(loading)
  }, [loading, onStreamingChange])


  const handleSend = async () => {
    if (!input.trim() || loading) return

    let messageText = input


    const userMsg = { role: 'user', text: messageText }
    setMessages(prev => [...prev, userMsg])

    if (!hasSentFirst.current) {
      void generateTitle(messageText)
      hasSentFirst.current = true
    }

    setInput('')
    setLoading(true)
    setShowThinking(true)

    try {
      const response = await fetch('/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, session_id: sessionId })
      })

      const data: { role?: string; content?: string; error?: string } = await response.json()

      if (!response.ok || !data.content) {
        setMessages(prev => [
          ...prev,
          { role: 'ai', text: data.error ?? 'Error connecting to server.' }
        ])
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'ai', text: data.content }
        ])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to server.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (loading) {
      e.preventDefault()
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const generateTitle = async (message: string) => {
    try {
      const res = await fetch('/chatbot/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })

      const data: { title?: string } = await res.json()

      if (onFirstMessage) {
        onFirstMessage(data.title ?? 'New Chat')
      }
    } catch {
      console.log('Title generation failed')
    }
  }
  const MAX_INPUT_HEIGHT = 180

  const resizeTextarea = () => {
    const el = textareaRef.current
    if (!el) return

    el.style.height = 'auto'
    const nextHeight = Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)
    el.style.height = String(nextHeight) + 'px'
    el.style.overflowY = el.scrollHeight > MAX_INPUT_HEIGHT ? 'auto' : 'hidden'
  }

  useEffect(() => {
    resizeTextarea()
  }, [input])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  // Focus when Agent page opens
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus({ preventScroll: true })

      // Keep cursor at end
      const pos = el.value.length
      el.setSelectionRange(pos, pos)
    })

    return () => cancelAnimationFrame(id)
  }, [])

  // Keep focus after AI finishes answering
  useEffect(() => {
    if (!loading) {
      textareaRef.current?.focus({ preventScroll: true })
    }
  }, [loading])

  return (
    <div className="flex flex-1 flex-col bg-slate-900/80 border border-blue-800 rounded-2xl overflow-hidden shadow-2xl">
      <div
        className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-5 text-slate-100"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#1f3b5b transparent' }}
      >
        {messages.length === 0 && !loading && (
          <div className="text-center pt-16 pb-5">
            <div className="w-13 h-13 rounded-xl bg-slate-800 border border-blue-700 flex items-center justify-center text-[22px] text-amber-400 mx-auto mb-4">
              #
            </div>
            <h1 className="text-[26px] font-bold text-amber-400 mb-2">Hey, Ready to dive in??</h1>
            <p className="text-[13px] text-slate-300 leading-relaxed max-w-105 mx-auto">
              ask anything.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col">
            {msg.role === 'ai' && (
              <div className="flex flex-col gap-2 max-w-160">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[13px] text-amber-300">
                    ♟
                  </div>
                  <div className="text-[10px] text-amber-300 tracking-widest uppercase">Arena AI</div>
                </div>
                <div className="bg-slate-900/90 border border-blue-900 rounded-[2px_14px_14px_14px] px-5 py-4 text-sm leading-7 text-slate-300">
                  <p className="mb-2 last:mb-0 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.text }} />
                </div>
              </div>
            )}

            {msg.role === 'user' && (
              <div className="flex flex-col items-end gap-1.5">
                <div className="text-[10px] text-slate-400 tracking-widest uppercase">Commander</div>
                <div className="bg-slate-800 border border-blue-700 rounded-[14px_14px_2px_14px] px-4 py-3 text-sm leading-6 text-slate-100 max-w-145">
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && showThinking && (
          <div className="flex flex-col gap-2 max-w-160">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[13px] text-amber-300">
                ♟
              </div>
              <div className="text-[10px] text-amber-300 tracking-widest uppercase">Arena AI</div>
            </div>
            <div className="bg-slate-900/90 border border-blue-900 rounded-[2px_14px_14px_14px] px-5 py-4">
              <div className="flex gap-1.5 py-1">
                <span className="w-1.75 h-1.75 bg-blue-500/40 rounded-full animate-pulse" />
                <span className="w-1.75 h-1.75 bg-blue-500/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.75 h-1.75 bg-blue-500/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-10 pb-4 pt-3 border-t border-blue-800 bg-slate-900/70">

        <div className="flex items-end bg-slate-900 border border-blue-700 rounded-xl px-3 py-2 gap-3 transition-colors focus-within:border-amber-400/60">
          <textarea
            ref={textareaRef}
            autoFocus
            placeholder={loading ? 'Arena AI is thinking...' : 'ask...'}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1 bg-transparent border-none text-slate-100 text-left text-sm outline-none font-inherit resize-none placeholder:text-slate-500 leading-6 max-h-[180px] mb-2 overflow-y-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            className="w-9 h-9 bg-amber-500 text-slate-900 font-semibold rounded-lg flex items-center justify-center transition-opacity disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed hover:opacity-90"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow