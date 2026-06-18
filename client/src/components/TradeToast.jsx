import { STOCK_META } from '../lib/constants';
import { formatUnits } from '../lib/format';

export default function TradeToast({ toasts }) {
  if (!toasts.length) return null;

  return (
    <div
      className="fixed inset-x-0 z-50 pointer-events-none flex flex-col items-center gap-2 px-4 trade-toast-stack"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => {
        const meta = STOCK_META[t.stock];
        const isBuy = t.action === 'BUY';
        const total = (t.price || 0) * (t.quantity || 1);

        return (
          <div
            key={t.id}
            className={`trade-toast w-full max-w-sm rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
              isBuy
                ? 'border-emerald-400/50 bg-emerald-950/95'
                : 'border-red-400/50 bg-red-950/95'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                  isBuy ? 'bg-emerald-500/25' : 'bg-red-500/25'
                }`}
              >
                {isBuy ? '📈' : '📉'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white text-sm">
                  {isBuy ? 'Bought' : 'Sold'} {t.quantity} share{t.quantity !== 1 ? 's' : ''}{' '}
                  · {meta?.ticker || t.stock}
                </p>
                <p className="text-xs text-slate-300 truncate">{meta?.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`font-mono text-sm font-bold ${
                    isBuy ? 'text-emerald-300' : 'text-red-300'
                  }`}
                >
                  {isBuy ? '−' : '+'}
                  {formatUnits(total)}
                </p>
                <p className="text-[10px] text-slate-400">@ {formatUnits(t.price)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
