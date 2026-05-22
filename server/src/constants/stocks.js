const STOCKS = ['AERO', 'GRNV', 'NXBK', 'PHRX'];

const STOCK_META = {
  AERO: { name: 'AeroCore', ticker: 'AERO' },
  GRNV: { name: 'GreenVolt', ticker: 'GRNV' },
  NXBK: { name: 'NexBank', ticker: 'NXBK' },
  PHRX: { name: 'PharmaX', ticker: 'PHRX' },
};

const INITIAL_PRICE = 100;
const STARTING_CASH = 10000;
const TOTAL_ROUNDS = 1;
const TRADING_SECONDS = 180;
const NEWS_EVENTS_PER_GAME = 5;
const MAX_PLAYERS = 2;
const MIN_PLAYERS_TO_START = 2;

module.exports = {
  STOCKS,
  STOCK_META,
  INITIAL_PRICE,
  STARTING_CASH,
  TOTAL_ROUNDS,
  TRADING_SECONDS,
  NEWS_EVENTS_PER_GAME,
  MAX_PLAYERS,
  MIN_PLAYERS_TO_START,
};
