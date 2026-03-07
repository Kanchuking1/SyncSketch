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
