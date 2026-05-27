import { io } from 'socket.io-client';
import { getSocketUrl } from './url';

let socket = null;

export function resetSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });
  }
  return socket;
}

export function registerSocketPlayer(playerId) {
  if (!playerId) return;
  const s = getSocket();
  if (!s.connected) s.connect();
  s.emit('registerPlayer', { playerId });
}
