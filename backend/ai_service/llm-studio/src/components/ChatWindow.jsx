import React, { useState, useRef, useEffect } from 'react'
import './ChatWindow.css'

<<<<<<< HEAD
function ChatWindow({ onFirstMessage, initialMessages = [], sessionId }) {
=======
function ChatWindow({ onFirstMessage, initialMessages = [] }) {
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
<<<<<<< HEAD

=======
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
  const hasSentFirst = useRef(initialMessages.length > 0)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

<<<<<<< HEAD
  // NEW: generate title using LLM
  const generateTitle = async (message) => {
    try {
      const res = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })

      const data = await res.json()

      if (onFirstMessage) {
        onFirstMessage(data.title)
      }

    } catch {
      console.log("Title generation failed")
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

=======
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      setUploadedFile(data)
    } catch {
      console.log('Upload failed')
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    fileInputRef.current.value = ''
  }

  const handleSend = async () => {
    if ((!input.trim() && !uploadedFile) || loading) return

    let messageText = input
<<<<<<< HEAD

=======
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
    if (uploadedFile) {
      messageText = input
        ? `[File: ${uploadedFile.filename}] ${input}`
        : `[File: ${uploadedFile.filename}]`
    }

    const userMsg = { role: 'user', text: messageText }
    setMessages(prev => [...prev, userMsg])

<<<<<<< HEAD
    // HERE: generate title using LLM
    if (!hasSentFirst.current) {
      generateTitle(messageText)
=======
    if (!hasSentFirst.current && onFirstMessage) {
      onFirstMessage(messageText)
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
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
<<<<<<< HEAD

    const isImageRequest = imageKeywords.some(kw =>
      messageText.toLowerCase().includes(kw)
    )

    // IMAGE REQUEST
=======
    const isImageRequest = imageKeywords.some(kw => messageText.toLowerCase().includes(kw))

>>>>>>> 22d4bda (adding getuser endpoint in nginx)
    if (isImageRequest) {
      try {
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
<<<<<<< HEAD
          body: JSON.stringify({ message: messageText, session_id: sessionId })
        })

        const data = await response.json()

        setMessages(prev => [
          ...prev,
<<<<<<< HEAD
          { 
            role: 'ai', 
            text: `<img src="http://localhost:5000${data.image_url}" style="max-width:300px;" />`
          }
=======
          { role: 'ai', text: data.content }
>>>>>>> cbabebc (merging chat-system with main project)
        ])

      } catch {
        setMessages(prev => [
          ...prev,
          { role: 'ai', text: 'Error generating image.' }
        ])
      }

=======
          body: JSON.stringify({ message: messageText })
        })
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'ai', text: data.content }])
      } catch {
        setMessages(prev => [...prev, { role: 'ai', text: 'Error generating image.' }])
      }
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
      setLoading(false)
      return
    }

<<<<<<< HEAD
    // CHAT STREAM
=======
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
<<<<<<< HEAD
        body: JSON.stringify({ message: messageText, session_id: sessionId })
=======
        body: JSON.stringify({ message: messageText })
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      setMessages(prev => [...prev, { role: 'ai', text: '' }])
      setLoading(false)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
<<<<<<< HEAD

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const token = line.slice(6)

            if (token === '[DONE]') break

=======
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const token = line.slice(6)
            if (token === '[DONE]') break
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
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
<<<<<<< HEAD

    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: 'Error connecting to server.' }
      ])
=======
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to server.' }])
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-window">
      <div className="chat-messages">

<<<<<<< HEAD
=======
        {/* Hero — shown when no messages */}
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
        {messages.length === 0 && !loading && (
          <div className="hero">
            <div className="hero-icon">Hey, Ready to dive in?</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}-message`}>

            {msg.role === 'ai' && (
              <div className="msg-ai">
                <div className="ai-header">
                  <div className="ai-icon">♟</div>
                  <div className="ai-label">Arena AI</div>
                </div>
                <div className="bubble-ai">
                  {msg.text.includes('<img') ? (
                    <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                  ) : (
                    <p dangerouslySetInnerHTML={{ __html: msg.text }} />
                  )}
                </div>
              </div>
            )}

            {msg.role === 'user' && (
              <div className="msg-user">
                <div className="msg-label">Commander</div>
                <div className="bubble-user">{msg.text}</div>
              </div>
            )}

          </div>
        ))}

        {loading && (
          <div className="msg-ai">
            <div className="ai-header">
              <div className="ai-icon">♟</div>
              <div className="ai-label">Arena AI</div>
            </div>
            <div className="bubble-ai">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

<<<<<<< HEAD
      {/* INPUT */}
=======
      {/* Input */}
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
      <div className="chat-input-area">
        {uploadedFile && (
          <div className="file-preview">
            <span className="file-icon">📄</span>
            <span className="file-name">{uploadedFile.filename}</span>
            <button className="file-remove" onClick={removeFile}>✕</button>
          </div>
        )}

        <div className="input-wrapper">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
<<<<<<< HEAD

          <button
            className="attach-btn"
            onClick={() => fileInputRef.current.click()}
          >
            📎
          </button>

          <textarea
            placeholder="Ask anything..."
=======
          <button
            className="attach-btn"
            onClick={() => fileInputRef.current.click()}
            title="Attach file"
          >
            📎
          </button>
          <textarea
            placeholder="Describe the board state or ask for a tactic…"
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
<<<<<<< HEAD

          <button className="send-btn" onClick={handleSend} disabled={loading}>
            ↑
          </button>
        </div>
=======
          <button className="send-btn" onClick={handleSend} disabled={loading}>↑</button>
        </div>
        <p className="disclaimer">STRATEGY ENGINE V3.0.1 · PRECISION TRAINING MODE</p>
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
      </div>
    </div>
  )
}

export default ChatWindow