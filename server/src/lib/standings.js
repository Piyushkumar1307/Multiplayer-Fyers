const { STARTING_CASH } = require('../constants/stocks');
const { netWorth } = require('./portfolio');

function timeValue(date) {
  if (!date) return null;
  const t = new Date(date).getTime();
  return Number.isFinite(t) ? t : null;
}

/**
 * Tie-break (after score): earliest firstBuyAt wins; then earliest joinedAt.
 * Players who never bought sort after those who did (at equal score).
 */
function compareRoomPlayers(a, b, scoreA, scoreB) {
  if (scoreB !== scoreA) return scoreB - scoreA;

  const aBuy = timeValue(a.firstBuyAt);
  const bBuy = timeValue(b.firstBuyAt);
  const aBuyKey = aBuy ?? Number.POSITIVE_INFINITY;
  const bBuyKey = bBuy ?? Number.POSITIVE_INFINITY;
  if (aBuyKey !== bBuyKey) return aBuyKey - bBuyKey;

  const aJoin = timeValue(a.joinedAt) ?? 0;
  const bJoin = timeValue(b.joinedAt) ?? 0;
  return aJoin - bJoin;
}

function compareByNetWorth(a, b, prices) {
  const aWorth = prices
    ? netWorth(a.cash, a.portfolio, prices)
    : a.netWorth;
  const bWorth = prices
    ? netWorth(b.cash, b.portfolio, prices)
    : b.netWorth;
  return compareRoomPlayers(a, b, aWorth, bWorth);
}

function compareByProfitDelta(a, b) {
  const aDelta = a.profitLoss ?? a.cash - STARTING_CASH;
  const bDelta = b.profitLoss ?? b.cash - STARTING_CASH;
  return compareRoomPlayers(a, b, aDelta, bDelta);
}

module.exports = {
  compareRoomPlayers,
  compareByNetWorth,
  compareByProfitDelta,
};
