const { PrismaClient } = require('@prisma/client');
const { invalidateNewsCache } = require('../src/lib/newsCache');

const prisma = new PrismaClient();

/** Multi-stock headlines (pool for 5 per round) */
const MULTI_STOCK_NEWS = [
  {
    headline:
      'Aviation fuel prices expected to rise further. Airlines under pressure as costs increase.',
    affectedStocks: ['AERO', 'OILF'],
    priceDeltas: { AERO: -16, OILF: 20 },
  },
  {
    headline:
      'Government announces major green energy push. Plans to reduce dependency on thermal power and fossil fuels.',
    affectedStocks: ['GRNV', 'OILF', 'AERO'],
    priceDeltas: { GRNV: 22, OILF: -14, AERO: -6 },
  },
  {
    headline:
      'Major policy change: Government increases defense budget by 18%. Focus on indigenous manufacturing.',
    affectedStocks: ['AERO', 'OILF', 'NXBK'],
    priceDeltas: { AERO: 18, OILF: 10, NXBK: 6 },
  },
  {
    headline:
      'Crude oil prices surge 12% due to geopolitical tensions. Fuel costs rise sharply.',
    affectedStocks: ['OILF', 'AERO', 'GRNV'],
    priceDeltas: { OILF: 24, AERO: -15, GRNV: -8 },
  },
  {
    headline:
      'Government announces 40% subsidy and tax benefits for Electric Vehicles. Major boost expected for EV manufacturers.',
    affectedStocks: ['GRNV', 'AERO', 'OILF'],
    priceDeltas: { GRNV: 20, AERO: 12, OILF: -10 },
  },
  {
    headline: 'Fuel costs squeeze airlines while oil producers rally on supply fears.',
    affectedStocks: ['AERO', 'OILF', 'NXBK'],
    priceDeltas: { AERO: -12, OILF: 16, NXBK: -5 },
  },
];

/** Single-stock headlines (pool for 3 per round) */
const SINGLE_STOCK_NEWS = [
  {
    headline:
      'AgriHarvest Limited hit by unseasonal rains and pest attacks in major producing states. Crop damage reported.',
    affectedStocks: ['AGRI'],
    priceDeltas: { AGRI: -26 },
  },
  {
    headline:
      'RetailHub Limited reports record quarterly sales due to festive season + successful expansion into Tier-2 cities.',
    affectedStocks: ['NXBK'],
    priceDeltas: { NXBK: 22 },
  },
  {
    headline:
      'TechNova Limited faces data privacy probe. Regulators may impose heavy fines.',
    affectedStocks: ['NXBK'],
    priceDeltas: { NXBK: -20 },
  },
  {
    headline:
      'SolarVolt Limited signs massive 5-year agreement with state governments for 2GW solar projects.',
    affectedStocks: ['GRNV'],
    priceDeltas: { GRNV: 24 },
  },
  {
    headline:
      'Breakthrough: PharmaCore Limited announces successful Phase-3 trials of new cancer drug. Expected to get fast-track approval.',
    affectedStocks: ['PHRX'],
    priceDeltas: { PHRX: 28 },
  },
  {
    headline: 'OilForge Limited wins long-term refinery supply contract with national oil consortium.',
    affectedStocks: ['OILF'],
    priceDeltas: { OILF: 18 },
  },
];

const NEWS_CARDS = [...MULTI_STOCK_NEWS, ...SINGLE_STOCK_NEWS];

async function main() {
  await prisma.trade.deleteMany();
  await prisma.gameRound.deleteMany();
  await prisma.newsCard.deleteMany();
  await prisma.newsCard.createMany({ data: NEWS_CARDS });
  invalidateNewsCache();
  console.log(
    `Seeded ${NEWS_CARDS.length} news cards (${MULTI_STOCK_NEWS.length} multi-stock, ${SINGLE_STOCK_NEWS.length} single-stock).`,
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
