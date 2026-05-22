export function applyDelta(price, deltaPercent) {
  const pct = Number(deltaPercent) || 0;
  return Math.max(1, Math.round(price * (1 + pct / 100)));
}

export function projectedPrices(prices, priceDeltas) {
  const next = { ...prices };
  if (!priceDeltas) return next;
  for (const [ticker, delta] of Object.entries(priceDeltas)) {
    if (next[ticker] != null) {
      next[ticker] = applyDelta(next[ticker], delta);
    }
  }
  return next;
}

export function deltaPercent(oldPrice, newPrice) {
  if (!oldPrice) return 0;
  return Math.round(((newPrice - oldPrice) / oldPrice) * 100);
}
