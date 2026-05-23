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

  return (
    <div className="min-h-svh min-h-dvh flex flex-col bg-slate-950 px-4 py-6 safe-top safe-bottom max-w-lg mx-auto w-full">
      <header className="text-center mb-8 shrink-0">
        <p className="text-slate-400 text-sm">Welcome, {getPlayerName() || 'Trader'}</p>
        <h1 className="text-2xl font-bold text-white mt-1">Join Game</h1>
      </header>

      <div className="space-y-3 mt-4">
        <p className="text-xs text-slate-500 uppercase text-center">Room code</p>
        <p className="text-center text-slate-400 text-sm px-2">
          Enter the code your admin shared with you. Rooms are not listed here.
        </p>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="ABCD"
            maxLength={4}
            disabled={loading}
            className="flex-1 min-h-[52px] rounded-xl border border-slate-600 bg-slate-800 px-4 text-xl uppercase tracking-widest text-center font-mono disabled:opacity-50"
          />
          <button
            type="button"
            disabled={loading}
            onClick={handleJoin}
            className="min-h-[52px] min-w-[80px] rounded-xl bg-emerald-600 font-bold disabled:opacity-50 touch-manipulation"
          >
            Join
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-red-400 text-sm text-center shrink-0">{error}</p>
      )}
    </div>
  );
}
