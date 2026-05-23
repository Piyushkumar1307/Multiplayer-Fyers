import { STARTING_CASH } from '../lib/constants';
import { formatSignedUnits, formatUnits } from '../lib/format';

export default function Leaderboard({ leaderboard, showConfetti }) {
  return (
    <div className="w-full max-w-lg mx-auto">
      {showConfetti && (
        <p className="text-center text-4xl mb-4 animate-bounce">🎉</p>
      )}
      <ol className="space-y-3">
        {leaderboard?.map((entry) => {
          const profit = entry.delta ?? entry.netWorth - STARTING_CASH;
          const up = profit >= 0;
          return (
            <li
              key={entry.playerId || entry.rank}
              className={`flex items-center gap-4 rounded-xl border px-4 py-4 ${
                entry.rank === 1
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-slate-700 bg-slate-800/60'
              }`}
            >
              <span className="text-2xl font-bold text-slate-500 w-8">
                #{entry.rank}
              </span>
              <div className="flex-1 text-left">
                <p className="font-semibold">{entry.name}</p>
                <p className="text-xs text-slate-400">
                  Started {formatUnits(STARTING_CASH)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold">{formatUnits(entry.netWorth)}</p>
                <p
                  className={`text-sm font-medium ${
                    up ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {formatSignedUnits(profit)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
