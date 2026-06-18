import { useState } from 'react';
import { STOCK_META } from '../lib/constants';
import { formatUnits } from '../lib/format';

export default function TradePanel({
  stock,
  price,
  shares,
  cash,
  disabled,
  onBuy,
  onSell,
}) {
  const meta = STOCK_META[stock];
  const held = shares || 0;
  const maxBuy = price > 0 ? Math.floor(cash / price) : 0;
  const [pulse, setPulse] = useState(null);
  const [btnPop, setBtnPop] = useState(null);

  function flash(action) {
    setPulse(action);
    setBtnPop(action);
    window.setTimeout(() => setPulse(null), 550);
    window.setTimeout(() => setBtnPop(null), 350);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
    }
  }

  function handleBuy() {
    if (disabled || maxBuy < 1) return;
    flash('buy');
    onBuy(stock, 1);
  }

  function handleSell() {
    if (disabled || held < 1) return;
    flash('sell');
    onSell(stock, 1);
  }

  return (
    <div
      className={`rounded-lg border border-slate-600 bg-slate-800/60 p-3 transition-colors ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${pulse === 'buy' ? 'trade-panel-pulse-buy' : ''} ${
        pulse === 'sell' ? 'trade-panel-pulse-sell' : ''
      }`}
    >
      <div className="flex justify-between text-sm mb-2">
        <div>
          <p className="font-bold">
            {meta.ticker}{' '}
            <span className="text-xs font-normal text-slate-400">({meta.sector})</span>
          </p>
          <p className="text-xs text-slate-400">{meta.name}</p>
        </div>
        <div className="text-right">
          <p className="font-mono">{formatUnits(price)}</p>
          <p className="text-xs text-slate-400">{held} held</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled || maxBuy < 1}
          onClick={handleBuy}
          className={`rounded-lg bg-emerald-600 py-2.5 text-sm font-bold active:scale-[0.98] disabled:bg-slate-700 disabled:text-slate-500 touch-manipulation ${
            btnPop === 'buy' ? 'trade-btn-pop ring-2 ring-emerald-300/80' : ''
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          disabled={disabled || held < 1}
          onClick={handleSell}
          className={`rounded-lg bg-red-600 py-2.5 text-sm font-bold active:scale-[0.98] disabled:bg-slate-700 disabled:text-slate-500 touch-manipulation ${
            btnPop === 'sell' ? 'trade-btn-pop ring-2 ring-red-300/80' : ''
          }`}
        >
          Sell
        </button>
      </div>
    </div>
  );
}
