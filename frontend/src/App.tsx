import { useState } from 'react'
import Canvas from './components/Canvas'
import UsernameModal from './components/UsernameModal'
import { useWebSocket } from './hooks/useWebSocket'
import { getStoredUsername, setStoredUsername } from './lib/storage'
import './App.css'

export default function App() {
  const [username, setUsername] = useState(getStoredUsername)
  const { connected, socket, wsRef } = useWebSocket()

  if (!username) {
    return (
      <UsernameModal
        defaultUsername=""
        onConfirm={(name) => {
          setStoredUsername(name)
          setUsername(name)
        }}
      />
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>SyncSketch</h1>
        <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '● Connected' : '○ Disconnected'}
        </span>
      </header>
      <main className="main">
        <Canvas socket={socket} wsRef={wsRef} username={username} />
      </main>
    </div>
  )
}
