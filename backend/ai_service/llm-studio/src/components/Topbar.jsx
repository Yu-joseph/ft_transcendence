import React from 'react'
import './Topbar.css'

function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-workspace">Workspace</span>
        <span className="topbar-separator">&gt;</span>
        <span className="topbar-model">llama-3.3 </span>
      </div>

      <div className="topbar-right">
        <button className="inject-btn">
        Inject Game State
        </button>
        <button className="topbar-menu">⋮</button>
      </div>
    </header>
  )
}

export default Topbar