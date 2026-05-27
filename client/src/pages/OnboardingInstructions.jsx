import { useNavigate } from 'react-router-dom';
import InstructionContent from '../components/InstructionContent';

export default function OnboardingInstructions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-svh min-h-dvh flex flex-col bg-slate-950 text-white max-w-lg mx-auto w-full lg:max-w-2xl">
      <header className="shrink-0 border-b border-indigo-500/40 bg-indigo-950/80 px-4 py-4 safe-top text-center">
        <p className="text-xs uppercase tracking-widest text-indigo-300">Fyers Born to Trade</p>
        <h1 className="text-xl font-bold text-white mt-1">How to play</h1>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-5 py-6">
        <InstructionContent />
      </main>

      <footer className="shrink-0 border-t border-slate-800 px-4 py-4 safe-bottom">
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="w-full min-h-[52px] rounded-xl bg-indigo-600 text-lg font-bold text-white active:scale-[0.98] touch-manipulation"
        >
          Next
        </button>
      </footer>
    </div>
  );
}
