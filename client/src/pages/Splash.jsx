import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../lib/auth';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/lobby', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-black px-6 pb-6 safe-bottom">
      <img
        src="/fyers-logo-hero.png"
        alt="FYERS"
        className="w-full max-w-[300px] sm:max-w-[340px] h-auto object-contain mb-8"
        draggable={false}
      />

      <div className="text-center mb-8">
        <p className="text-2xl sm:text-3xl font-bold text-white leading-snug">
          Born to Trade
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-white leading-snug mt-1">
          Challenge
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate(isLoggedIn() ? '/lobby' : '/instructions')}
        className="w-full max-w-md min-h-[56px] rounded-2xl bg-[#3342FF] text-lg font-bold text-white active:scale-[0.98] touch-manipulation"
      >
        Tap To Start
      </button>
    </div>
  );
}
