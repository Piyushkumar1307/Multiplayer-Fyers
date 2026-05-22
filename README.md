# Multiplayer Stock Market Simulator

Browser-based multiplayer stock trading simulator (fictional stocks, virtual money).

## Structure

```
/client        → React (Vite) + TailwindCSS
/server        → Node.js + Express + Socket.io
/server/prisma → PostgreSQL schema (Prisma)
```

## Prerequisites

- Node.js 18+
- PostgreSQL (e.g. [Neon](https://neon.tech) for hosted DB)

## Setup

### 1. Database

Copy env files and set your connection string:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` with your `DATABASE_URL`, `SESSION_SECRET`, etc.

### 2. Server

```bash
cd server
npm install
npm run db:setup   # pushes schema to DB + seeds news cards
npm run dev
```

Use `db:setup` instead of `db:migrate` if migrate hangs asking for a migration name.

Server runs at `http://localhost:4000`. **Registration will fail with no response until this is running.**

### 3. Client

```bash
cd client
npm install
npm run dev
```

Client runs at `http://localhost:5173`.

Seed news cards (required before playing):

```bash
cd server && npm run db:seed
```

## App routes

| Path | Screen |
|------|--------|
| `/` | Registration (name + phone) |
| `/lobby` | Create / join room |
| `/room/:code` | Waiting room |
| `/game/:roomCode` | News + trading (1 round) |

**Multiple rooms:** Yes — each lobby “Create Room” gets a unique 4-letter code. Many rooms can be `WAITING` or `ACTIVE` at the same time; game state is isolated per room in the database and in server memory (`GameManager.activeGames`).
| `/results/:roomCode` | Final leaderboard |

## Scripts (server)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API + Socket.io with nodemon |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Apply migrations (dev) |
| `npm run db:push` | Push schema without migration files |
| `npm run db:seed` | Seed news cards (placeholder) |

## Stocks

| Ticker | Name |
|--------|------|
| AERO | AeroCore |
| GRNV | GreenVolt |
| NXBK | NexBank |
| PHRX | PharmaX |

Starting price: ₹100 each.
