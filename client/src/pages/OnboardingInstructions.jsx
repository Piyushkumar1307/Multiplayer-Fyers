import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InstructionContent from '../components/InstructionContent';
import { beginRegistrationFlow, endPlaySession } from '../lib/sessionFlow';

export default function OnboardingInstructions() {
  const navigate = useNavigate();

  useEffect(() => {
    endPlaySession();
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-950 to-indigo-950 px-4 py-6 safe-bottom min-h-0">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/90 p-6 sm:p-8 shadow-xl flex flex-col max-h-full min-h-0">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-white mb-6 shrink-0">
          Instruction
        </h1>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain mb-6">
          <InstructionContent />
        </div>

        <button
          type="button"
          onClick={() => {
            beginRegistrationFlow();
            navigate('/register');
          }}
          className="w-full min-h-[52px] shrink-0 rounded-xl bg-[#3342FF] text-lg font-bold text-white active:scale-[0.98] touch-manipulation"
        >
          Next — Register to play
        </button>
      </div>
    </div>
  );
}
