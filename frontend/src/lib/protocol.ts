/**
 * WebSocket wire protocol (matches PLAN.md and server).
 */

import type { Shape } from './shapes'

export interface AddShapeMessage {
  type: 'ADD_SHAPE'
  shape: Shape
}

export interface MoveShapeMessage {
  type: 'MOVE_SHAPE'
  id: string
  dx: number
  dy: number
}

export interface SyncBoardMessage {
  type: 'SYNC_BOARD'
  shapes: Shape[]
}

export type ServerMessage =
  | AddShapeMessage
  | MoveShapeMessage
  | SyncBoardMessage

export function isAddShapeMessage(m: ServerMessage): m is AddShapeMessage {
  return m.type === 'ADD_SHAPE'
}

export function isMoveShapeMessage(m: ServerMessage): m is MoveShapeMessage {
  return m.type === 'MOVE_SHAPE'
}

export function isSyncBoardMessage(m: ServerMessage): m is SyncBoardMessage {
  return m.type === 'SYNC_BOARD'
}
