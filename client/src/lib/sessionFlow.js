import { clearAuth } from './auth';
import { resetSocket } from './socket';

const REGISTRATION_GATE_KEY = 'mayRegister';

/** Wipe client session — previous player no longer exists for this device */
export function endPlaySession() {
  clearAuth();
  sessionStorage.removeItem(REGISTRATION_GATE_KEY);
  resetSocket();
}

export function beginRegistrationFlow() {
  endPlaySession();
  sessionStorage.setItem(REGISTRATION_GATE_KEY, '1');
}

export function canRegister() {
  return sessionStorage.getItem(REGISTRATION_GATE_KEY) === '1';
}

export function finishRegistrationFlow() {
  sessionStorage.removeItem(REGISTRATION_GATE_KEY);
}
