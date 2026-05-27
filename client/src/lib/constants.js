export const STOCKS = ['AERO', 'GRNV', 'NXBK', 'PHRX', 'OILF', 'AGRI'];

export const STOCK_META = {
  AERO: { name: 'AeroCore', ticker: 'AERO', sector: 'Aviation' },
  GRNV: { name: 'GreenVolt', ticker: 'GRNV', sector: 'Renewable Energy' },
  NXBK: { name: 'NexBank', ticker: 'NXBK', sector: 'Banking' },
  PHRX: { name: 'PharmaCore', ticker: 'PHRX', sector: 'Pharma' },
  OILF: { name: 'OilForge', ticker: 'OILF', sector: 'Oil & Gas' },
  AGRI: { name: 'AgriHarvest', ticker: 'AGRI', sector: 'Agriculture' },
};

export function formatTickerWithSector(stock) {
  const meta = STOCK_META[stock];
  if (!meta) return stock;
  return `${meta.ticker} (${meta.sector})`;
}

export const STARTING_CASH = 10000;
export const STARTING_SHARES_PER_STOCK = 10;
export const TOTAL_ROUNDS = 1;
export const TRADING_SECONDS = 120;
export const INSTRUCTION_SECONDS = 8;
export const NEWS_EVENTS_PER_GAME = 8;
export const MAX_PLAYERS = 20;
export const MIN_PLAYERS_TO_START = 5;
