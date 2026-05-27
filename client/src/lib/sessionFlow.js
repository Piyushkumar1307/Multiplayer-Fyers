import { clearAuth } from './auth';
import { getSocket } from './socket';

export function endPlaySession() {
  clearAuth();
  const socket = getSocket();
  if (socket.connected) {
    socket.disconnect();
  }
}
