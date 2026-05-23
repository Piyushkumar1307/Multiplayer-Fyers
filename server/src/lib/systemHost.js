const crypto = require('crypto');
const { prisma } = require('./prisma');

const SYSTEM_PHONE = '0000000000';

async function getSystemHostId() {
  let host = await prisma.player.findFirst({
    where: { phone: SYSTEM_PHONE },
  });

  if (!host) {
    host = await prisma.player.create({
      data: {
        name: 'Admin',
        phone: SYSTEM_PHONE,
        sessionToken: crypto.randomBytes(32).toString('hex'),
      },
    });
  }

  return host.id;
}

module.exports = { getSystemHostId };
