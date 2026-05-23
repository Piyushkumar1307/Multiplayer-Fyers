import { getAdminToken } from './auth';
import { getApiUrl } from './url';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAdminToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const apiUrl = getApiUrl();
  let res;
  try {
    res = await fetch(`${apiUrl}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      `Cannot reach API at ${apiUrl}. Check VITE_API_URL and Render CORS (CLIENT_URL / ADMIN_URL).`,
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export function adminLogin(password) {
  return request('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export function listRooms() {
  return request('/api/admin/rooms');
}

export function createRoom(label) {
  return request('/api/admin/rooms', {
    method: 'POST',
    body: JSON.stringify({ label }),
  });
}

export function getRoomDetail(code) {
  return request(`/api/admin/rooms/${code}`);
}

export function startRoomGame(code) {
  return request(`/api/admin/rooms/${code}/start`, { method: 'POST' });
}

export function deleteAllRooms() {
  return request('/api/admin/rooms', { method: 'DELETE' });
}
