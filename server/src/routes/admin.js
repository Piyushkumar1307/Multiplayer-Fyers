const express = require('express');
const crypto = require('crypto');
const { prisma } = require('../lib/prisma');
const { requireAdmin } = require('../middleware/adminAuth');
const { generateUniqueRoomCode } = require('../lib/roomCode');
const { getSystemHostId } = require('../lib/systemHost');
const { normalizePortfolio } = require('../lib/portfolio');
const { MAX_PLAYERS, MIN_PLAYERS_TO_START } = require('../constants/stocks');

function createAdminRouter(gameManager) {
  const router = express.Router();

  router.post('/login', (req, res) => {
    const secret = process.env.ADMIN_SECRET;
    if (!secret) {
      return res.status(503).json({ error: 'Admin access is not configured' });
    }

    const password = String(req.body?.password || '');
    const a = Buffer.from(password);
    const b = Buffer.from(secret);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.json({ token: secret });
  });

  router.use(requireAdmin);

  router.get('/rooms', async (_req, res) => {
    try {
      const rooms = await prisma.room.findMany({
        include: {
          _count: { select: { players: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(
        rooms.map((r) => ({
          code: r.code,
          label: r.label,
          status: r.status,
          playerCount: r._count.players,
          maxPlayers: MAX_PLAYERS,
          createdAt: r.createdAt,
          closedAt: r.closedAt,
          winnerName: r.winnerName,
          winnerProfitLoss: r.winnerProfitLoss,
        })),
      );
    } catch (err) {
      console.error('admin list rooms', err);
      res.status(500).json({ error: 'Failed to list rooms' });
    }
  });

  router.post('/rooms', async (req, res) => {
    try {
      const label = String(req.body?.label || '').trim() || null;
      const hostId = await getSystemHostId();
      const code = await generateUniqueRoomCode();

      const room = await prisma.room.create({
        data: {
          code,
          label,
          hostId,
        },
      });

      res.json({ roomCode: room.code, label: room.label, status: room.status });
    } catch (err) {
      console.error('admin create room', err);
      res.status(500).json({ error: 'Failed to create room' });
    }
  });

  router.get('/rooms/:code', async (req, res) => {
    try {
      const code = String(req.params.code || '')
        .trim()
        .toUpperCase();

      const room = await prisma.room.findUnique({
        where: { code },
        include: {
          players: {
            include: { player: { select: { id: true, name: true, phone: true } } },
            orderBy: { joinedAt: 'asc' },
          },
        },
      });

      if (!room) return res.status(404).json({ error: 'Room not found' });

      const game = gameManager.getGame(code);

      res.json({
        room: {
          code: room.code,
          label: room.label,
          status: room.status,
          playerCount: room.players.length,
          maxPlayers: MAX_PLAYERS,
          minPlayersToStart: MIN_PLAYERS_TO_START,
          isLive: Boolean(game),
          phase: game?.phase || null,
          closedAt: room.closedAt,
          winner: room.winnerName
            ? {
                name: room.winnerName,
                profitLoss: room.winnerProfitLoss,
              }
            : null,
        },
        standings: gameManager.buildStandingsFromRows(room.players, game?.prices),
      });
    } catch (err) {
      console.error('admin get room', err);
      res.status(500).json({ error: 'Failed to fetch room' });
    }
  });

  router.get('/rooms/:code/standings', async (req, res) => {
    try {
      const code = String(req.params.code || '')
        .trim()
        .toUpperCase();

      const standings = await gameManager.fetchStandings(code);
      if (!standings) return res.status(404).json({ error: 'Room not found' });

      res.json({ roomCode: code, standings });
    } catch (err) {
      console.error('admin standings', err);
      res.status(500).json({ error: 'Failed to fetch standings' });
    }
  });

  router.post('/rooms/:code/start', async (req, res) => {
    try {
      const code = String(req.params.code || '')
        .trim()
        .toUpperCase();

      const result = await gameManager.startGameAsAdmin(code);
      if (result?.error) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, roomCode: code });
    } catch (err) {
      console.error('admin start game', err);
      res.status(500).json({ error: 'Failed to start game' });
    }
  });

  router.delete('/rooms', async (_req, res) => {
    try {
      const result = await gameManager.deleteAllRooms();
      res.json({ success: true, deletedCount: result.deletedCount });
    } catch (err) {
      console.error('admin delete all rooms', err);
      res.status(500).json({ error: 'Failed to delete rooms' });
    }
  });

  return router;
}

module.exports = { createAdminRouter };
