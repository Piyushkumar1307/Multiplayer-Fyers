import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, joinRoom } from '../lib/api';
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

  async function handleCreate() {
    setError('');
    setLoading(true);
    try {
      const { roomCode } = await createRoom();
      navigate(`/room/${roomCode}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    const c = joinCode.trim().toUpperCase();
    if (c.length !== 4) {
      setError('Enter the 4-letter room code shared by the host');
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
      <header className="text-center mb-6 shrink-0">
        <p className="text-slate-400 text-sm">Welcome, {getPlayerName() || 'Trader'}</p>
        <h1 className="text-2xl font-bold text-white mt-1">Lobby</h1>
      </header>

      <div className="flex flex-col gap-3 w-full shrink-0">
        <button
          type="button"
          disabled={loading}
          onClick={handleCreate}
          className="w-full rounded-2xl bg-indigo-600 py-5 text-lg font-bold hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 touch-manipulation"
        >
          Create Room
        </button>
      </div>

      <div className="mt-8 space-y-3">
        <p className="text-xs text-slate-500 uppercase text-center">Join with code</p>
        <p className="text-center text-slate-400 text-sm px-2">
          You need the host&apos;s 4-letter room code — open rooms are not listed here.
        </p>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="ABCD"
            maxLength={4}
            disabled={loading}
            className="flex-1 min-h-[48px] rounded-xl border border-slate-600 bg-slate-800 px-4 text-lg uppercase tracking-widest text-center font-mono disabled:opacity-50"
          />
          <button
            type="button"
            disabled={loading}
            onClick={handleJoin}
            className="min-h-[48px] min-w-[72px] rounded-xl bg-emerald-600 font-bold disabled:opacity-50 touch-manipulation"
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
