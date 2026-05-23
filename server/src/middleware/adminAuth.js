const crypto = require('crypto');

function requireAdmin(req, res, next) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return res.status(503).json({ error: 'Admin access is not configured' });
  }

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

function verifyAdminToken(token) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;
  const a = Buffer.from(String(token));
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { requireAdmin, verifyAdminToken };
