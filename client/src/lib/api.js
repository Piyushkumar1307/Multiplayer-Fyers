import { getSessionToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getSessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      `Cannot reach API at ${API_URL}. Start the server: cd server && npm run dev`,
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export function register(name, phone) {
  return request('/api/register', {
    method: 'POST',
    body: JSON.stringify({ name, phone }),
  });
}

export function createRoom() {
  return request('/api/rooms/create', { method: 'POST' });
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
