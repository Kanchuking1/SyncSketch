import { useEffect, useState, useRef } from 'react'

function getWsUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.hostname
  const port = import.meta.env.DEV ? '8080' : window.location.port
  return `${protocol}//${host}:${port}/ws`
}

export function useWebSocket() {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

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
