import { STOCK_META } from '../lib/constants';

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

  return (
    <div
      className={`rounded-lg border border-slate-600 bg-slate-800/60 p-3 ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="flex justify-between text-sm mb-2">
        <div>
          <p className="font-bold">{meta.ticker}</p>
          <p className="text-xs text-slate-400">{meta.name}</p>
        </div>
        <div className="text-right">
          <p className="font-mono">₹{price}</p>
          <p className="text-xs text-slate-400">{held} held</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={disabled || maxBuy < 1}
          onClick={() => onBuy(stock, 1)}
          className="rounded-lg bg-emerald-600 py-2.5 text-xs font-bold active:scale-[0.98] disabled:bg-slate-700 disabled:text-slate-500 touch-manipulation"
        >
          Buy 1
        </button>
        <button
          type="button"
          disabled={disabled || held < 1}
          onClick={() => onSell(stock, 1)}
          className="rounded-lg bg-red-600 py-2.5 text-xs font-bold active:scale-[0.98] disabled:bg-slate-700 disabled:text-slate-500 touch-manipulation"
        >
          Sell 1
        </button>
        <button
          type="button"
          disabled={disabled || maxBuy < 1}
          onClick={() => onBuy(stock, maxBuy)}
          className="rounded-lg bg-emerald-700/80 py-2 text-xs font-semibold disabled:bg-slate-700 disabled:text-slate-500 touch-manipulation"
        >
          Buy max
        </button>
        <button
          type="button"
          disabled={disabled || held < 1}
          onClick={() => onSell(stock, held)}
          className="rounded-lg bg-red-700/80 py-2 text-xs font-semibold disabled:bg-slate-700 disabled:text-slate-500 touch-manipulation"
        >
          Sell all
        </button>
      </div>
    </div>
  );
}
