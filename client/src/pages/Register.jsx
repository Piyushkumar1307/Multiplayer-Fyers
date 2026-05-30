import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, establishSession } from '../lib/api';
import { canRegister, finishRegistrationFlow } from '../lib/sessionFlow';
import { validatePhoneNumber } from '../lib/phoneValidation';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canRegister()) {
      navigate('/instructions', { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canRegister()) {
      navigate('/instructions', { replace: true });
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    const phoneError = validatePhoneNumber(phoneDigits);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const trimmedName = name.trim();
      const data = await register(trimmedName, phoneDigits);
      await establishSession({
        sessionToken: data.sessionToken,
        playerId: data.playerId,
        name: trimmedName,
      });
      finishRegistrationFlow();
      navigate('/lobby', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-950 to-indigo-950 px-4 py-6 safe-bottom">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/90 p-6 sm:p-8 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-white mb-1 leading-snug">
          BornToTrade Challenge
        </h1>
        <p className="text-center text-slate-400 text-sm mb-8">
          New session — enter your details to join
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Phone (10 digits)
            </label>
            <input
              type="tel"
              required
              pattern="\d{10}"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(next);
                if (next.length === 10) {
                  const msg = validatePhoneNumber(next);
                  setError(msg || '');
                } else {
                  setError((prev) =>
                    prev === 'Please enter a valid number' || prev === 'Phone must be a 10-digit number'
                      ? ''
                      : prev,
                  );
                }
              }}
              placeholder="9876543210"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white/50 placeholder:text-slate-500/70 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[52px] rounded-xl bg-indigo-600 py-4 text-lg font-bold text-white hover:bg-indigo-500 disabled:opacity-50 touch-manipulation"
          >
            {loading ? 'Signing in…' : 'Enter the Market'}
          </button>
        </form>
      </div>
    </div>
  );
}
