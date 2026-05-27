const { PrismaClient } = require('@prisma/client');
const { invalidateNewsCache } = require('../src/lib/newsCache');
const { NEWS_CARDS, POOL_STATS } = require('./newsCardsData');

const prisma = new PrismaClient();

async function main() {
  await prisma.trade.deleteMany();
  await prisma.gameRound.deleteMany();
  await prisma.newsCard.deleteMany();
  await prisma.newsCard.createMany({ data: NEWS_CARDS });
  invalidateNewsCache();
  console.log(
    `Seeded ${POOL_STATS.total} news cards (${POOL_STATS.multi} multi-stock, ${POOL_STATS.single} single-stock).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
