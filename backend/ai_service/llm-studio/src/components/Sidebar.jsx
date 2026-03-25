import React from 'react'
import './Sidebar.css'

function Sidebar({ onNewChat, sessions, activeSession, onSelectSession }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-title">Tic-Tac-Toe Arena</div>
        <div className="brand-sub">Grandmaster Strategist</div>
      </div>

      <button className="btn-new-chat" onClick={onNewChat}>
        + New Chat
      </button>

      <div className="session-list">
        {sessions.map(session => (
          <div
            key={session.session_id}
            className={`session-item ${session.session_id === activeSession ? 'active-session' : ''}`}
            onClick={() => onSelectSession(session.session_id)}
          >
            💬 {session.title}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">🧑</div>
          <div>
            <div className="user-name">BRAHIM</div>
            <div className="user-rank">Rank #42</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar