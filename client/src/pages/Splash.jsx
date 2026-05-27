import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-svh min-h-dvh flex flex-col bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white max-w-lg mx-auto w-full lg:max-w-2xl">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.35em] text-indigo-300 mb-4">
          Fyers
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white mb-2">
          Born to Trade
        </h1>
        <p className="text-lg sm:text-xl font-bold text-amber-400 uppercase tracking-widest">
          Challenge
        </p>
        <p className="mt-8 text-slate-400 text-sm max-w-xs">
          Trading Simulation
        </p>
      </div>

      <footer className="shrink-0 px-4 pb-6 safe-bottom">
        <button
          type="button"
          onClick={() => navigate('/instructions')}
          className="w-full min-h-[56px] rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-900/50 active:scale-[0.98] touch-manipulation"
        >
          Tap to Start
        </button>
      </footer>
    </div>
  );
}
