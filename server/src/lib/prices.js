const { STOCKS } = require('../constants/stocks');

function applyPriceDeltas(prices, priceDeltas) {
  const next = { ...prices };
  if (!priceDeltas || typeof priceDeltas !== 'object') return next;

  for (const [ticker, delta] of Object.entries(priceDeltas)) {
    if (!STOCKS.includes(ticker)) continue;
    const pct = Number(delta) || 0;
    next[ticker] = Math.max(1, Math.round(next[ticker] * (1 + pct / 100)));
  }
  return next;
}

function projectedPrices(prices, priceDeltas) {
  return applyPriceDeltas(prices, priceDeltas);
}

module.exports = { applyPriceDeltas, projectedPrices };
