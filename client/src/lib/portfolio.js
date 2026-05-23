import { STOCKS } from './constants';

function emptyPortfolio() {
  return Object.fromEntries(STOCKS.map((s) => [s, 0]));
}

export function normalizePortfolio(portfolio) {
  const base = emptyPortfolio();
  if (!portfolio || typeof portfolio !== 'object') return base;
  for (const stock of STOCKS) {
    base[stock] = Math.max(0, Math.floor(Number(portfolio[stock]) || 0));
  }
  return base;
}

export function applyTrades({ cash, portfolio, trades, prices }) {
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
