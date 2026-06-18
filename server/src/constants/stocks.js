const STOCKS = ['AERO', 'GRNV', 'NXBK', 'PHRX', 'OILF', 'AGRI'];

const STOCK_META = {
  AERO: { name: 'AeroCore', ticker: 'AERO', sector: 'Aviation' },
  GRNV: { name: 'GreenVolt', ticker: 'GRNV', sector: 'Renewable Energy' },
  NXBK: { name: 'NexBank', ticker: 'NXBK', sector: 'Banking' },
  PHRX: { name: 'PharmaCore', ticker: 'PHRX', sector: 'Pharma' },
  OILF: { name: 'OilForge', ticker: 'OILF', sector: 'Oil & Gas' },
  AGRI: { name: 'AgriHarvest', ticker: 'AGRI', sector: 'Agriculture' },
};

const INITIAL_PRICE = 100;
const STARTING_CASH = 10000;
const STARTING_SHARES_PER_STOCK = 10;
const TOTAL_ROUNDS = 1;
const TRADING_SECONDS = 120;
const INSTRUCTION_SECONDS = 8;
const NEWS_EVENTS_PER_GAME = 8;
const NEWS_MULTI_PER_GAME = 5;
const NEWS_SINGLE_PER_GAME = 3;
const MAX_PLAYERS = 20;
const MIN_PLAYERS_TO_START = 1;

module.exports = {
  STOCKS,
  STOCK_META,
  INITIAL_PRICE,
  STARTING_CASH,
  STARTING_SHARES_PER_STOCK,
  TOTAL_ROUNDS,
  TRADING_SECONDS,
  INSTRUCTION_SECONDS,
  NEWS_EVENTS_PER_GAME,
  NEWS_MULTI_PER_GAME,
  NEWS_SINGLE_PER_GAME,
  MAX_PLAYERS,
  MIN_PLAYERS_TO_START,
};
