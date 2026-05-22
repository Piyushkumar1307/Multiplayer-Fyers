const express = require('express');
const crypto = require('crypto');
const { prisma } = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { generateUniqueRoomCode } = require('../lib/roomCode');
const { normalizePortfolio, emptyPortfolio } = require('../lib/portfolio');
const { MAX_PLAYERS } = require('../constants/stocks');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, phone } = req.body;
    const trimmedName = String(name || '').trim();
    const phoneStr = String(phone || '').replace(/\D/g, '');

    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({ error: 'Name is required (min 2 characters)' });
    }
    if (!/^\d{10}$/.test(phoneStr)) {
      return res.status(400).json({ error: 'Phone must be a 10-digit number' });
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const player = await prisma.player.create({
      data: { name: trimmedName, phone: phoneStr, sessionToken },
    });

    res.json({ playerId: player.id, sessionToken });
  } catch (err) {
    console.error('register', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/rooms', requireAuth, async (_req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { status: 'WAITING' },
      include: { _count: { select: { players: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      rooms.map((r) => ({
        code: r.code,
        playerCount: r._count.players,
        status: r.status,
      })),
    );
  } catch (err) {
    console.error('list rooms', err);
    res.status(500).json({ error: 'Failed to list rooms' });
  }
});

router.post('/rooms/create', requireAuth, async (req, res) => {
  try {
    const code = await generateUniqueRoomCode();

    const room = await prisma.room.create({
      data: {
        code,
        hostId: req.player.id,
        players: {
          create: {
            playerId: req.player.id,
            portfolio: emptyPortfolio(),
          },
        },
      },
    });

    res.json({ roomCode: room.code });
  } catch (err) {
    console.error('create room', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

router.post('/rooms/join', requireAuth, async (req, res) => {
  try {
    const code = String(req.body.roomCode || '')
      .trim()
      .toUpperCase();

    if (code.length !== 4) {
      return res.status(400).json({ error: 'Invalid room code' });
    }

    const room = await prisma.room.findUnique({
      where: { code },
      include: { players: true },
    });

    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.status !== 'WAITING') {
      return res.status(400).json({ error: 'Room is not accepting players' });
    }
    if (room.players.length >= MAX_PLAYERS) {
      return res.status(400).json({ error: 'Room is full' });
    }

    const alreadyIn = room.players.some((p) => p.playerId === req.player.id);
    if (!alreadyIn) {
      await prisma.roomPlayer.create({
        data: {
          roomId: room.id,
          playerId: req.player.id,
          portfolio: emptyPortfolio(),
        },
      });
    }

    res.json({ success: true, roomCode: code });
  } catch (err) {
    console.error('join room', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

router.get('/rooms/:code', requireAuth, async (req, res) => {
  try {
    const code = String(req.params.code || '')
      .trim()
      .toUpperCase();

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        players: {
          include: { player: { select: { id: true, name: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        host: { select: { id: true, name: true } },
      },
    });

    if (!room) return res.status(404).json({ error: 'Room not found' });

    res.json({
      room: {
        code: room.code,
        status: room.status,
        hostId: room.hostId,
      },
      players: room.players.map((rp) => ({
        id: rp.player.id,
        name: rp.player.name,
        cash: rp.cash,
        portfolio: normalizePortfolio(rp.portfolio),
        isHost: rp.playerId === room.hostId,
      })),
    });
  } catch (err) {
    console.error('get room', err);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

module.exports = router;
