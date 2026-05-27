import InstructionContent from './InstructionContent';

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

      <div className="flex-1 flex flex-col justify-center px-5 py-6 overflow-y-auto">
        <h2 className="text-lg font-bold text-white text-center mb-5">How to play</h2>
        <InstructionContent />
      </div>

      <footer className="shrink-0 border-t border-slate-800 px-4 py-3 safe-bottom text-center">
        <p className="text-xs text-slate-500">Keep this tab open</p>
      </footer>
    </div>
  );
}
