# SyncSketch — Deployment (Day 7)

Deploy the backend (Go + WebSocket) and frontend (Vite + React) so the app is publicly accessible.

---

## Overview

| Part      | Suggested platform | Notes                          |
|-----------|--------------------|---------------------------------|
| Backend   | **Fly.io** or Render | WebSocket support, PORT env   |
| Frontend  | **Vercel**         | Static + env for WebSocket URL |

After deployment you will have:

- Backend: `https://your-app.fly.dev` (or Render URL)
- Frontend: `https://your-app.vercel.app`
- WebSocket: `wss://your-app.fly.dev/ws`

---

## 1. Deploy backend (Fly.io)

### Prerequisites

- [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
- Fly.io account

### Steps

```bash
cd server
fly launch
```

- Choose app name (e.g. `syncsketch-api`) or use existing.
- Pick a region.
- Do **not** add a Postgres or Redis; we use file-based board persistence.

Then deploy:

```bash
fly deploy
```

Note the app URL, e.g. `https://syncsketch-api.fly.dev`. The WebSocket URL is:

**`wss://syncsketch-api.fly.dev/ws`**

### Optional: persist board across deploys

```bash
fly volumes create syncsketch_data --region <your-region>
```

Then in `fly.toml` uncomment the `[mounts]` section and set `destination = "/app/data"`. The server already uses `data/board.json` under the working dir, so ensure the app runs with `WORKDIR /app` (as in the Dockerfile) and the volume is mounted at `/app/data`.

---

## 2. Deploy backend (Render, alternative)

1. Create a **Web Service**.
2. Connect the repo; set **Root Directory** to `server`.
3. Build: **Docker** (use existing `server/Dockerfile`) or **Native**:
   - Build: `go build -o syncsketch .`
   - Start: `./syncsketch`
4. Set env var: **PORT** = `8080` (or leave unset; Render sets PORT automatically).
5. Deploy. Note the service URL; WebSocket will be `wss://<your-service>.onrender.com/ws`.

---

## 3. Deploy frontend (Vercel)

### Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) or use the Vercel dashboard
- Backend WebSocket URL from step 1 or 2

### Steps

1. **Set production WebSocket URL**

   In the project root (or in Vercel dashboard → Project → Settings → Environment Variables), add:

   - **Name:** `VITE_WS_URL`
   - **Value:** `wss://syncsketch-api.fly.dev/ws` (replace with your backend WebSocket URL)
   - **Environment:** Production (and Preview if you want)

2. **Deploy**

   From repo root:

   ```bash
   cd frontend
   npm run build
   ```

   Then either:

   - **CLI:** From repo root run `vercel` and follow prompts (set root to `frontend` if asked), or
   - **Dashboard:** Import the repo, set **Root Directory** to `frontend`, add `VITE_WS_URL`, then deploy.

3. Vercel will serve the built app; open the given URL (e.g. `https://syncsketch.vercel.app`).

---

## 4. Configure production WebSocket URL

The frontend uses `VITE_WS_URL` at **build time**. So:

- **Vercel:** Set `VITE_WS_URL` in the project’s Environment Variables, then redeploy.
- **Local production build:** Create `frontend/.env.production`:

  ```env
  VITE_WS_URL=wss://syncsketch-api.fly.dev/ws
  ```

  Then run `npm run build` in `frontend`.

The app will connect to the WebSocket at the URL you set; if unset, it falls back to the same host as the page and `/ws`.

---

## 5. Verify multi-user collaboration

1. Open the frontend URL in two different browsers (or one normal + one incognito).
2. Set a username in each if prompted.
3. Draw in one window; confirm strokes and moves appear in the other.
4. Confirm collaborator cursors and names appear.
5. Refresh one tab; confirm the board state is restored (and, if you use Fly volume, that it persists across backend restarts).

---

## 6. Publish demo link

- **Frontend (demo):** Share the Vercel URL, e.g. `https://syncsketch.vercel.app`.
- **Backend:** Only needed if others run their own frontend; share the backend URL and `wss://.../ws` for reference.

---

## Checklist

- [ ] Backend deployed (Fly.io or Render) and `/health` returns 200
- [ ] `VITE_WS_URL` set to `wss://<backend-host>/ws` and frontend redeployed
- [ ] Two clients can draw and see each other’s strokes and cursors
- [ ] Board state persists after refresh (and, with volume, after backend restart)
- [ ] Demo link (frontend URL) documented or shared
