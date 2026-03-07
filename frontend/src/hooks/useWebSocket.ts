import { useEffect, useState, useRef } from 'react'

function getWsUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.hostname
  const port = import.meta.env.DEV ? '8080' : window.location.port
  return `${protocol}//${host}:${port}/ws`
}

export function useWebSocket(): {
  connected: boolean
  wsRef: React.RefObject<WebSocket | null>
} {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const connect = () => {
      const url = getWsUrl()
      const ws = new WebSocket(url)

      ws.onopen = () => setConnected(true)
      ws.onclose = () => {
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
    }
  }, [])

  return { connected, wsRef }
}
