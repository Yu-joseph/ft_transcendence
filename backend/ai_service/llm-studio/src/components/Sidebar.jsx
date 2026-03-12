import React from 'react'
import './Sidebar.css'

function Sidebar({ onNewChat, sessions, activeSession, onSelectSession }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">LLM</div>
        <div>
          <h2>LLM Studio</h2>
          <span>Tic-Tac-Toe AI Engine</span>
        </div>
      </div>

      <button className="new-session-btn" onClick={onNewChat}>
        + New Chat
      </button>

      <div className="session-list">
        {sessions.length === 0 && (
          <p className="session-empty">No chats yet</p>
        )}

        {sessions.map(session => (
          <div
            key={session.session_id}
            className={`session-item ${session.session_id === activeSession ? 'active' : ''}`}
            onClick={() => onSelectSession(session.session_id)}
          >
            💬 {session.title}
          </div>
        ))}
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">A</div>
        <div>
          <p className="user-name">BRAHIM</p>
          <span className="user-plan">Go  </span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar