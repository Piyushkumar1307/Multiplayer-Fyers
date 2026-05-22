import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';
import Confetti from '../components/Confetti';
import { getPlayerId } from '../lib/auth';

const LOBBY_DELAY_SEC = 5;

export default function Results() {
  const { roomCode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const leaderboard = state?.leaderboard || [];
  const winner = state?.winner || leaderboard[0];
  const myId = getPlayerId();
  const iWon = winner?.playerId === myId;
  const [countdown, setCountdown] = useState(LOBBY_DELAY_SEC);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          navigate('/lobby', { replace: true });
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [navigate]);

  return (
    <div className="min-h-svh min-h-dvh bg-gradient-to-b from-slate-950 to-indigo-950 px-4 py-6 relative overflow-hidden max-w-lg mx-auto w-full safe-top safe-bottom">
      <Confetti active={Boolean(winner)} intense={iWon} />

      <div className="text-center relative z-10">
        <h1 className="text-2xl font-bold mb-1">Game Over</h1>
        <p className="text-slate-400 text-sm font-mono mb-4">{roomCode}</p>

        {winner && (
          <div className="mb-6 rounded-2xl border-2 border-amber-400/60 bg-amber-500/10 px-4 py-5">
            <p className="text-[10px] uppercase tracking-widest text-amber-400 mb-1">
              Winner
            </p>
            <p className="text-2xl font-bold text-amber-100">{winner.name}</p>
            <p className="mt-1 text-xl font-mono text-emerald-400">
              {winner.delta >= 0 ? '+' : ''}₹{winner.delta?.toLocaleString('en-IN')}
            </p>
          </div>
        )}

        <Leaderboard leaderboard={leaderboard} showConfetti={false} />

        <p className="mt-6 text-sm text-indigo-300 animate-pulse">
          Returning to lobby in {countdown}s…
        </p>
      </div>
    </div>
  );
}
