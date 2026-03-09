# SyncSketch

V0 Real-time collaborative whiteboard — draw, edit, and sync on a shared canvas.

## Local setup

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

## Deployment (Day 7)

See **[DEPLOY.md](./DEPLOY.md)** for deploying the backend (Fly.io or Render) and frontend (Vercel), configuring the production WebSocket URL, and publishing a demo link.