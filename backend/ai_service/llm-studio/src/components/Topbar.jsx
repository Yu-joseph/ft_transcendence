import React from 'react'
import './Topbar.css'

function Topbar() {
  return (
    <header className="topbar">
      <span className="topbar-title">Arena Command</span>
      <div className="topbar-right">
        <button className="inject-btn">Inject Game State</button>
      </div>
    </header>
  )
}

export default Topbar