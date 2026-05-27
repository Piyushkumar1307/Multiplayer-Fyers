import { getSessionToken, clearAuth, setAuth } from './auth';
import { getApiUrl } from './url';
import { getSocket, resetSocket, registerSocketPlayer } from './socket';

async function parseJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getSessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const apiUrl = getApiUrl();
  let res;
  try {
    res = await fetch(`${apiUrl}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      `Cannot reach API at ${apiUrl}. Check VITE_API_URL and that the server is running.`,
    );
  }

  const data = await parseJson(res);

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
    }
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

/** Register without Authorization header — avoids stale tokens breaking re-login */
export async function register(name, phone) {
  const apiUrl = getApiUrl();
  let res;
  try {
    res = await fetch(`${apiUrl}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${apiUrl}. Check VITE_API_URL and that the server is running.`,
    );
  }

  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  if (!data.sessionToken || !data.playerId) {
    throw new Error('Registration failed. Please try again.');
  }
  return data;
}

export async function getMe() {
  return request('/api/auth/me');
}

/** Save session, fresh socket, and verify token before lobby */
export async function establishSession({ sessionToken, playerId, name }) {
  setAuth({ sessionToken, playerId, name });
  resetSocket();
  const socket = getSocket();
  if (!socket.connected) socket.connect();
  await getMe();
  registerSocketPlayer(playerId);
}

export function joinRoom(roomCode) {
  return request('/api/rooms/join', {
    method: 'POST',
    body: JSON.stringify({ roomCode }),
  });
}

export function getRoom(code) {
  return request(`/api/rooms/${code}`);
}
