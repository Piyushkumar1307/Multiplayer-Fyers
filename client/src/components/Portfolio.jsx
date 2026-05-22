import { STOCKS, STOCK_META } from '../lib/constants';

export default function Portfolio({ cash, portfolio, prices, netWorth, compact = false }) {
  const holdings = STOCKS.filter((s) => (portfolio?.[s] || 0) > 0);

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 text-sm w-full">
        <div>
          <p className="text-[10px] uppercase text-slate-500">Cash</p>
          <p className="font-mono font-semibold">₹{cash?.toLocaleString('en-IN')}</p>
        </div>
        {holdings.length > 0 && (
          <div className="flex-1 min-w-0 overflow-x-auto">
            <p className="text-[10px] uppercase text-slate-500 mb-0.5">Holdings</p>
            <p className="text-xs text-slate-300 truncate">
              {holdings
                .map((s) => `${STOCK_META[s].ticker}×${portfolio[s]}`)
                .join(' · ')}
            </p>
          </div>
        )}
        <div className="text-right">
          <p className="text-[10px] uppercase text-slate-500">Net</p>
          <p className="font-mono font-bold text-emerald-400">
            ₹{netWorth?.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <aside className="rounded-xl border border-slate-700 bg-slate-800/80 p-4">
      <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wide mb-3">
        Portfolio
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Cash</span>
          <span className="font-mono">₹{cash?.toLocaleString('en-IN')}</span>
        </div>
        {holdings.map((s) => {
          const shares = portfolio[s];
          const value = shares * (prices?.[s] || 0);
          return (
            <div key={s} className="flex justify-between text-slate-300">
              <span>
                {STOCK_META[s].ticker} × {shares}
              </span>
              <span className="font-mono">₹{value.toLocaleString('en-IN')}</span>
            </div>
          );
        })}
        <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
          <span>Net worth</span>
          <span className="font-mono text-emerald-400">
            ₹{netWorth?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </aside>
  );
}
