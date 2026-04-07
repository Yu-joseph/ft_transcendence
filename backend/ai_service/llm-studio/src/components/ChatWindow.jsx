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
}
type UploadedFile = {
  filename: string
  url?: string
  size?: number
}

function ChatWindow({ onFirstMessage, initialMessages = [], sessionId }: ChatWindowProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const hasSentFirst = useRef(initialMessages.length > 0)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleAttachClick = () => fileInputRef.current?.click()
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/chatbot/upload', { method: 'POST', body: formData })
      const data = await res.json()
      setUploadedFile(data)
    } catch {
      console.log('Upload failed')
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSend = async () => {
    if ((!input.trim() && !uploadedFile) || loading) return

    let messageText = input
    if (uploadedFile) {
      messageText = input
        ? `[File: ${uploadedFile.filename}] ${input}`
        : `[File: ${uploadedFile.filename}]`
    }

    const userMsg = { role: 'user', text: messageText }
    setMessages(prev => [...prev, userMsg])

    if (!hasSentFirst.current) {
      void generateTitle(messageText)
      hasSentFirst.current = true
    }

    setInput('')
    setUploadedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setLoading(true)

    const imageKeywords = [
      'generate image', 'create image', 'draw', 'make image',
      'imagine', 'visualize', 'image of', 'picture of', 'photo of',
      'generate for me image', 'show me image', 'show image',
      'generate me', 'create me', 'make me'
    ]
    const isImageRequest = imageKeywords.some(kw => messageText.toLowerCase().includes(kw))

    if (isImageRequest) {
      try {
        const response = await fetch('/chatbot/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText, session_id: sessionId })
        })

        const data: { image_url?: string; error?: string } = await response.json();

        if (!response.ok || !data.image_url) {
          setMessages((prev) => [
            ...prev,
            { role: 'ai', text: data.error ?? 'Error generating image.' }
          ]);
        } else {
          const imageHtml =
            '<img src="' +
            data.image_url +
            '" alt="Generated image" class="max-w-full rounded-lg border border-blue-800" />';
          setMessages((prev) => [...prev, { role: 'ai', text: imageHtml }]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: 'Error generating image.' }
        ])
      }

      setLoading(false)
      return
    }

    try {
      const response = await fetch('/chatbot/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      })
      if (!response.body) {
        throw new Error('Empty response body')
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      setMessages(prev => [...prev, { role: 'ai', text: '' }])
      setLoading(false)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const token = line.slice(6)
            if (token === '[DONE]') break
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                role: 'ai',
                text: updated[updated.length - 1].text + token
              }
              return updated
            })
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to server.' }])
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
              Share a board state, upload a file, or ask for a tactic to get started.
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

        {loading && (
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
        {uploadedFile && (
          <div className="flex items-center gap-2 px-3 py-1.5 mb-2 bg-slate-800 border border-blue-700 rounded-lg w-fit text-xs text-slate-200">
            <span className="text-sm">📄</span>
            <span>{uploadedFile.filename}</span>
            <button className="text-red-400 hover:text-red-300 text-sm" onClick={removeFile}>
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center bg-slate-900 border border-blue-700 rounded-xl px-3 py-2 gap-3 transition-colors focus-within:border-amber-400/60">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button className="text-[16px] text-slate-300 hover:text-amber-300 p-1.5 rounded-md" onClick={handleAttachClick} title="Attach file">
            📎
          </button>
          <textarea
            placeholder="Describe the board state or ask for a tactic…"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-slate-100 text-sm outline-none font-inherit resize-none placeholder:text-slate-500"
          />
          <button
            className="w-9 h-9 bg-amber-500 text-slate-900 font-semibold rounded-lg flex items-center justify-center transition-opacity disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed hover:opacity-90"
            onClick={handleSend}
            disabled={loading}
          >
            ↑
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-2 tracking-[0.06em]">
          STRATEGY ENGINE V3.0.1 · PRECISION TRAINING MODE
        </p>
      </div>
    </div>
  )
}

export default ChatWindow