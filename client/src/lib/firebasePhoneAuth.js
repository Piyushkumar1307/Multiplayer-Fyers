import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

/** 10-digit Indian mobile → E.164 for Firebase */
export function toE164India(phoneDigits) {
  return `+91${phoneDigits}`;
}

/**
 * @param {string} containerId - DOM id for reCAPTCHA widget
 * @returns {Promise<{ confirmationResult: import('firebase/auth').ConfirmationResult, recaptchaVerifier: RecaptchaVerifier }>}
 */
export async function sendPhoneOtp(phoneDigits, containerId = 'recaptcha-container') {
  const auth = getFirebaseAuth();
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error('Verification widget failed to load. Refresh and try again.');
  }

  const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'normal',
  });

  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      toE164India(phoneDigits),
      recaptchaVerifier,
    );
    return { confirmationResult, recaptchaVerifier };
  } catch (err) {
    recaptchaVerifier.clear();
    const code = err?.code || '';
    if (code === 'auth/too-many-requests') {
      throw new Error('Too many attempts. Please wait a few minutes and try again.');
    }
    if (code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number');
    }
    if (code === 'auth/captcha-check-failed') {
      throw new Error('Security check failed. Refresh the page and try again.');
    }
    throw new Error(err?.message || 'Failed to send verification code');
  }
}

export async function confirmPhoneOtp(confirmationResult, code) {
  const credential = await confirmationResult.confirm(code.trim());
  return credential.user.getIdToken();
}
