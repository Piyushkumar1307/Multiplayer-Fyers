import { useEffect, useRef, useState } from 'react';
import { formatSignedUnits, formatUnits } from '../lib/format';

export default function StandingsTable({ standings, phase }) {
  const prevRanksRef = useRef({});
  const prevLeaderRef = useRef(null);
  const [rowAnim, setRowAnim] = useState({});
  const [leaderPulse, setLeaderPulse] = useState(false);

  useEffect(() => {
    if (!standings?.length) return undefined;

    const nextAnim = {};
    const currentLeader = standings.find((s) => s.rank === 1)?.playerId ?? null;

    for (const row of standings) {
      const prevRank = prevRanksRef.current[row.playerId];
      if (prevRank !== undefined && prevRank !== row.rank) {
        nextAnim[row.playerId] = prevRank > row.rank ? 'rank-up' : 'rank-down';
      }
    }

    if (currentLeader && prevLeaderRef.current && currentLeader !== prevLeaderRef.current) {
      setLeaderPulse(true);
      setTimeout(() => setLeaderPulse(false), 1200);
    }

    if (Object.keys(nextAnim).length > 0) {
      setRowAnim(nextAnim);
      setTimeout(() => setRowAnim({}), 900);
    }

    prevLeaderRef.current = currentLeader;
    prevRanksRef.current = Object.fromEntries(
      standings.map((s) => [s.playerId, s.rank]),
    );

    return undefined;
  }, [standings]);

  if (!standings?.length) {
    return (
      <p className="text-slate-500 text-sm text-center py-8">
        No players in this room yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800/80 text-left text-slate-400">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Player</th>
            <th className="px-4 py-3 font-medium text-right">Cash</th>
            <th className="px-4 py-3 font-medium text-right">Net worth</th>
            <th className="px-4 py-3 font-medium text-right">P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => {
            const up = row.profitLoss >= 0;
            const isLeader = row.rank === 1;
            const anim = rowAnim[row.playerId] || '';
            const leaderClass =
              isLeader && (leaderPulse || anim === 'rank-up')
                ? 'leader-pulse'
                : isLeader
                  ? 'leader-row'
                  : '';

            return (
              <tr
                key={row.playerId}
                className={`border-b border-slate-800 last:border-0 transition-colors duration-300 ${anim} ${leaderClass}`}
              >
                <td className="px-4 py-3 font-mono">
                  <span
                    className={`inline-flex items-center justify-center min-w-[2rem] ${
                      isLeader ? 'text-amber-300 font-bold text-base' : 'text-slate-400'
                    }`}
                  >
                    {isLeader && <span className="mr-1">👑</span>}
                    {row.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className={`font-semibold ${isLeader ? 'text-amber-100' : 'text-white'}`}>
                    {row.name}
                  </p>
                  {row.phone && (
                    <p className="text-xs text-slate-500 font-mono">{row.phone}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatUnits(row.cash)}</td>
                <td className="px-4 py-3 text-right font-mono">{formatUnits(row.netWorth)}</td>
                <td
                  className={`px-4 py-3 text-right font-mono font-bold ${
                    up ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {formatSignedUnits(row.profitLoss)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {phase && (
        <p className="px-4 py-2 text-xs text-slate-500 border-t border-slate-800">
          Live phase: <span className="text-indigo-300 uppercase">{phase}</span>
        </p>
      )}
    </div>
  );
}
