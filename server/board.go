package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

// Shape matches the client shape object (id, type, points, color, thickness).
type Shape struct {
	ID        string       `json:"id"`
	Type      string       `json:"type"`
	Points    [][2]float64 `json:"points"`
	Color     string       `json:"color"`
	Thickness float64      `json:"thickness"`
}

// Board holds shared whiteboard state in memory and optionally persists to file.
type Board struct {
	mu     sync.RWMutex
	path   string
	shapes []Shape
}

func newBoard() *Board {
	return &Board{shapes: make([]Shape, 0)}
}

// LoadBoard reads shapes from a JSON file and returns a Board. Returns empty board on missing file or error.
func LoadBoard(path string) *Board {
	data, err := os.ReadFile(path)
	if err != nil {
		return &Board{path: path, shapes: make([]Shape, 0)}
	}
	var shapes []Shape
	if err := json.Unmarshal(data, &shapes); err != nil {
		return &Board{path: path, shapes: make([]Shape, 0)}
	}
	return &Board{path: path, shapes: shapes}
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

// Save writes the current shapes to the board's path. No-op if path is empty.
func (b *Board) Save() error {
	if b.path == "" {
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(b.path), 0755); err != nil {
		return err
	}
	b.mu.RLock()
	data, err := json.MarshalIndent(b.shapes, "", "  ")
	b.mu.RUnlock()
	if err != nil {
		return err
	}
	return os.WriteFile(b.path, data, 0644)
}
