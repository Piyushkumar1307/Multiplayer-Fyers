import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { endPlaySession } from '../lib/sessionFlow';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    endPlaySession();
  }, []);

  return (
    <div className="min-h-svh min-h-dvh flex flex-col bg-black text-white max-w-lg mx-auto w-full lg:max-w-2xl">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <img
          src="/fyers-logo.png"
          alt="FYERS"
          className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-contain mb-8"
          draggable={false}
        />

        <div className="flex flex-col items-center gap-4 w-full">
          <img
            src="/born-to-trade-logo.png"
            alt="#BornToTrade"
            className="w-full max-w-[300px] sm:max-w-[340px] h-auto object-contain"
            draggable={false}
          />
          <p className="text-center text-xl sm:text-2xl font-black uppercase tracking-wide text-white">
            Born to Trade
          </p>
          <p className="text-center text-lg sm:text-xl font-bold uppercase tracking-[0.25em] text-[#FFE500]">
            Challenge
          </p>
        </div>
      </div>

      <footer className="shrink-0 px-4 pb-6 safe-bottom">
        <button
          type="button"
          onClick={() => navigate('/instructions')}
          className="w-full min-h-[56px] rounded-2xl bg-[#3342FF] text-lg font-bold text-white shadow-lg shadow-blue-900/40 active:scale-[0.98] touch-manipulation"
        >
          Tap to Start
        </button>
      </footer>
    </div>
  );
}
