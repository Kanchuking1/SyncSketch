/**
 * Hit detection for line (polyline) shapes: distance from point to segment.
 */

import type { Shape, Point } from './shapes'

const HIT_THRESHOLD = 8

function sq(x: number): number {
  return x * x
}

/** Squared distance from point (px, py) to segment (x1,y1)-(x2,y2). */
function pointToSegmentSq(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1
  const dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return sq(px - x1) + sq(py - y1)
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const projX = x1 + t * dx
  const projY = y1 + t * dy
  return sq(px - projX) + sq(py - projY)
}

/** True if (px, py) is within HIT_THRESHOLD of the polyline. */
export function hitTestShape(shape: Shape, px: number, py: number): boolean {
  if (shape.type !== 'line' || shape.points.length < 2) return false
  const pts = shape.points
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    if (pointToSegmentSq(px, py, x1, y1, x2, y2) <= HIT_THRESHOLD * HIT_THRESHOLD) {
      return true
    }
  }
  return false
}

/**
 * Return the topmost shape (last in list) that contains the point, or null.
 */
export function hitTestShapes(shapes: Shape[], point: Point): Shape | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (hitTestShape(shapes[i], point[0], point[1])) return shapes[i]
  }
  return null
}
