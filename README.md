# Multiplayer Stock Market Simulator

Browser-based multiplayer stock trading simulator (fictional stocks, virtual ₹10,000).

## Structure

```
/client   → Player app (React + Vite) — Netlify
/admin    → Admin dashboard (React + Vite) — Netlify
/server   → API + Socket.io + game engine — Render
```

## Local development

### 1. Server

```bash
cp server/.env.example server/.env
# Edit DATABASE_URL, ADMIN_SECRET, etc.

cd server
npm install
npm run db:setup
npm run dev
```

Runs at **http://localhost:4000**

### 2. Player app

```bash
cp client/.env.example client/.env
cd client && npm install && npm run dev
```

**http://localhost:5173**

### 3. Admin panel

```bash
cp admin/.env.example admin/.env
cd admin && npm install && npm run dev
```

**http://localhost:5174** — login with `ADMIN_SECRET` from `server/.env`

### Flow

1. Admin creates a room → shares 4-letter code  
2. Players register → enter code → wait  
3. Admin starts game → live P&amp;L on admin dashboard  
4. Game runs → results → back to lobby  

---

## Production deploy

### Render (backend)

1. New **Web Service** → connect repo → **Root directory:** `server`
2. **Build command:** `npm install && npm run build`
3. **Start command:** `npm start`
4. **Environment variables:**

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon PostgreSQL URL |
| `SESSION_SECRET` | long random string |
| `ADMIN_SECRET` | admin login password |
| `CLIENT_URL` | `https://your-player.netlify.app` |
| `ADMIN_URL` | `https://your-admin.netlify.app` |

No trailing slashes on URLs. Use `ALLOWED_ORIGINS` for extra Netlify preview URLs (comma-separated).

Health check: `GET /api/health`

Or use the included `render.yaml` blueprint.

### Netlify (player app)

**Option A — Git connect**

- Base directory: `client`
- Build: `npm run build`
- Publish: `dist`
- Env (build time): `VITE_API_URL`, `VITE_SOCKET_URL` → your Render URL

**Option B — Drag & drop**

```bash
cd client
# set VITE_* in .env first
npm run build
# upload client/dist to Netlify Drop
```

`client/netlify.toml` and `client/public/_redirects` handle SPA routing.

### Netlify (admin app)

Same as player, but base directory **`admin`**.

```bash
cd admin
# set VITE_API_URL and VITE_SOCKET_URL to Render URL
npm run build
# upload admin/dist
```

---

## Env checklist (production)

| Where | Variable | Points to |
|-------|----------|-----------|
| Render | `CLIENT_URL` | Player Netlify URL |
| Render | `ADMIN_URL` | Admin Netlify URL |
| Render | `ADMIN_SECRET` | Admin password |
| Netlify (client) | `VITE_API_URL` | Render URL |
| Netlify (client) | `VITE_SOCKET_URL` | Render URL |
| Netlify (admin) | `VITE_API_URL` | Render URL |
| Netlify (admin) | `VITE_SOCKET_URL` | Render URL |

After changing Render env vars → **Manual Deploy**.  
After changing Netlify env vars → **Rebuild** (Vite bakes env at build time).

---

## Scripts (server)

| Script | Description |
|--------|-------------|
| `npm run dev` | API + Socket.io (nodemon) |
| `npm run build` | `prisma db push` + seed (Render) |
| `npm start` | Production server |
| `npm run db:setup` | Local schema push + seed |

## Stocks

AERO, GRNV, NXBK, PHRX — starting price ₹100 each.
