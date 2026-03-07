package main

import "sync"

// Shape matches the client shape object (id, type, points, color, thickness).
type Shape struct {
	ID        string      `json:"id"`
	Type      string      `json:"type"`
	Points    [][2]float64 `json:"points"`
	Color     string      `json:"color"`
	Thickness float64     `json:"thickness"`
}

// Board holds shared whiteboard state in memory.
type Board struct {
	mu     sync.RWMutex
	shapes []Shape
}

func newBoard() *Board {
	return &Board{shapes: make([]Shape, 0)}
}

func (b *Board) AddShape(s Shape) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.shapes = append(b.shapes, s)
}

func (b *Board) Shapes() []Shape {
	b.mu.RLock()
	defer b.mu.RUnlock()
	out := make([]Shape, len(b.shapes))
	copy(out, b.shapes)
	return out
}

// MoveShape translates the shape with the given id by (dx, dy). No-op if not found.
func (b *Board) MoveShape(id string, dx, dy float64) {
	b.mu.Lock()
	defer b.mu.Unlock()
	for i := range b.shapes {
		if b.shapes[i].ID == id {
			for j := range b.shapes[i].Points {
				b.shapes[i].Points[j][0] += dx
				b.shapes[i].Points[j][1] += dy
			}
			return
		}
	}
}
