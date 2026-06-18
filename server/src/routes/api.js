const express = require('express');
const crypto = require('crypto');
const { prisma } = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { normalizePortfolio, startingPlayerState } = require('../lib/portfolio');
const { MAX_PLAYERS } = require('../constants/stocks');
const { validatePhoneNumber } = require('../lib/phoneValidation');
const { sendVerificationOtp, checkVerificationOtp } = require('../lib/twilioVerify');
const { checkSendAllowed, recordSend } = require('../lib/otpRateLimit');

const router = express.Router();

router.get('/auth/me', requireAuth, (req, res) => {
  res.json({
    playerId: req.player.id,
    name: req.player.name,
    phone: req.player.phone,
    phoneVerified: Boolean(req.player.phoneVerifiedAt),
  });
});

router.post('/otp/send', async (req, res) => {
  try {
    const phoneStr = String(req.body.phone || '').replace(/\D/g, '');
    const phoneError = validatePhoneNumber(phoneStr);
    if (phoneError) {
      return res.status(400).json({ error: phoneError });
    }

    const rate = checkSendAllowed(phoneStr);
    if (!rate.ok) {
      return res.status(429).json({ error: rate.error });
    }

    const result = await sendVerificationOtp(phoneStr);
    recordSend(phoneStr, rate.hourKey);

    if (result.dev) {
      const devCode = process.env.OTP_DEV_CODE || '123456';
      return res.json({
        success: true,
        devMode: true,
        message: `No SMS in dev mode. Enter code ${devCode} below.`,
        devCodeHint: devCode,
      });
    }

    res.json({ success: true, message: 'Verification code sent' });
  } catch (err) {
    console.error('otp/send', err);
    const msg = err.message || 'Failed to send verification code';
    const status = msg.includes('not configured') ? 503 : 400;
    res.status(status).json({ error: msg });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, phone, code } = req.body;
    const trimmedName = String(name || '').trim();
    const phoneStr = String(phone || '').replace(/\D/g, '');
    const otpCode = String(code || '').trim();

    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({ error: 'Name is required (min 2 characters)' });
    }
    const phoneError = validatePhoneNumber(phoneStr);
    if (phoneError) {
      return res.status(400).json({ error: phoneError });
    }
    if (!otpCode) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    await checkVerificationOtp(phoneStr, otpCode);

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const now = new Date();

    const existing = await prisma.player.findFirst({
      where: { phone: phoneStr },
      orderBy: { createdAt: 'desc' },
    });

    let player;
    if (existing) {
      player = await prisma.player.update({
        where: { id: existing.id },
        data: {
          name: trimmedName,
          sessionToken,
          phoneVerifiedAt: now,
        },
      });
    } else {
      player = await prisma.player.create({
        data: {
          name: trimmedName,
          phone: phoneStr,
          sessionToken,
          phoneVerifiedAt: now,
        },
      });
    }

    res.json({
      playerId: player.id,
      sessionToken: player.sessionToken,
      returningPlayer: Boolean(existing),
    });
  } catch (err) {
    console.error('register', err);
    const msg = err.message || 'Registration failed';
    const isOtpError =
      /verification|verification code|expired/i.test(msg) &&
      !msg.includes('prisma') &&
      !msg.includes('Unknown argument');
    const status = isOtpError ? 400 : 500;
    const clientMsg = status === 500 ? 'Registration failed. Please try again.' : msg;
    res.status(status).json({ error: clientMsg });
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
