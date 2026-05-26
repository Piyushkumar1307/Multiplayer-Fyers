# Multiplayer Stock Market Simulator

Browser-based multiplayer stock trading simulator (fictional stocks, virtual ₹10,000).

## Structure

```
/client   → Player app (React + Vite) — served at /
/admin    → Admin dashboard (React + Vite) — served at /admin/
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

**http://localhost:5174/admin/** — login with `ADMIN_SECRET` from `server/.env`

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
| `CLIENT_URL` | `https://your-site.netlify.app` (same URL if using subpaths) |
| `ADMIN_URL` | `https://your-site.netlify.app` (or separate admin site URL) |

No trailing slashes on URLs. Use `ALLOWED_ORIGINS` for extra Netlify preview URLs (comma-separated).

Health check: `GET /api/health`

Or use the included `render.yaml` blueprint.

### Netlify (player + admin on one site) — recommended

Deploy from the **repository root** (not `client/` or `admin/` alone).

| Setting | Value |
|---------|--------|
| Base directory | *(leave empty — repo root)* |
| Build command | `npm run build:web` |
| Publish directory | `client/dist` |

**URLs after deploy**

- Player: `https://your-site.netlify.app/`
- Admin: `https://your-site.netlify.app/admin/`

**Netlify build env** (Site settings → Environment variables):

| Key | Value |
|-----|--------|
| `VITE_API_URL` | Your Render API URL |
| `VITE_SOCKET_URL` | Same Render URL |

Vite picks these up for **both** client and admin builds.

**Local combined build (test before deploy):**

```bash
# optional: client/.env.production and admin/.env.production with VITE_*
npm run build:web:local
npx serve client/dist
# open http://localhost:3000/ and http://localhost:3000/admin/
```

Root `netlify.toml` handles SPA redirects for `/` and `/admin/*`.

### Netlify (legacy — separate sites)

- Player only: base directory `client`, publish `dist`
- Admin only: base directory `admin`, publish `dist`

---

## Env checklist (production)

| Where | Variable | Points to |
|-------|----------|-----------|
| Render | `CLIENT_URL` | Netlify site URL (no trailing slash) |
| Render | `ADMIN_URL` | Same URL if using `/admin/` subpath |
| Render | `ADMIN_SECRET` | Admin password |
| Netlify | `VITE_API_URL` | Render URL (build time, both apps) |
| Netlify | `VITE_SOCKET_URL` | Render URL (build time, both apps) |

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
