import { useRef, useEffect, useState, useCallback } from 'react'
import {
  createLineShape,
  DEFAULT_STROKE_COLOR,
  DEFAULT_STROKE_THICKNESS,
  type Shape,
  type Point,
} from '../lib/shapes'
import { hitTestShapes } from '../lib/hitTest'
import {
  isAddShapeMessage,
  isMoveShapeMessage,
  isSyncBoardMessage,
  type ServerMessage,
} from '../lib/protocol'
import './Canvas.css'

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  selected?: boolean
): void {
  if (shape.type !== 'line' || !shape.points.length) return
  ctx.strokeStyle = shape.color
  ctx.lineWidth = shape.thickness
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (selected) {
    ctx.shadowColor = 'rgba(255,255,255,0.8)'
    ctx.shadowBlur = 4
  }
  ctx.beginPath()
  const [first, ...rest] = shape.points
  ctx.moveTo(first[0], first[1])
  for (const [x, y] of rest) {
    ctx.lineTo(x, y)
  }
  ctx.stroke()
  if (selected) {
    ctx.shadowBlur = 0
  }
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

interface DragState {
  shapeId: string
  startX: number
  startY: number
  originalPoints: Point[]
}

interface CanvasProps {
  socket: WebSocket | null
  wsRef: React.RefObject<WebSocket | null>
}

export default function Canvas({ socket, wsRef }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shapes, setShapes] = useState<Shape[]>([])
  const [currentStroke, setCurrentStroke] = useState<Point[] | null>(null)
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const isDrawingRef = useRef(false)
  const dragStateRef = useRef<DragState | null>(null)
  const currentStrokeRef = useRef<Point[] | null>(null)

  const getCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return [e.clientX - rect.left, e.clientY - rect.top]
  }, [])

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
          setShapes((s) =>
            s.some((sh) => sh.id === shape.id) ? s : [...s, shape]
          )
        }
        if (isMoveShapeMessage(msg)) {
          setShapes((s) =>
            s.map((sh) =>
              sh.id === msg.id
                ? {
                    ...sh,
                    points: sh.points.map(([x, y]) => [
                      x + msg.dx,
                      y + msg.dy,
                    ]) as Point[],
                  }
                : sh
            )
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
      drawShape(ctx, shape, shape.id === selectedShapeId)
    }
    if (currentStroke?.length) {
      drawStroke(ctx, currentStroke)
    }
  }, [shapes, currentStroke, selectedShapeId])

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getCoordinates(e)
      if (!coords) return
      isDrawingRef.current = true
      currentStrokeRef.current = [coords]
      setCurrentStroke([coords])
    },
    [getCoordinates]
  )

  const startDrag = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>, shape: Shape) => {
      const coords = getCoordinates(e)
      if (!coords) return
      setSelectedShapeId(shape.id)
      dragStateRef.current = {
        shapeId: shape.id,
        startX: coords[0],
        startY: coords[1],
        originalPoints: shape.points.map(([x, y]) => [x, y] as Point),
      }
    },
    [getCoordinates]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getCoordinates(e)
      if (!coords) return
      const hit = hitTestShapes(shapes, coords)
      if (hit) {
        startDrag(e, hit)
      } else {
        setSelectedShapeId(null)
        startDrawing(e)
      }
    },
    [getCoordinates, shapes, startDrag, startDrawing]
  )

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const drag = dragStateRef.current
      if (drag) {
        const coords = getCoordinates(e)
        if (!coords) return
        const dx = coords[0] - drag.startX
        const dy = coords[1] - drag.startY
        setShapes((s) =>
          s.map((sh) =>
            sh.id === drag.shapeId
              ? {
                  ...sh,
                  points: drag.originalPoints.map(([x, y]) => [
                    x + dx,
                    y + dy,
                  ]) as Point[],
                }
              : sh
          )
        )
        return
      }
      if (!isDrawingRef.current) return
      const coords = getCoordinates(e)
      if (!coords) return
      const next = currentStrokeRef.current
        ? [...currentStrokeRef.current, coords]
        : [coords]
      currentStrokeRef.current = next
      setCurrentStroke(next)
    },
    [getCoordinates]
  )

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    const points = currentStrokeRef.current
    currentStrokeRef.current = null
    setCurrentStroke(null)
    if (points && points.length >= 2) {
      const shape = createLineShape(points)
      setShapes((s) => [...s, shape])
      const ws = wsRef.current
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ADD_SHAPE', shape }))
      }
    }
  }, [wsRef])

  const stopDrag = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => { 
      const drag = dragStateRef.current
      if (!drag) return
      const coords = getCoordinates(e)
      if (!coords) {
        dragStateRef.current = null
        return
      }
      const dx = coords[0] - drag.startX
      const dy = coords[1] - drag.startY
      dragStateRef.current = null
      if (dx === 0 && dy === 0) return
      const ws = wsRef.current
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'MOVE_SHAPE', id: drag.shapeId, dx, dy }))
      }
    },
    [getCoordinates, wsRef]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (dragStateRef.current) {
        stopDrag(e)
      } else {
        stopDrawing()
      }
    },
    [stopDrag, stopDrawing]
  )

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (dragStateRef.current) {
        stopDrag(e)
      } else {
        stopDrawing()
      }
    },
    [stopDrag, stopDrawing]
  )

  return (
    <canvas
      ref={canvasRef}
      className="canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={draw}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  )
}
