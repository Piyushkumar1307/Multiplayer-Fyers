function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Timer({ seconds, total = 180 }) {
  const pct = Math.max(0, Math.min(100, (seconds / total) * 100));
  const barColor =
    seconds <= 30 ? 'bg-red-500' : seconds <= 60 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>Trading — auto-sell when timer ends</span>
        <span
          className={`font-mono font-semibold ${
            seconds <= 30 ? 'text-red-400' : 'text-slate-200'
          }`}
        >
          {formatTime(seconds)}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
