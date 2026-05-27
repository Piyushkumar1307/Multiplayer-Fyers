import {
  STOCKS,
  formatTickerWithSector,
  STARTING_CASH,
  STARTING_SHARES_PER_STOCK,
  TRADING_SECONDS,
  NEWS_EVENTS_PER_GAME,
} from '../lib/constants';
import { formatUnits } from '../lib/format';

const TICKER_LIST = STOCKS.map((s) => formatTickerWithSector(s)).join(', ');

export default function InstructionContent() {
  return (
    <ul className="space-y-4 text-sm sm:text-base text-slate-300 mx-auto max-w-md">
      <li className="flex gap-2 items-start">
        <span className="text-emerald-400 font-bold shrink-0">1.</span>
        <span>
          You start with <strong className="text-white">{formatUnits(STARTING_CASH)}</strong> cash
          and <strong className="text-white">{STARTING_SHARES_PER_STOCK}</strong> shares of each
          stock ({TICKER_LIST}).
        </span>
      </li>
      <li className="flex gap-2 items-start">
        <span className="text-emerald-400 font-bold shrink-0">2.</span>
        <span>
          Tap <strong className="text-emerald-400">Buy</strong> or{' '}
          <strong className="text-red-400">Sell</strong> — each tap trades 1 share at the current
          price.
        </span>
      </li>
      <li className="flex gap-2 items-start">
        <span className="text-amber-400 font-bold shrink-0">3.</span>
        <span>
          <strong className="text-amber-200">{NEWS_EVENTS_PER_GAME} headlines</strong> appear at the
          top. Each one moves only the stocks it mentions — prices go{' '}
          <strong className="text-emerald-400">up</strong> or{' '}
          <strong className="text-red-400">down</strong> right away.
        </span>
      </li>
      <li className="flex gap-2 items-start">
        <span className="text-indigo-400 font-bold shrink-0">4.</span>
        <span>
          You have <strong className="text-white">{TRADING_SECONDS}s</strong> to earn profit.
          Leftover shares auto-sell when time runs out. Highest profit wins.
        </span>
      </li>
    </ul>
  );
}
