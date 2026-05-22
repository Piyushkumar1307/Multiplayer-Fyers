require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const apiRouter = require('./routes/api');
const { GameManager } = require('./game/GameManager');
const { registerSocketHandlers } = require('./socket/handlers');

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: '100kb' }));

const gameManager = new GameManager(io);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    activeGames: gameManager.getActiveRoomCount(),
  });
});

app.use('/api', apiRouter);

registerSocketHandlers(io, gameManager);

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
