import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../auth/useAuth'

type Message = {
  role: string
  text: string
}

type StreamDraft = {
  typing: boolean
  userText: string
  partialAi: string
  updatedAt: number
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
  const {user} = useAuth();
  const streamAbortRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      // do not abort on route switch if you want background stream to continue
    }
  }, [])

  const appendChunkToLastAi = (chunk: string) => {
    setMessages((prev) => {
      const next = [...prev]
      const last = next.length - 1

      if (last >= 0 && next[last].role === 'ai') {
        next[last] = { ...next[last], text: next[last].text + chunk }
      } else {
        next.push({ role: 'ai', text: chunk })
      }

      return next
    })
  }
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    onStreamingChange?.(loading)
  }, [loading, onStreamingChange])


  const handleSend = async () => {
    if (!input.trim() || loading) return

    const messageText = input.trim()
    const userMsg = { role: 'user', text: messageText }

    // add user message + empty AI placeholder
    setMessages((prev) => [...prev, userMsg])

    if (!hasSentFirst.current) {
      void generateTitle(messageText)
      hasSentFirst.current = true
    }

    setInput('')
    setLoading(true)
    setShowThinking(true)

    const controller = new AbortController()
    streamAbortRef.current = controller
    writeDraft({
      typing: true,
      userText: messageText,
      partialAi: '',
      updatedAt: Date.now(),
    })
    try {
      const response = await fetch('/chatbot/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ message: messageText, session_id: sessionId }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error('Stream request failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let streamDone = false
      let firstToken = true

      while (!streamDone) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // parse SSE frames separated by blank line
        const frames = buffer.split(/\r?\n\r?\n/)
        buffer = frames.pop() ?? ''

        for (const frame of frames) {
          const lines = frame.split(/\r?\n/)

          for (const line of lines) {
            if (!line.startsWith('data:')) continue

            const payload = line.slice(5).trimStart()

            if (payload === '[DONE]') {
              const current = readDraft()
              if (current) {
                writeDraft({ ...current, typing: false, updatedAt: Date.now() })
                // optional: clear finalized draft
                // writeDraft(null)
              }
              streamDone = true
              break
            }

            if (firstToken) {
              setShowThinking(false)
              firstToken = false
            }
            const current = readDraft();
            writeDraft({
              typing: true,
              userText: current?.userText ?? messageText,
              partialAi: (current?.partialAi ?? '') + payload,
              updatedAt: Date.now(),
            })
            if (mountedRef.current) {
              appendChunkToLastAi(payload)
            }
          }

          if (streamDone) break
        }
      }
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === 'AbortError'

      if (aborted) {
        const current = readDraft()
        if (current) {
          writeDraft({ ...current, typing: false, updatedAt: Date.now() })
        }
        return
      }

      writeDraft({
        typing: false,
        userText: messageText,
        partialAi: 'Error connecting to server.',
        updatedAt: Date.now(),
      })
    } finally {
      streamAbortRef.current = null
      setLoading(false)
      setShowThinking(false)
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

  const readDraft = (): StreamDraft | null => {
    if (!streamKey) return null
    try {
      const raw = localStorage.getItem(streamKey)
      if (!raw) return null
      return JSON.parse(raw) as StreamDraft
    } catch {
      return null
    }
  }

  const writeDraft = (draft: StreamDraft | null) => {
    if (!streamKey) return
    if (!draft) {
      localStorage.removeItem(streamKey)
      return
    }
    localStorage.setItem(streamKey, JSON.stringify(draft))
  }

  const streamKey = sessionId ? `chat_stream_${sessionId}` : null

  // hydrate + keep UI synced with localStorage while stream may still be running
  useEffect(() => {
    const hydrate = () => {
      const draft = readDraft()
      if (!draft) return

      setMessages((prev) => {
        const next = [...prev]

        if (draft.userText && !next.some((m) => m.role === 'user' && m.text === draft.userText)) {
          next.push({ role: 'user', text: draft.userText })
        }

        if (draft.partialAi) {
          const last = next.length - 1
          if (last >= 0 && next[last].role === 'ai') {
            if (next[last].text !== draft.partialAi) {
              next[last] = { ...next[last], text: draft.partialAi }
            }
          } else {
            next.push({ role: 'ai', text: draft.partialAi })
          }
        }

        const changed =
          next.length !== prev.length ||
          next.some((m, i) => m.role !== prev[i]?.role || m.text !== prev[i]?.text)

        return changed ? next : prev
      })

      setLoading(draft.typing)
      setShowThinking(draft.typing && draft.partialAi.length === 0)
    }

    hydrate()
    const id = window.setInterval(hydrate, 250)
    return () => window.clearInterval(id)
  }, [sessionId])

  // add refs
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const stickToBottomRef = useRef(true)

  // track whether user is near bottom
  const handleScroll = () => {
    const el = scrollContainerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    stickToBottomRef.current = distanceFromBottom < 80
  }

  // only auto-scroll if user is already near bottom
  useEffect(() => {
    if (!stickToBottomRef.current) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showThinking])

  return (
    <div className="flex flex-1 flex-col bg-slate-900/80 border border-blue-800 rounded-2xl overflow-hidden shadow-2xl">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
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
            {msg.role === 'ai'  && msg.text.trim() !== '' && (
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
                <div className="text-[10px] text-slate-400 tracking-widest uppercase">{user?.username}</div>
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