import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoom } from '../lib/api';
import { getPlayerId, isLoggedIn } from '../lib/auth';
import { endPlaySession } from '../lib/sessionFlow';
import { getSocket } from '../lib/socket';
import { useRoomSocket } from '../hooks/useRoomSocket';
import PlayerList from '../components/PlayerList';
import { MAX_PLAYERS, MIN_PLAYERS_TO_START } from '../lib/constants';
import { formatProfit } from '../lib/format';

export default function WaitingRoom() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [roomStatus, setRoomStatus] = useState('WAITING');
  const [winnerName, setWinnerName] = useState(null);
  const [winnerProfitLoss, setWinnerProfitLoss] = useState(null);
  const [error, setError] = useState('');
  const playerId = getPlayerId();
  const isClosed = roomStatus === 'ENDED';
  useRoomSocket(code, playerId, Boolean(code && playerId));

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/register', { replace: true });
      return;
    }

    const socket = getSocket();

    async function load() {
      try {
        const data = await getRoom(code);
        setRoomStatus(data.room.status);
        setWinnerName(data.room.winnerName);
        setWinnerProfitLoss(data.room.winnerProfitLoss);
        setPlayers(data.players);
      } catch (err) {
        if (err.message === 'Invalid session' || err.message === 'Missing session token') {
          navigate('/register', { replace: true });
          return;
        }
        setError(err.message);
      }
    }

    load();

    const onRoomUpdated = () => load();

    const onGameStart = ({ roomCode }) => {
      navigate(`/game/${roomCode || code}`);
    };

    const onReturnToLobby = () => {
      endPlaySession();
      navigate('/instructions', { replace: true });
    };

    const onRoomClosed = () => {
      navigate('/lobby', { replace: true });
    };

    socket.on('roomUpdated', onRoomUpdated);
    socket.on('gameStart', onGameStart);
    socket.on('returnToLobby', onReturnToLobby);
    socket.on('roomClosed', onRoomClosed);

    return () => {
      socket.off('roomUpdated', onRoomUpdated);
      socket.off('gameStart', onGameStart);
      socket.off('returnToLobby', onReturnToLobby);
      socket.off('roomClosed', onRoomClosed);
    };
  }, [code, navigate, playerId]);

  return (
    <div className="min-h-svh min-h-dvh bg-slate-950 px-4 py-6 safe-top safe-bottom max-w-lg mx-auto w-full flex flex-col">
      <header className="text-center shrink-0 mb-6">
        <p className="text-xs text-slate-400 uppercase">Room code</p>
        <p className="text-3xl sm:text-4xl font-mono font-bold tracking-[0.25em] text-indigo-400 mt-1">
          {code}
        </p>
        {isClosed ? (
          <div className="inline-flex flex-col items-center gap-1 rounded-2xl bg-slate-800 border border-slate-600 px-4 py-3 text-sm mt-4">
            <span className="text-slate-400 uppercase text-xs tracking-wide">Room closed</span>
            {winnerName && (
              <p className="text-amber-300 font-semibold">
                Winner: {winnerName}
                {winnerProfitLoss != null && (
                  <span className="text-emerald-400 font-mono ml-2">
                    {formatProfit(winnerProfitLoss)}
                  </span>
                )}
              </p>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 text-amber-300 px-4 py-2 text-sm mt-4 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Waiting for admin ({players.length}/{MAX_PLAYERS})
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto min-h-0">
        <PlayerList players={players} max={MAX_PLAYERS} />
      </div>

      {!isClosed && (
        <p className="text-center text-slate-500 text-sm mt-4 shrink-0 px-2">
          Need at least {MIN_PLAYERS_TO_START} players before admin can start
          ({players.length}/{MAX_PLAYERS} joined).
        </p>
      )}

      {isClosed && (
        <p className="text-center text-slate-500 text-sm mt-4 shrink-0">
          This session is over. Ask admin for a new room code.
        </p>
      )}

      {error && <p className="mt-4 text-red-400 text-sm text-center shrink-0">{error}</p>}

      <footer className="shrink-0 mt-4">
        <button
          type="button"
          onClick={() => navigate('/lobby')}
          className="w-full min-h-[44px] rounded-xl border border-slate-600 text-slate-400 text-sm touch-manipulation"
        >
          Back to lobby
        </button>
      </footer>
    </div>
  );
}
