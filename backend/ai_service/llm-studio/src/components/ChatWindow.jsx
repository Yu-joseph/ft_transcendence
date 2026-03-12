import React, { useState, useRef, useEffect } from 'react'
import './ChatWindow.css'

function ChatWindow({ onFirstMessage, initialMessages = [] }) {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const hasSentFirst = useRef(initialMessages.length > 0)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setUploadedFile(data)
    } catch (error) {
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
    if (uploadedFile) {
      messageText = input
        ? `[File: ${uploadedFile.filename}] ${input}`
        : `[File: ${uploadedFile.filename}]`
    }

    const userMsg = { role: 'user', text: messageText }
    setMessages(prev => [...prev, userMsg])

    if (!hasSentFirst.current && onFirstMessage) {
      onFirstMessage(messageText)
      hasSentFirst.current = true
    }

    setInput('')
    setUploadedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setLoading(true)

    // Check if image request
    const imageKeywords = [
      'generate image', 'create image', 'draw', 'make image',
      'imagine', 'visualize', 'image of', 'picture of', 'photo of',
      'generate for me image', 'show me image', 'show image',
      'generate me', 'create me', 'make me'
    ]
    const isImageRequest = imageKeywords.some(kw => messageText.toLowerCase().includes(kw))

    // Use non-streaming endpoint for images
    if (isImageRequest) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText })
        })
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'ai', text: data.content }])
      } catch (error) {
        setMessages(prev => [...prev, { role: 'ai', text: 'Error generating image.' }])
      }
      setLoading(false)
      return
    }

    // Normal streaming for text
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      })

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
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error connecting to server.' }])
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
        {messages.length === 0 && !loading && (
          <div className="empty-chat">
            <p>Start a conversation...</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}-message`}>
            {msg.role === 'ai' && <div className="ai-icon">AI</div>}
            <div className={`message-content ${msg.role}-bubble`}>
              <p dangerouslySetInnerHTML={{ __html: msg.text }} />
            </div>
            {msg.role === 'user' && <div className="user-avatar-msg">B</div>}
          </div>
        ))}

        {loading && (
          <div className="message ai-message">
            <div className="ai-icon">AI</div>
            <div className="ai-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

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
          <button
            className="attach-btn"
            onClick={() => fileInputRef.current.click()}
            title="Attach file"
          >
            📎
          </button>
          <textarea
            placeholder="Ask the AI about game logic, strategy, or code..."
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="input-right">
            <span className="token-count">{input.length}/1K</span>
            <button className="send-btn" onClick={handleSend} disabled={loading}>➤</button>
          </div>
        </div>
        <p className="disclaimer">AI can make mistakes. Consider checking important code logic.</p>
      </div>
    </div>
  )
}

export default ChatWindow