const { prisma } = require('../lib/prisma');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  if (!token) {
    return res.status(401).json({ error: 'Missing session token' });
  }

  const player = await prisma.player.findUnique({ where: { sessionToken: token } });
  if (!player) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  req.player = player;
  next();
}

module.exports = { requireAuth };
