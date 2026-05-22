const SESSION_KEY = 'sessionToken';
const PLAYER_ID_KEY = 'playerId';
const PLAYER_NAME_KEY = 'playerName';

export function getSessionToken() {
  return localStorage.getItem(SESSION_KEY);
}

export function getPlayerId() {
  return localStorage.getItem(PLAYER_ID_KEY);
}

export function getPlayerName() {
  return localStorage.getItem(PLAYER_NAME_KEY);
}

export function setAuth({ sessionToken, playerId, name }) {
  localStorage.setItem(SESSION_KEY, sessionToken);
  localStorage.setItem(PLAYER_ID_KEY, playerId);
  if (name) localStorage.setItem(PLAYER_NAME_KEY, name);
}

export function clearAuth() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PLAYER_ID_KEY);
  localStorage.removeItem(PLAYER_NAME_KEY);
}

export function isLoggedIn() {
  return Boolean(getSessionToken() && getPlayerId());
}
