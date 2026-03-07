# SyncSketch

Real-time collaborative whiteboard — draw, edit, and sync on a shared canvas.

## Day 1 — Local setup

**Run the backend (Go):**
```bash
cd server
go run .
```
Server listens on `http://localhost:8080` and WebSocket at `ws://localhost:8080/ws`.

**Run the frontend (Vite + React):**
```bash
cd frontend
npm run dev
```
Open http://localhost:5173 — you can draw on the canvas; the header shows **● Connected** when the WebSocket is active.