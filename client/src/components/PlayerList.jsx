import { MAX_PLAYERS } from '../lib/constants';

export default function PlayerList({ players, max = MAX_PLAYERS }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {players.map((p) => (
        <li
          key={p.id}
          className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold uppercase">
            {p.name?.charAt(0) || '?'}
          </span>
          <div className="text-left min-w-0">
            <p className="font-medium truncate">{p.name}</p>
            {p.isHost && (
              <p className="text-xs text-amber-400">Host</p>
            )}
          </div>
        </li>
      ))}
      {Array.from({ length: Math.max(0, max - players.length) }).map((_, i) => (
        <li
          key={`empty-${i}`}
          className="flex items-center gap-3 rounded-xl border border-dashed border-slate-700 px-4 py-3 opacity-40"
        >
          <span className="h-10 w-10 rounded-full bg-slate-700" />
          <p className="text-sm text-slate-500">Waiting for player…</p>
        </li>
      ))}
    </ul>
  );
}
