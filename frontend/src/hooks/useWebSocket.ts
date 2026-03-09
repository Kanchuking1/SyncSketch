import { useEffect, useState, useRef } from 'react'

function getWsUrl(): string {
  const envUrl = import.meta.env.VITE_WS_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('ws')) {
    return envUrl
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.hostname
  const port = import.meta.env.DEV ? '8080' : window.location.port
  const withPort = port ? `${host}:${port}` : host
  return `${protocol}//${withPort}/ws`
}

export function useWebSocket(): {
  connected: boolean
  socket: WebSocket | null
  wsRef: React.RefObject<WebSocket | null>
} {
  const [connected, setConnected] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const connect = () => {
      const url = getWsUrl()
      const ws = new WebSocket(url)

      ws.onopen = () => {
        wsRef.current = ws
        setSocket(ws)
        setConnected(true)
      }
      ws.onclose = () => {
        wsRef.current = null
        setSocket(null)
        setConnected(false)
        reconnectTimeoutRef.current = setTimeout(connect, 2000)
      }
      ws.onerror = () => {}

      wsRef.current = ws
    }

    connect()
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (wsRef.current) wsRef.current.close()
      wsRef.current = null
      setSocket(null)
      setConnected(false)
    }
  }, [])

  return { connected, socket, wsRef }
}
