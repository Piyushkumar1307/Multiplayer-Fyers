import { useEffect } from 'react';
import { getSocket, registerSocketPlayer } from '../lib/socket';

/**
 * Keeps the player registered on the socket and re-joins the room after
 * reconnect or when the tab becomes visible again (background tab recovery).
 */
export function useRoomSocket(roomCode, playerId, enabled = true) {
  useEffect(() => {
    if (!enabled || !roomCode || !playerId) return undefined;

    registerSocketPlayer(playerId);
    const socket = getSocket();
    const code = String(roomCode).toUpperCase();

    function rejoinRoom() {
      socket.emit('joinRoom', { roomCode: code, playerId });
    }

    rejoinRoom();
    socket.on('connect', rejoinRoom);

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        rejoinRoom();
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      socket.off('connect', rejoinRoom);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [roomCode, playerId, enabled]);
}
