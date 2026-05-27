import { useNavigate } from 'react-router-dom';
import InstructionContent from '../components/InstructionContent';
import { endPlaySession } from '../lib/sessionFlow';

export default function OnboardingInstructions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-svh min-h-dvh flex flex-col bg-black text-white max-w-lg mx-auto w-full lg:max-w-2xl">
      <header className="shrink-0 border-b border-zinc-800 bg-zinc-950 px-4 py-4 safe-top text-center">
        <img
          src="/fyers-logo.png"
          alt="FYERS"
          className="h-8 mx-auto object-contain mb-3"
          draggable={false}
        />
        <p className="text-xs uppercase tracking-widest text-[#FFE500]">Born to Trade Challenge</p>
        <h1 className="text-xl font-bold text-white mt-1">How to play</h1>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-5 py-6">
        <InstructionContent />
      </main>

      <footer className="shrink-0 border-t border-slate-800 px-4 py-4 safe-bottom">
        <button
          type="button"
          onClick={() => {
            endPlaySession();
            navigate('/register');
          }}
          className="w-full min-h-[52px] rounded-xl bg-[#3342FF] text-lg font-bold text-white active:scale-[0.98] touch-manipulation"
        >
          Next
        </button>
      </footer>
    </div>
  );
}
