import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StandingsTable from '../components/StandingsTable';
import { createRoom, deleteAllRooms, getRoomDetail, listRooms, startRoomGame } from '../lib/api';
import { clearAdminToken, isAdminLoggedIn } from '../lib/auth';
import { formatProfit } from '../lib/format';
import { connectAdminDashboard, subscribeToRoom } from '../lib/socket';

const STATUS_COLORS = {
  WAITING: 'text-amber-400 bg-amber-500/10',
  ACTIVE: 'text-emerald-400 bg-emerald-500/10',
  ENDED: 'text-slate-400 bg-slate-500/10',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [roomDetail, setRoomDetail] = useState(null);
  const [standings, setStandings] = useState([]);
  const [phase, setPhase] = useState(null);
  const [label, setLabel] = useState('');
  const [newRoomCode, setNewRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const selectedCodeRef = useRef(selectedCode);
  selectedCodeRef.current = selectedCode;

  const refreshRooms = useCallback(async () => {
    const data = await listRooms();
    setRooms(data);
  }, []);

  const syncPlayerCount = useCallback((code, count) => {
    setRoomDetail((prev) =>
      prev && prev.code === code ? { ...prev, playerCount: count } : prev,
    );
    setRooms((prev) =>
      prev.map((r) => (r.code === code ? { ...r, playerCount: count } : r)),
    );
  }, []);

  const applyStandingsPayload = useCallback(
    (code, payload) => {
      const nextStandings = payload.standings || [];
      const count = payload.playerCount ?? nextStandings.length;
      setStandings(nextStandings);
      setPhase(payload.phase ?? null);
      if (payload.updatedAt) setLastUpdate(payload.updatedAt);
      syncPlayerCount(code, count);
    },
    [syncPlayerCount],
  );

  const loadRoom = useCallback(async (code) => {
    if (!code) return;
    const data = await getRoomDetail(code);
    setRoomDetail(data.room);
    setStandings(data.standings || []);
    setPhase(data.room?.phase || null);
  }, []);

  const closeRoomPanel = useCallback(() => {
    setSelectedCode('');
    setRoomDetail(null);
    setStandings([]);
    setPhase(null);
    setLastUpdate(null);
  }, []);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/', { replace: true });
      return undefined;
    }

    refreshRooms().catch((err) => setError(err.message));

    const disconnectDashboard = connectAdminDashboard({
      onPanelRefresh: async (payload) => {
        await refreshRooms();
        const code = selectedCodeRef.current;
        if (payload?.roomCode && payload.roomCode === code) {
          setStandings(
            (payload.leaderboard || []).map((entry) => ({
              rank: entry.rank,
              playerId: entry.playerId,
              name: entry.name,
              cash: entry.netWorth,
              netWorth: entry.netWorth,
              profitLoss: entry.delta,
            })),
          );
          setPhase('ended');
          await loadRoom(payload.roomCode);
        }
      },
    });

    return disconnectDashboard;
  }, [navigate, refreshRooms, loadRoom]);

  useEffect(() => {
    if (!selectedCode) return undefined;

    loadRoom(selectedCode).catch((err) => setError(err.message));

    const unsubscribe = subscribeToRoom(selectedCode, {
      onStandings: (payload) => {
        if (payload.roomCode !== selectedCode) return;
        applyStandingsPayload(selectedCode, payload);
      },
      onGameEnded: async (payload) => {
        if (payload.roomCode !== selectedCode) return;
        setStandings(
          (payload.leaderboard || []).map((entry) => ({
            rank: entry.rank,
            playerId: entry.playerId,
            name: entry.name,
            cash: entry.netWorth,
            netWorth: entry.netWorth,
            profitLoss: entry.delta,
          })),
        );
        setPhase('ended');
        await loadRoom(selectedCode);
        await refreshRooms();
      },
      onError: (payload) => setError(payload.message),
    });

    return unsubscribe;
  }, [selectedCode, loadRoom, refreshRooms, applyStandingsPayload]);

  async function handleCreateRoom() {
    setError('');
    setLoading(true);
    try {
      const data = await createRoom(label.trim() || undefined);
      setNewRoomCode(data.roomCode);
      setLabel('');
      await refreshRooms();
      setSelectedCode(data.roomCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartGame() {
    if (!selectedCode) return;
    setError('');
    setLoading(true);
    try {
      await startRoomGame(selectedCode);
      await loadRoom(selectedCode);
      await refreshRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAllRooms() {
    if (rooms.length === 0) return;
    const ok = window.confirm(
      `Delete all ${rooms.length} room(s)? This removes history and kicks any active games.`,
    );
    if (!ok) return;

    setError('');
    setLoading(true);
    try {
      await deleteAllRooms();
      closeRoomPanel();
      setNewRoomCode('');
      await refreshRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAdminToken();
    navigate('/', { replace: true });
  }

  const selectedRoom = rooms.find((r) => r.code === selectedCode) || roomDetail;
  const joinedCount = Math.max(
    roomDetail?.playerCount ?? 0,
    selectedRoom?.playerCount ?? 0,
    standings.length,
  );
  const minPlayers = roomDetail?.minPlayersToStart ?? 5;
  const maxPlayers = roomDetail?.maxPlayers ?? selectedRoom?.maxPlayers ?? 20;
  const canStartGame =
    selectedRoom?.status === 'WAITING' && joinedCount >= minPlayers;

  return (
    <div className="min-h-svh bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-4 py-4 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-indigo-400">Admin panel</p>
            <h1 className="text-xl font-bold">Live leaderboard</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-400"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 lg:px-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-3">
            <h2 className="font-semibold text-sm text-slate-300">Create room</h2>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Session label (optional)"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={loading}
              onClick={handleCreateRoom}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-bold disabled:opacity-50"
            >
              Create &amp; get code
            </button>
            {newRoomCode && (
              <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/30 p-3 text-center">
                <p className="text-xs text-indigo-300 uppercase">Share this code</p>
                <p className="text-2xl font-mono font-bold tracking-widest text-indigo-200">
                  {newRoomCode}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="font-semibold text-sm text-slate-300">Rooms</h2>
              {rooms.length > 0 && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDeleteAllRooms}
                  className="text-[11px] uppercase tracking-wide text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  Delete all
                </button>
              )}
            </div>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {rooms.map((room) => (
                <li key={room.code}>
                  <button
                    type="button"
                    onClick={() => setSelectedCode(room.code)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm border ${
                      selectedCode === room.code
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold">{room.code}</span>
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[room.status] || STATUS_COLORS.WAITING}`}
                      >
                        {room.status}
                      </span>
                    </div>
                    {room.label && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{room.label}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {room.playerCount}/{room.maxPlayers} players
                    </p>
                    {room.status === 'ENDED' && room.winnerName && (
                      <p className="text-xs text-amber-400/90 mt-1 truncate">
                        🏆 {room.winnerName}
                        {room.winnerProfitLoss != null && (
                          <span className="text-emerald-400 font-mono ml-1">
                            {formatProfit(room.winnerProfitLoss)}
                          </span>
                        )}
                      </p>
                    )}
                  </button>
                </li>
              ))}
              {rooms.length === 0 && (
                <p className="text-slate-500 text-sm">No rooms yet.</p>
              )}
            </ul>
          </section>
        </aside>

        <section className="space-y-4">
          {selectedCode ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Monitoring</p>
                  <h2 className="text-3xl font-mono font-bold text-indigo-300">{selectedCode}</h2>
                  {roomDetail?.label && (
                    <p className="text-slate-400 text-sm mt-1">{roomDetail.label}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedRoom?.status === 'WAITING' && (
                    <>
                      <button
                        type="button"
                        disabled={loading || !canStartGame}
                        onClick={handleStartGame}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Start game
                      </button>
                      {!canStartGame && (
                        <span className="text-xs text-amber-400">
                          Need {minPlayers}–{maxPlayers} players ({joinedCount} joined)
                        </span>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    onClick={closeRoomPanel}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>

              {lastUpdate && (
                <p className="text-xs text-slate-500">
                  Last live update: {new Date(lastUpdate).toLocaleTimeString()}
                </p>
              )}

              {roomDetail?.status === 'ENDED' && roomDetail?.winner && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-amber-400">Winner (stored)</p>
                  <p className="text-lg font-bold text-amber-100">{roomDetail.winner.name}</p>
                  <p className="font-mono text-emerald-400">
                    {formatProfit(roomDetail.winner.profitLoss)}
                  </p>
                  {roomDetail.closedAt && (
                    <p className="text-xs text-slate-500 mt-1">
                      Closed {new Date(roomDetail.closedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <StandingsTable standings={standings} phase={phase} />
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center text-slate-500">
              Create a room or select one from the list to view live standings.
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </section>
      </main>
    </div>
  );
}
