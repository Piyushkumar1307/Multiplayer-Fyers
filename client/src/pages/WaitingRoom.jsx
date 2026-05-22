import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRoom } from '../lib/api';
import { getPlayerId, isLoggedIn } from '../lib/auth';
import { getSocket, registerSocketPlayer } from '../lib/socket';
import PlayerList from '../components/PlayerList';
import { MAX_PLAYERS, MIN_PLAYERS_TO_START } from '../lib/constants';

export default function WaitingRoom() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const playerId = getPlayerId();
  const isHost = room?.hostId === playerId;

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/', { replace: true });
      return;
    }

    registerSocketPlayer(playerId);
    const socket = getSocket();

    async function load() {
      try {
        const data = await getRoom(code);
        setRoom(data.room);
        setPlayers(
          data.players.map((p) => ({
            ...p,
            isHost: p.id === data.room.hostId,
          })),
        );
      } catch (err) {
        setError(err.message);
      }
    }

    load();
    socket.emit('joinRoom', { roomCode: code, playerId });

    socket.on('roomUpdated', () => load());

    socket.on('gameStart', ({ roomCode }) => {
      navigate(`/game/${roomCode || code}`);
    });

    socket.on('returnToLobby', () => {
      navigate('/lobby', { replace: true });
    });

    return () => {
      socket.off('roomUpdated');
      socket.off('gameStart');
      socket.off('returnToLobby');
    };
  }, [code, navigate, playerId]);

  function startGame() {
    getSocket().emit('startGame', { roomCode: code, playerId });
  }

  return (
    <div className="min-h-svh min-h-dvh bg-slate-950 px-4 py-6 safe-top safe-bottom max-w-lg mx-auto w-full flex flex-col">
      <header className="text-center shrink-0 mb-6">
        <p className="text-xs text-slate-400 uppercase">Room code</p>
        <p className="text-3xl sm:text-4xl font-mono font-bold tracking-[0.25em] text-indigo-400 mt-1">
          {code}
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 text-amber-300 px-4 py-2 text-sm mt-4 animate-pulse">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Waiting ({players.length}/{MAX_PLAYERS})
        </div>
      </header>

      <div className="flex-1 overflow-y-auto min-h-0">
        <PlayerList players={players} max={MAX_PLAYERS} />
      </div>

      {error && <p className="mt-4 text-red-400 text-sm text-center shrink-0">{error}</p>}

      <footer className="shrink-0 mt-4 space-y-3">
        {isHost && players.length >= MIN_PLAYERS_TO_START && (
          <button
            type="button"
            onClick={startGame}
            className="w-full min-h-[52px] rounded-xl bg-emerald-600 py-4 font-bold text-lg active:scale-[0.98] touch-manipulation"
          >
            Start Game ({players.length})
          </button>
        )}
        {isHost && players.length < MIN_PLAYERS_TO_START && (
          <p className="text-center text-slate-500 text-sm">
            Need at least {MIN_PLAYERS_TO_START} players
          </p>
        )}
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
