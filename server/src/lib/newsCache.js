const { prisma } = require('./prisma');

let cachedCards = null;
let cacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getNewsCards() {
  const now = Date.now();
  if (cachedCards && now - cacheTime < CACHE_TTL_MS) {
    return cachedCards;
  }
  cachedCards = await prisma.newsCard.findMany();
  cacheTime = now;
  return cachedCards;
}

function invalidateNewsCache() {
  cachedCards = null;
  cacheTime = 0;
}

module.exports = { getNewsCards, invalidateNewsCache };
