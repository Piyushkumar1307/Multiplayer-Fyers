import { io } from 'socket.io-client';
import { getSocketUrl } from './url';

let socket = null;

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
  getSocket().emit('registerPlayer', { playerId });
}
