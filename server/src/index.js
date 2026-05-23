require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const apiRouter = require('./routes/api');
const { createAdminRouter } = require('./routes/admin');
const { GameManager } = require('./game/GameManager');
const { registerSocketHandlers } = require('./socket/handlers');
const { buildAllowedOrigins, createOriginChecker } = require('./lib/origins');

const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = buildAllowedOrigins(isProd);
const isAllowedOrigin = createOriginChecker(allowedOrigins);

function corsOrigin(origin, callback) {
  if (isAllowedOrigin(origin)) {
    callback(null, true);
    return;
  }
  callback(new Error(`CORS blocked origin: ${origin}`));
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

if (isProd) {
  if (!process.env.CLIENT_URL) {
    console.warn('WARN: CLIENT_URL is not set — player Netlify site may be blocked by CORS.');
  }
  if (!process.env.ADMIN_URL) {
    console.warn('WARN: ADMIN_URL is not set — admin Netlify site may be blocked by CORS.');
  }
  if (!process.env.ADMIN_SECRET) {
    console.warn('WARN: ADMIN_SECRET is not set — admin login will fail.');
  }
} else {
  console.log('Dev CORS origins:', allowedOrigins.join(', ') || '(localhost fallback)');
}

const app = express();
app.set('trust proxy', 1);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '100kb' }));

const gameManager = new GameManager(io);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    activeGames: gameManager.getActiveRoomCount(),
    env: isProd ? 'production' : 'development',
  });
});

app.use('/api', apiRouter);
app.use('/api/admin', createAdminRouter(gameManager));

registerSocketHandlers(io, gameManager);

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} (${isProd ? 'production' : 'development'})`);
});
