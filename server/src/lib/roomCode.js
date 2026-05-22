const { prisma } = require('./prisma');

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomCode() {
  let code = '';
  for (let i = 0; i < 4; i += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

async function generateUniqueRoomCode() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = randomCode();
    const existing = await prisma.room.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error('Failed to generate unique room code');
}

module.exports = { generateUniqueRoomCode };
