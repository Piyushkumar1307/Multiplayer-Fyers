import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinRoom } from '../lib/api';
import { getPlayerName, isLoggedIn } from '../lib/auth';

export default function Lobby() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  async function handleJoin() {
    const c = joinCode.trim().toUpperCase();
    if (c.length !== 4) {
      setError('Enter the 4-letter room code shared by the admin');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await joinRoom(c);
      navigate(`/room/${c}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    handleJoin();
  }

  return (
    <div className="min-h-svh min-h-dvh flex flex-col bg-slate-950 px-4 py-6 safe-top safe-bottom max-w-lg mx-auto w-full">
      <header className="text-center mb-8 shrink-0">
        <p className="text-slate-400 text-sm">Welcome, {getPlayerName() || 'Trader'}</p>
        <h1 className="text-2xl font-bold text-white mt-1">Join Game</h1>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 mt-4 w-full">
        <div>
          <p className="text-xs text-slate-500 uppercase text-center mb-2">Room code</p>
          <p className="text-center text-slate-400 text-sm px-2 mb-3">
            Enter the code your admin shared with you. Rooms are not listed here.
          </p>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="ABCD"
            maxLength={4}
            disabled={loading}
            autoComplete="off"
            autoCapitalize="characters"
            className="w-full min-h-[52px] rounded-xl border border-slate-600 bg-slate-800 px-4 text-xl uppercase tracking-widest text-center font-mono disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[52px] rounded-xl bg-emerald-600 text-lg font-bold disabled:opacity-50 touch-manipulation active:scale-[0.98]"
        >
          {loading ? 'Joining…' : 'Join'}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-red-400 text-sm text-center shrink-0">{error}</p>
      )}
    </div>
  );
}
