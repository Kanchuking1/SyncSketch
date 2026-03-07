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

// Client message types (we only handle ADD_SHAPE for Day 3).
type clientMsg struct {
	Type  string `json:"type"`
	Shape *Shape `json:"shape,omitempty"`
}

func (h *hub) handleMessage(conn *websocket.Conn, raw []byte) {
	var msg clientMsg
	if err := json.Unmarshal(raw, &msg); err != nil {
		log.Printf("invalid JSON: %v", err)
		return
	}
	switch msg.Type {
	case "ADD_SHAPE":
		// Print who sent the message
		if msg.Shape == nil {
			return
		}
		h.board.AddShape(*msg.Shape)
		// Log the shape counts
		h.broadcast(raw)
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
