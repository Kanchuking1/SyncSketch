/**
 * Shape data structures for object-based canvas rendering.
 * Matches PLAN.md: id, type, points, color, thickness.
 */

export type Point = [number, number]

export interface Shape {
  id: string
  type: 'line'
  points: Point[]
  color: string
  thickness: number
}

export interface LineShapeOptions {
  id?: string
  color?: string
  thickness?: number
}

let shapeIdCounter = 0

export function generateShapeId(): string {
  shapeIdCounter += 1
  return `shape_${String(shapeIdCounter).padStart(3, '0')}`
}

export const DEFAULT_STROKE_COLOR = '#e2e8f0'
export const DEFAULT_STROKE_THICKNESS = 2

/**
 * Create a new line shape (freehand stroke = line with many points).
 */
export function createLineShape(
  points: Point[],
  options: LineShapeOptions = {}
): Shape {
  return {
    id: options.id ?? generateShapeId(),
    type: 'line',
    points: [...points],
    color: options.color ?? DEFAULT_STROKE_COLOR,
    thickness: options.thickness ?? DEFAULT_STROKE_THICKNESS,
  }
}
