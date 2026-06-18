import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinRoom, getMe } from '../lib/api';
import { getPlayerName, getPlayerId, isLoggedIn } from '../lib/auth';
import { registerSocketPlayer } from '../lib/socket';
import { endPlaySession } from '../lib/sessionFlow';

export default function Lobby() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!isLoggedIn()) {
        navigate('/register', { replace: true });
        return;
      }
      try {
        await getMe();
        if (cancelled) return;
        registerSocketPlayer(getPlayerId());
        setSessionReady(true);
      } catch {
        if (cancelled) return;
        endPlaySession();
        navigate('/register', { replace: true });
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
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
      if (err.message === 'Invalid session' || err.message === 'Missing session token') {
        endPlaySession();
        navigate('/register', { replace: true });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    handleJoin();
  }

  function openInstructions() {
    navigate('/instructions', { state: { from: 'lobby' } });
  }

  function confirmLogout() {
    setShowLogoutConfirm(false);
    endPlaySession();
    navigate('/', { replace: true });
  }

  if (!sessionReady) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        Checking session…
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 px-4 py-6 safe-bottom">
      <header className="text-center mb-6 shrink-0">
        <p className="text-slate-400 text-sm">Welcome, {getPlayerName() || 'Trader'}</p>
        <h1 className="text-2xl font-bold text-white mt-1">Room</h1>
        <p className="text-slate-500 text-sm mt-1">Enter a code to join the next game</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 mt-2 w-full flex-1">
        <div>
          <p className="text-xs text-slate-500 uppercase text-center mb-2">Room code</p>
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
          {loading ? 'Joining…' : 'Join room'}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-red-400 text-sm text-center shrink-0">{error}</p>
      )}

      <footer className="shrink-0 mt-6 space-y-3">
        <button
          type="button"
          onClick={openInstructions}
          className="w-full min-h-[48px] rounded-xl border border-indigo-500/50 bg-indigo-500/10 text-indigo-200 font-semibold touch-manipulation"
        >
          Instructions
        </button>
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full min-h-[44px] rounded-xl border border-slate-600 text-slate-400 text-sm touch-manipulation"
        >
          Log out
        </button>
      </footer>

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 safe-bottom"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-900 p-6 shadow-xl animate-[fadeIn_0.2s_ease-out]">
            <h2 id="logout-title" className="text-lg font-bold text-white text-center mb-2">
              Log out?
            </h2>
            <p className="text-sm text-slate-400 text-center mb-6">
              You will need to verify your phone with SMS again to rejoin.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="min-h-[48px] rounded-xl border border-slate-600 bg-slate-800 text-white font-semibold touch-manipulation"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="min-h-[48px] rounded-xl bg-red-600 text-white font-semibold touch-manipulation"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
