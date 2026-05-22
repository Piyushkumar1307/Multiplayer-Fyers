import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, joinRoom, listRooms } from '../lib/api';
import { getPlayerName, isLoggedIn } from '../lib/auth';
import { MAX_PLAYERS } from '../lib/constants';

export default function Lobby() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showJoinList, setShowJoinList] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/', { replace: true });
      return;
    }
    listRooms().then(setRooms).catch(() => {});
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

  async function handleJoin(code) {
    const c = (code || joinCode).trim().toUpperCase();
    if (c.length !== 4) {
      setError('Enter a 4-letter room code');
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
        <button
          type="button"
          onClick={() => setShowJoinList((v) => !v)}
          className="w-full rounded-2xl border-2 border-indigo-500 py-5 text-lg font-bold hover:bg-indigo-500/10 active:scale-[0.98] touch-manipulation"
        >
          Join Room
        </button>
      </div>

      {showJoinList && (
        <div className="mt-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="ABCD"
              maxLength={4}
              className="flex-1 min-h-[48px] rounded-xl border border-slate-600 bg-slate-800 px-4 text-lg uppercase tracking-widest text-center font-mono"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => handleJoin()}
              className="min-h-[48px] min-w-[72px] rounded-xl bg-emerald-600 font-bold disabled:opacity-50 touch-manipulation"
            >
              Go
            </button>
          </div>
          {rooms.length > 0 && (
            <ul className="space-y-2 pb-4">
              <p className="text-xs text-slate-500 uppercase">Open rooms</p>
              {rooms.map((r) => (
                <li key={r.code}>
                  <button
                    type="button"
                    onClick={() => handleJoin(r.code)}
                    className="w-full min-h-[52px] flex justify-between items-center rounded-xl border border-slate-700 bg-slate-800 px-4 active:bg-slate-700 touch-manipulation"
                  >
                    <span className="font-mono font-bold text-lg">{r.code}</span>
                    <span className="text-slate-400 text-sm">
                      {r.playerCount}/{MAX_PLAYERS}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 text-red-400 text-sm text-center shrink-0">{error}</p>
      )}
    </div>
  );
}
