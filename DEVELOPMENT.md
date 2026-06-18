# Development & deployment (internal)

Technical setup for engineers. Client-facing overview is in [README.md](./README.md).

## Structure

```
/client   → Player app (React + Vite) — /
/admin    → Admin dashboard — /admin/
/server   → API + Socket.io + game engine
```

## Local development

### Server

```bash
cp server/.env.example server/.env
cd server && npm install && npm run db:setup && npm run dev
```

Runs at **http://localhost:4000**

### Player

```bash
cp client/.env.example client/.env
cd client && npm install && npm run dev
```

**http://localhost:5173**

### Admin

```bash
cp admin/.env.example admin/.env
cd admin && npm install && npm run dev
```

**http://localhost:5174/admin/** — `ADMIN_SECRET` from `server/.env`

## Production deploy

### Render (backend)

- Root directory: `server`
- Build: `npm install && npm run build`
- Start: `npm start`
- Env: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_SECRET`, `CLIENT_URL`, `ADMIN_URL` (no trailing slashes)
- Use **pooled** PostgreSQL URL to avoid connection `Closed` errors

### Netlify (player + admin, one site)

| Setting | Value |
|---------|--------|
| Build command | `npm run build:web` |
| Publish directory | `client/dist` |

Env at build time: `VITE_API_URL`, `VITE_SOCKET_URL` → Render URL

- Player: `/`
- Admin: `/admin/`

## Env checklist

| Where | Variable |
|-------|----------|
| Render | `CLIENT_URL`, `ADMIN_URL`, `ADMIN_SECRET`, `DATABASE_URL` |
| Netlify | `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_FIREBASE_*` (see Firebase section) |

Rebuild/redeploy after env changes.

## Scripts (server)

| Script | Description |
|--------|-------------|
| `npm run dev` | API + Socket.io |
| `npm run db:setup` | Schema + seed news cards |
| `npm start` | Production |

## Twilio Verify (phone OTP)

1. [Twilio Console](https://console.twilio.com/) → copy **Account SID** + **Auth Token** (test credentials OK)  
2. **Verify** → **Services** → **Create** → copy **Service SID** (`VA...`)  
3. **Trial:** [Phone Numbers → Verified Caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified) — only those numbers receive SMS  
4. Set on Render / `server/.env`:

| Variable | Example |
|----------|---------|
| `TWILIO_ACCOUNT_SID` | `ACd9db21e1...` |
| `TWILIO_AUTH_TOKEN` | test auth token |
| `TWILIO_VERIFY_SERVICE_SID` | `VA...` |
| `TWILIO_VERIFY_CHANNEL` | `sms` (use for trial) |

API: `POST /api/otp/send` → `POST /api/register` with `{ name, phone, code }`.

**Local without Twilio:** `OTP_VERIFY_SKIP=true` + `OTP_DEV_CODE=123456`.

Run `npm run db:push` in `server/` after pulling (adds `phoneVerifiedAt` on Player).

Players stay logged in after a game; they return to **lobby** to join the next room (no re-OTP unless session cleared).

## Game constants (code)

- `TRADING_SECONDS`: 120  
- `NEWS_EVENTS_PER_GAME`: 8  
- `MAX_PLAYERS`: 20  
- `MIN_PLAYERS_TO_START`: 1  
- Stocks: AERO, GRNV, NXBK, PHRX, OILF, AGRI  

See `server/src/constants/stocks.js` and `client/src/lib/constants.js`.
