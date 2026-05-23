import { io } from 'socket.io-client';
import { getAdminToken } from './auth';
import { getSocketUrl } from './url';

let socket;

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

export function connectAdminDashboard(handlers = {}) {
  const s = getSocket();
  s.emit('adminConnect', { adminToken: getAdminToken() });

  if (handlers.onPanelRefresh) {
    s.on('adminPanelRefresh', handlers.onPanelRefresh);
  }

  return () => {
    s.off('adminPanelRefresh', handlers.onPanelRefresh);
  };
}

export function subscribeToRoom(roomCode, handlers = {}) {
  const s = getSocket();
  const code = roomCode.toUpperCase();

  s.emit('adminSubscribe', { roomCode: code, adminToken: getAdminToken() });

  if (handlers.onStandings) {
    s.on('standingsUpdated', handlers.onStandings);
  }
  if (handlers.onGameEnded) {
    s.on('gameEnded', handlers.onGameEnded);
  }
  if (handlers.onError) {
    s.on('adminError', handlers.onError);
  }

  return () => {
    s.off('standingsUpdated', handlers.onStandings);
    s.off('gameEnded', handlers.onGameEnded);
    s.off('adminError', handlers.onError);
  };
}
