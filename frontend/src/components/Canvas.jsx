import { useRef, useEffect, useState, useCallback } from 'react'
import './Canvas.css'

export default function Canvas() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPointRef = useRef(null)

  const getCoordinates = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.scale(dpr, dpr)
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const startDrawing = useCallback(
    (e) => {
      const coords = getCoordinates(e)
      if (!coords) return
      lastPointRef.current = coords
      setIsDrawing(true)
    },
    [getCoordinates]
  )

  const draw = useCallback(
    (e) => {
      if (!isDrawing) return
      const coords = getCoordinates(e)
      if (!coords || !lastPointRef.current) return

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
      ctx.lineTo(coords.x, coords.y)
      ctx.stroke()

      lastPointRef.current = coords
    },
    [isDrawing, getCoordinates]
  )

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
    lastPointRef.current = null
  }, [])

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
