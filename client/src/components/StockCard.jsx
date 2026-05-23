import { STOCK_META } from '../lib/constants';
import { deltaPercent } from '../lib/prices';
import { formatUnits } from '../lib/format';

export default function StockCard({ stock, price, previousPrice, flash }) {
  const meta = STOCK_META[stock];
  const change = previousPrice != null ? deltaPercent(previousPrice, price) : 0;
  const up = change > 0;
  const down = change < 0;

  const flashClass =
    flash === 'up'
      ? 'animate-pulse bg-emerald-500/30'
      : flash === 'down'
        ? 'animate-pulse bg-red-500/30'
        : '';

  return (
    <div
      className={`rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 sm:p-3 transition-colors duration-500 ${flashClass}`}
    >
      <div className="flex justify-between items-start gap-1">
        <div className="min-w-0">
          <p className="text-[10px] text-slate-400 truncate">{meta.name}</p>
          <p className="text-sm font-bold">{meta.ticker}</p>
        </div>
        <span
          className={`text-xs font-semibold shrink-0 ${
            up ? 'text-emerald-400' : down ? 'text-red-400' : 'text-slate-400'
          }`}
        >
          {change > 0 ? '+' : ''}
          {change}%
        </span>
      </div>
      <p className="mt-1 text-lg font-mono leading-tight">{formatUnits(price)}</p>
    </div>
  );
}
