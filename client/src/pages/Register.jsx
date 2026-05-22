import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../lib/api';
import { setAuth, isLoggedIn } from '../lib/auth';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) navigate('/lobby', { replace: true });
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(name.trim(), phone.replace(/\D/g, ''));
      setAuth({
        sessionToken: data.sessionToken,
        playerId: data.playerId,
        name: name.trim(),
      });
      navigate('/lobby');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-svh min-h-dvh flex items-center justify-center bg-gradient-to-b from-slate-950 to-indigo-950 px-4 py-6 safe-top safe-bottom">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/90 p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-center text-white mb-1">
          Stock Market Simulator
        </h1>
        <p className="text-center text-slate-400 text-sm mb-8">
          Virtual trading · 2 players · 3 min round
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
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
            {loading ? 'Joining…' : 'Enter the Market'}
          </button>
        </form>
      </div>
    </div>
  );
}
