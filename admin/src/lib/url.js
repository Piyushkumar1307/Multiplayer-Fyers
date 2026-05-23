/** Production API — used on Netlify when VITE_* is not set */
const PRODUCTION_API = 'https://multiplayer-fyers.onrender.com';
const LOCAL_API = 'http://localhost:4000';

function stripTrailingSlash(url) {
  return String(url || '').replace(/\/+$/, '');
}

function resolveBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return stripTrailingSlash(import.meta.env.VITE_API_URL);
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_API;
    }
  }

  if (import.meta.env.DEV) return LOCAL_API;
  return PRODUCTION_API;
}

export function getApiUrl() {
  return resolveBaseUrl();
}

export function getSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) {
    return stripTrailingSlash(import.meta.env.VITE_SOCKET_URL);
  }
  return getApiUrl();
}
