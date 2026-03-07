/**
 * WebSocket wire protocol (matches PLAN.md and server).
 */

import type { Shape } from './shapes'

export interface AddShapeMessage {
  type: 'ADD_SHAPE'
  shape: Shape
}

export interface SyncBoardMessage {
  type: 'SYNC_BOARD'
  shapes: Shape[]
}

export type ServerMessage = AddShapeMessage | SyncBoardMessage

export function isAddShapeMessage(m: ServerMessage): m is AddShapeMessage {
  return m.type === 'ADD_SHAPE'
}

export function isSyncBoardMessage(m: ServerMessage): m is SyncBoardMessage {
  return m.type === 'SYNC_BOARD'
}
