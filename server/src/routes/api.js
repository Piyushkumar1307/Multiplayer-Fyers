const express = require('express');
const crypto = require('crypto');
const { prisma } = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { normalizePortfolio, startingPlayerState } = require('../lib/portfolio');
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
    const existing = await prisma.player.findFirst({
      where: { phone: phoneStr },
      orderBy: { createdAt: 'asc' },
    });

    let player;
    if (existing) {
      player = await prisma.player.update({
        where: { id: existing.id },
        data: { name: trimmedName, sessionToken },
      });
    } else {
      player = await prisma.player.create({
        data: { name: trimmedName, phone: phoneStr, sessionToken },
      });
    }

    res.json({ playerId: player.id, sessionToken, returningPlayer: Boolean(existing) });
  } catch (err) {
    console.error('register', err);
    res.status(500).json({ error: 'Registration failed' });
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
    if (room.status === 'ENDED') {
      return res.status(400).json({ error: 'This room has closed. Ask admin for a new code.' });
    }
    if (room.status !== 'WAITING') {
      return res.status(400).json({ error: 'Room is not accepting players' });
    }
    if (room.players.length >= MAX_PLAYERS) {
      return res.status(400).json({ error: 'Room is full' });
    }

    const alreadyIn = room.players.some((p) => p.playerId === req.player.id);
    if (!alreadyIn) {
      const starting = startingPlayerState();
      await prisma.roomPlayer.create({
        data: {
          roomId: room.id,
          playerId: req.player.id,
          cash: starting.cash,
          portfolio: starting.portfolio,
          netWorth: starting.netWorth,
          profitLoss: starting.profitLoss,
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
        winnerName: room.winnerName,
        winnerProfitLoss: room.winnerProfitLoss,
      },
      players: room.players.map((rp) => ({
        id: rp.player.id,
        name: rp.player.name,
        cash: rp.cash,
        portfolio: normalizePortfolio(rp.portfolio),
      })),
    });
  } catch (err) {
    console.error('get room', err);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

module.exports = router;
