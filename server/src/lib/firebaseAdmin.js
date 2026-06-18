const admin = require('firebase-admin');

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return admin;

  if (process.env.FIREBASE_AUTH_SKIP === 'true') {
    initialized = true;
    return null;
  }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not set');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(json);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  initialized = true;
  return admin;
}

function phoneDigitsFromE164(e164) {
  const digits = String(e164 || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 10) return digits;
  return null;
}

async function verifyFirebasePhoneToken(idToken, expectedPhoneDigits) {
  if (process.env.FIREBASE_AUTH_SKIP === 'true') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FIREBASE_AUTH_SKIP is not allowed in production');
    }
    return { phone: expectedPhoneDigits, uid: 'dev-skip' };
  }

  const firebase = initFirebaseAdmin();
  const decoded = await firebase.auth().verifyIdToken(idToken);

  const tokenPhone = decoded.phone_number;
  if (!tokenPhone) {
    throw new Error('Phone number not verified with Firebase');
  }

  const tokenDigits = phoneDigitsFromE164(tokenPhone);
  if (!tokenDigits || tokenDigits !== expectedPhoneDigits) {
    throw new Error('Phone number does not match verification');
  }

  return { phone: tokenDigits, uid: decoded.uid };
}

module.exports = {
  initFirebaseAdmin,
  verifyFirebasePhoneToken,
  phoneDigitsFromE164,
};
