import {
  STOCKS,
  STOCK_META,
  STARTING_CASH,
  STARTING_SHARES_PER_STOCK,
  TRADING_SECONDS,
  NEWS_EVENTS_PER_GAME,
} from '../lib/constants';
import { formatUnits } from '../lib/format';

const TICKER_LIST = STOCKS.map((s) => STOCK_META[s].ticker).join(', ');

export default function GameInstructions({ secondsLeft, roundNumber }) {
  return (
    <div className="fixed inset-0 z-[55] flex flex-col bg-slate-950 text-white max-w-lg mx-auto w-full lg:max-w-2xl lg:left-1/2 lg:-translate-x-1/2">
      <div className="shrink-0 border-b border-indigo-500/40 bg-indigo-950/80 px-4 py-4 safe-top text-center">
        <p className="text-xs uppercase tracking-widest text-indigo-300 mb-1">
          Round {roundNumber}
        </p>
        <p className="text-3xl font-mono font-bold text-white tabular-nums">{secondsLeft}</p>
        <p className="text-xs text-slate-400 mt-1">Trading starts in…</p>
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 py-6">
        <h1 className="text-xl font-bold text-white text-center mb-5">How to play</h1>

        <ul className="space-y-4 text-sm sm:text-base text-slate-300">
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold shrink-0">1.</span>
            <span>
              You start with <strong className="text-white">{formatUnits(STARTING_CASH)}</strong>{' '}
              cash and <strong className="text-white">{STARTING_SHARES_PER_STOCK}</strong> shares
              of each stock ({TICKER_LIST}).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 font-bold shrink-0">2.</span>
            <span>
              Tap <strong className="text-emerald-400">Buy</strong> or{' '}
              <strong className="text-red-400">Sell</strong> — each tap trades 1 share at the
              current price.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-amber-400 font-bold shrink-0">3.</span>
            <span>
              <strong className="text-amber-200">{NEWS_EVENTS_PER_GAME} headlines</strong> scroll
              at the top. Each one moves only the stocks it mentions — prices go{' '}
              <strong className="text-emerald-400">up</strong> or{' '}
              <strong className="text-red-400">down</strong> right away.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-indigo-400 font-bold shrink-0">4.</span>
            <span>
              You have <strong className="text-white">{TRADING_SECONDS}s</strong> to grow profit.
              Leftover shares auto-sell when time runs out. Highest profit wins.
            </span>
          </li>
        </ul>
      </div>

      <footer className="shrink-0 border-t border-slate-800 px-4 py-3 safe-bottom text-center">
        <p className="text-xs text-slate-500">Keep this tab open</p>
      </footer>
    </div>
  );
}
