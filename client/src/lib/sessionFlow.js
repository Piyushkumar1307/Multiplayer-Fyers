import { clearAuth } from './auth';
import { getSocket, resetSocket } from './socket';

/** Full logout — only when user explicitly signs out or invalid session */
export function endPlaySession() {
  clearAuth();
  resetSocket();
}

/** After a game ends: keep login, go play again in a new room */
export function afterGameEnd() {
  resetSocket();
  const socket = getSocket();
  if (socket.connected) socket.connect();
}
