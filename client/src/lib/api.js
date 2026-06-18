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

async function publicPost(path, body) {
  const apiUrl = getApiUrl();
  let res;
  try {
    res = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${apiUrl}. Check VITE_API_URL and that the server is running.`,
    );
  }

  const data = await parseJson(res);
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export function sendVerificationOtp(phone) {
  return publicPost('/api/otp/send', { phone });
}

export async function registerWithOtp(name, phone, code) {
  const data = await publicPost('/api/register', { name, phone, code });
  if (!data.sessionToken || !data.playerId) {
    throw new Error('Registration failed. Please try again.');
  }
  return data;
}

export async function getMe() {
  return request('/api/auth/me');
}

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
