import { useRef, useEffect, useState } from 'react'
import Canvas from './components/Canvas'
import { useWebSocket } from './hooks/useWebSocket'
import './App.css'

function App() {
  const { connected } = useWebSocket()

  return (
    <div className="app">
      <header className="header">
        <h1>SyncSketch</h1>
        <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '● Connected' : '○ Disconnected'}
        </span>
      </header>
      <main className="main">
        <Canvas />
      </main>
    </div>
  )
}

export default App
