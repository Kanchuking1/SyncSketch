package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type hub struct {
	mu    sync.RWMutex
	conns map[*websocket.Conn]struct{}
	board *Board
}

func newHub(board *Board) *hub {
	return &hub{
		conns: make(map[*websocket.Conn]struct{}),
		board: board,
	}
}

func (h *hub) register(conn *websocket.Conn) {
	h.mu.Lock()
	h.conns[conn] = struct{}{}
	h.mu.Unlock()
}

func (h *hub) unregister(conn *websocket.Conn) {
	h.mu.Lock()
	delete(h.conns, conn)
	h.mu.Unlock()
}

func (h *hub) broadcast(message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for conn := range h.conns {
		if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Printf("broadcast write: %v", err)
		}
	}
}

func (h *hub) broadcastExcept(exclude *websocket.Conn, message []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	for conn := range h.conns {
		if conn == exclude {
			continue
		}
		if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Printf("broadcast write: %v", err)
		}
	}
}

// Client message types.
type clientMsg struct {
	Type   string   `json:"type"`
	Shape  *Shape   `json:"shape,omitempty"`
	ID     string   `json:"id,omitempty"`
	Dx     *float64 `json:"dx,omitempty"`
	Dy     *float64 `json:"dy,omitempty"`
	UserID string   `json:"userId,omitempty"`
	X      *float64 `json:"x,omitempty"`
	Y      *float64 `json:"y,omitempty"`
}

func (h *hub) handleMessage(conn *websocket.Conn, raw []byte) {
	var msg clientMsg
	if err := json.Unmarshal(raw, &msg); err != nil {
		log.Printf("invalid JSON: %v", err)
		return
	}
	switch msg.Type {
	case "ADD_SHAPE":
		if msg.Shape == nil {
			return
		}
		h.board.AddShape(*msg.Shape)
		h.broadcast(raw)
	case "MOVE_SHAPE":
		if msg.ID == "" || msg.Dx == nil || msg.Dy == nil {
			return
		}
		h.board.MoveShape(msg.ID, *msg.Dx, *msg.Dy)
		h.broadcastExcept(conn, raw)
	case "CURSOR_UPDATE":
		if msg.UserID == "" || msg.X == nil || msg.Y == nil {
			return
		}
		h.broadcastExcept(conn, raw)
	default:
		// ignore unknown types
	}
}

var defaultHub *hub

func init() {
	defaultHub = newHub(newBoard())
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("websocket upgrade: %v", err)
		return
	}
	defer conn.Close()

	defaultHub.register(conn)
	defer defaultHub.unregister(conn)

	log.Printf("client connected: %s", r.RemoteAddr)

	// Send current board state to the new client.
	syncMsg := struct {
		Type   string  `json:"type"`
		Shapes []Shape `json:"shapes"`
	}{
		Type:   "SYNC_BOARD",
		Shapes: defaultHub.board.Shapes(),
	}
	syncPayload, _ := json.Marshal(syncMsg)
	if err := conn.WriteMessage(websocket.TextMessage, syncPayload); err != nil {
		log.Printf("sync write: %v", err)
	}

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("read error: %v", err)
			}
			break
		}
		defaultHub.handleMessage(conn, message)
	}
}
