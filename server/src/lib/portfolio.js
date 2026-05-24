const { STOCKS, INITIAL_PRICE, STARTING_CASH, STARTING_SHARES_PER_STOCK } = require('../constants/stocks');

function emptyPortfolio() {
  return Object.fromEntries(STOCKS.map((s) => [s, 0]));
}

function startingPortfolio() {
  return Object.fromEntries(STOCKS.map((s) => [s, STARTING_SHARES_PER_STOCK]));
}

function startingCashBalance() {
  return STARTING_CASH;
}

function startingPlayerState(prices) {
  const portfolio = startingPortfolio();
  const p = prices || initialPrices();
  const cash = STARTING_CASH;
  return {
    cash,
    portfolio,
    netWorth: netWorth(cash, portfolio, p),
    profitLoss: 0,
  };
}

function normalizePortfolio(portfolio) {
  const base = emptyPortfolio();
  if (!portfolio || typeof portfolio !== 'object') return base;
  for (const stock of STOCKS) {
    base[stock] = Math.max(0, Math.floor(Number(portfolio[stock]) || 0));
  }
  return base;
}

function initialPrices() {
  return Object.fromEntries(STOCKS.map((s) => [s, INITIAL_PRICE]));
}

function netWorth(cash, portfolio, prices) {
  const holdings = normalizePortfolio(portfolio);
  const stockValue = STOCKS.reduce(
    (sum, stock) => sum + holdings[stock] * (prices[stock] || 0),
    0,
  );
  return cash + stockValue;
}

function applyTrades({ cash, portfolio, trades, prices }) {
  let nextCash = cash;
  const nextPortfolio = { ...normalizePortfolio(portfolio) };

  for (const trade of trades) {
    const { stock, action, quantity } = trade;
    const qty = Math.max(0, Math.floor(Number(quantity) || 0));
    const price = prices[stock] || 0;

    if (action === 'HOLD' || qty === 0) continue;

    if (action === 'BUY') {
      const cost = qty * price;
      if (cost > nextCash) {
        throw new Error(`Insufficient cash to buy ${qty} ${stock}`);
      }
      nextCash -= cost;
      nextPortfolio[stock] += qty;
    }

    if (action === 'SELL') {
      if (qty > nextPortfolio[stock]) {
        throw new Error(`Insufficient shares to sell ${qty} ${stock}`);
      }
      nextCash += qty * price;
      nextPortfolio[stock] -= qty;
    }
  }

  return { cash: nextCash, portfolio: nextPortfolio };
}

function holdTrades() {
  return STOCKS.map((stock) => ({ stock, action: 'HOLD', quantity: 0 }));
}

function autoSellAll(cash, portfolio, prices) {
  const holdings = normalizePortfolio(portfolio);
  let nextCash = cash;
  const nextPortfolio = { ...holdings };

  for (const stock of STOCKS) {
    const qty = nextPortfolio[stock];
    if (qty > 0) {
      nextCash += qty * (prices[stock] || 0);
      nextPortfolio[stock] = 0;
    }
  }

  return { cash: nextCash, portfolio: nextPortfolio };
}

module.exports = {
  emptyPortfolio,
  startingPortfolio,
  startingCashBalance,
  startingPlayerState,
  normalizePortfolio,
  initialPrices,
  netWorth,
  applyTrades,
  holdTrades,
  autoSellAll,
};
