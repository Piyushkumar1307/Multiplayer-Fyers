const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const NEWS_CARDS = [
  { headline: 'Government bans fossil fuels', affectedStocks: ['GRNV', 'AERO'], priceDeltas: { GRNV: 20, AERO: -8 } },
  { headline: 'New pandemic drug approved', affectedStocks: ['PHRX'], priceDeltas: { PHRX: 25 } },
  { headline: 'Bank fraud scandal exposed', affectedStocks: ['NXBK'], priceDeltas: { NXBK: -30 } },
  { headline: 'Electric aviation breakthrough', affectedStocks: ['AERO', 'GRNV'], priceDeltas: { AERO: 18, GRNV: 10 } },
  { headline: 'Interest rates hiked sharply', affectedStocks: ['NXBK', 'PHRX'], priceDeltas: { NXBK: -15, PHRX: -10 } },
  { headline: 'Green energy subsidy announced', affectedStocks: ['GRNV', 'AERO'], priceDeltas: { GRNV: 22, AERO: 5 } },
  { headline: 'Pharma CEO arrested', affectedStocks: ['PHRX'], priceDeltas: { PHRX: -28 } },
  { headline: 'Air travel hits record high', affectedStocks: ['AERO'], priceDeltas: { AERO: 15 } },
  { headline: 'Banking sector gets bailout', affectedStocks: ['NXBK'], priceDeltas: { NXBK: 20 } },
  { headline: 'Drug patent expires', affectedStocks: ['PHRX'], priceDeltas: { PHRX: -18 } },
  { headline: 'Solar panel costs plummet', affectedStocks: ['GRNV'], priceDeltas: { GRNV: 16 } },
  { headline: 'Aviation safety probe launched', affectedStocks: ['AERO'], priceDeltas: { AERO: -12 } },
  { headline: 'Central bank cuts rates', affectedStocks: ['NXBK', 'PHRX'], priceDeltas: { NXBK: 12, PHRX: 8 } },
  { headline: 'Vaccine trial fails', affectedStocks: ['PHRX'], priceDeltas: { PHRX: -22 } },
  { headline: 'Hydrogen fuel cells go mainstream', affectedStocks: ['GRNV', 'AERO'], priceDeltas: { GRNV: 14, AERO: 7 } },
  { headline: 'Major airline bankruptcy', affectedStocks: ['AERO'], priceDeltas: { AERO: -20 } },
  { headline: 'Fintech disrupts traditional banking', affectedStocks: ['NXBK'], priceDeltas: { NXBK: -14 } },
  { headline: 'Blockbuster merger in pharma', affectedStocks: ['PHRX'], priceDeltas: { PHRX: 19 } },
  { headline: 'Carbon tax introduced nationwide', affectedStocks: ['GRNV', 'AERO'], priceDeltas: { GRNV: 18, AERO: -6 } },
  { headline: 'Drone delivery approved for cities', affectedStocks: ['AERO'], priceDeltas: { AERO: 11 } },
  { headline: 'Bank earnings beat expectations', affectedStocks: ['NXBK'], priceDeltas: { NXBK: 16 } },
  { headline: 'Generic drugs flood the market', affectedStocks: ['PHRX'], priceDeltas: { PHRX: -15 } },
  { headline: 'Wind farm capacity doubles', affectedStocks: ['GRNV'], priceDeltas: { GRNV: 21 } },
  { headline: 'Fuel prices surge globally', affectedStocks: ['AERO', 'GRNV'], priceDeltas: { AERO: -9, GRNV: 6 } },
  { headline: 'Cyberattack on major bank', affectedStocks: ['NXBK'], priceDeltas: { NXBK: -25 } },
  { headline: 'FDA fast-tracks cancer drug', affectedStocks: ['PHRX'], priceDeltas: { PHRX: 24 } },
  { headline: 'Space tourism tickets sell out', affectedStocks: ['AERO'], priceDeltas: { AERO: 20 } },
  { headline: 'Coal plants shut down early', affectedStocks: ['GRNV'], priceDeltas: { GRNV: 17 } },
  { headline: 'Mortgage defaults spike', affectedStocks: ['NXBK'], priceDeltas: { NXBK: -18 } },
  { headline: 'Opioid lawsuit settlement', affectedStocks: ['PHRX'], priceDeltas: { PHRX: -12 } },
  { headline: 'Supersonic jet certified', affectedStocks: ['AERO', 'NXBK'], priceDeltas: { AERO: 14, NXBK: 4 } },
  { headline: 'Battery storage breakthrough', affectedStocks: ['GRNV', 'PHRX'], priceDeltas: { GRNV: 13, PHRX: 5 } },
  { headline: 'Bank CEO resigns amid probe', affectedStocks: ['NXBK'], priceDeltas: { NXBK: -11 } },
  { headline: 'Bird flu vaccine approved', affectedStocks: ['PHRX'], priceDeltas: { PHRX: 17 } },
  { headline: 'Airport expansion approved', affectedStocks: ['AERO'], priceDeltas: { AERO: 9 } },
  { headline: 'EV charging network nationalized', affectedStocks: ['GRNV'], priceDeltas: { GRNV: 19 } },
  { headline: 'Credit rating downgrade', affectedStocks: ['NXBK'], priceDeltas: { NXBK: -16 } },
  { headline: 'Clinical trial shows miracle cure', affectedStocks: ['PHRX'], priceDeltas: { PHRX: 28 } },
  { headline: 'Pilot strike grounds flights', affectedStocks: ['AERO'], priceDeltas: { AERO: -17 } },
  { headline: 'Green bonds oversubscribed', affectedStocks: ['GRNV', 'NXBK'], priceDeltas: { GRNV: 12, NXBK: 8 } },
];

async function main() {
  const count = await prisma.newsCard.count();
  if (count >= NEWS_CARDS.length) {
    console.log(`Skipping seed: ${count} news cards already exist.`);
    return;
  }

  await prisma.newsCard.deleteMany();
  await prisma.newsCard.createMany({ data: NEWS_CARDS });
  console.log(`Seeded ${NEWS_CARDS.length} news cards.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
