const SEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;

const lastSendByPhone = new Map();
const sendCountByPhone = new Map();

function checkSendAllowed(phone) {
  const now = Date.now();
  const last = lastSendByPhone.get(phone);
  if (last && now - last < SEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((SEND_COOLDOWN_MS - (now - last)) / 1000);
    return { ok: false, error: `Please wait ${waitSec}s before requesting another code` };
  }

  const hourKey = `${phone}:${Math.floor(now / (60 * 60 * 1000))}`;
  const count = sendCountByPhone.get(hourKey) || 0;
  if (count >= MAX_SENDS_PER_HOUR) {
    return { ok: false, error: 'Too many OTP requests. Try again later.' };
  }

  return { ok: true, hourKey };
}

function recordSend(phone, hourKey) {
  lastSendByPhone.set(phone, Date.now());
  sendCountByPhone.set(hourKey, (sendCountByPhone.get(hourKey) || 0) + 1);
}

module.exports = { checkSendAllowed, recordSend };
