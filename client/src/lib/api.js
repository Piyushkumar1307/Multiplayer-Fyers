import { getSessionToken } from './auth';
import { getApiUrl } from './url';

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

export function joinRoom(roomCode) {
  return request('/api/rooms/join', {
    method: 'POST',
    body: JSON.stringify({ roomCode }),
  });
}

export function getRoom(code) {
  return request(`/api/rooms/${code}`);
}
