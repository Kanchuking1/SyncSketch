import { useRef, useEffect, useState, useCallback } from 'react'
import {
  createLineShape,
  DEFAULT_STROKE_COLOR,
  DEFAULT_STROKE_THICKNESS,
  type Shape,
  type Point,
} from '../lib/shapes'
import {
  isAddShapeMessage,
  isSyncBoardMessage,
  type ServerMessage,
} from '../lib/protocol'
import './Canvas.css'

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape): void {
  if (shape.type !== 'line' || !shape.points.length) return
  ctx.strokeStyle = shape.color
  ctx.lineWidth = shape.thickness
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  const [first, ...rest] = shape.points
  ctx.moveTo(first[0], first[1])
  for (const [x, y] of rest) {
    ctx.lineTo(x, y)
  }
  ctx.stroke()
}

function drawStroke(ctx: CanvasRenderingContext2D, points: Point[]): void {
  if (!points.length) return
  ctx.strokeStyle = DEFAULT_STROKE_COLOR
  ctx.lineWidth = DEFAULT_STROKE_THICKNESS
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1])
  }
  ctx.stroke()
}

interface CanvasProps {
  socket: WebSocket | null
  wsRef: React.RefObject<WebSocket | null>
}

export default function Canvas({ socket, wsRef }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shapes, setShapes] = useState<Shape[]>([])
  const [currentStroke, setCurrentStroke] = useState<Point[] | null>(null)
  const isDrawingRef = useRef(false)

  const getCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return [e.clientX - rect.left, e.clientY - rect.top]
  }, [])

  // Handle incoming WebSocket messages (ADD_SHAPE, SYNC_BOARD). Subscribe to the socket in state so we always use the current connection.
  useEffect(() => {
    if (!socket) return
    const handler = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as ServerMessage
        if (isSyncBoardMessage(msg)) {
          setShapes(msg.shapes)
          return
        }
        if (isAddShapeMessage(msg)) {
          const shape = msg.shape
          console.log('shape: ', shape)
          setShapes((s) =>
            s.some((sh) => sh.id === shape.id) ? s : [...s, shape]
          )
        }
      } catch {
        // ignore invalid JSON
      }
    }
    socket.addEventListener('message', handler)
    return () => socket.removeEventListener('message', handler)
  }, [socket])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)
    for (const shape of shapes) {
      drawShape(ctx, shape)
    }
    if (currentStroke?.length) {
      drawStroke(ctx, currentStroke)
    }
  }, [shapes, currentStroke])

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getCoordinates(e)
      if (!coords) return
      isDrawingRef.current = true
      setCurrentStroke([coords])
    },
    [getCoordinates]
  )

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return
      const coords = getCoordinates(e)
      if (!coords) return
      setCurrentStroke((prev) => (prev ? [...prev, coords] : [coords]))
    },
    [getCoordinates]
  )

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    setCurrentStroke((prev) => {
      if (!prev || prev.length < 2) return null
      const shape = createLineShape(prev, { id: `shape_${Date.now()}_${shapes.length}` })
      setShapes((s) => [...s, shape])
      const ws = wsRef.current
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ADD_SHAPE', shape }))
      }
      return null
    })
  }, [wsRef])

  return (
    <canvas
      ref={canvasRef}
      className="canvas"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  )
}
