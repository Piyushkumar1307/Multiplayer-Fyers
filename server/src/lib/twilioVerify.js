const twilio = require('twilio');
const { validatePhoneNumber } = require('./phoneValidation');

function isPlaceholderCredential(value) {
  const v = String(value || '').trim();
  if (!v) return true;
  if (/paste|xxxx|your_|change_me|example/i.test(v)) return true;
  if (v.startsWith('ACxxxxxxxx') || v.startsWith('VAxxxxxxxx')) return true;
  return false;
}

function isTwilioConfigured() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
  if (
    isPlaceholderCredential(TWILIO_ACCOUNT_SID) ||
    isPlaceholderCredential(TWILIO_AUTH_TOKEN) ||
    isPlaceholderCredential(TWILIO_VERIFY_SERVICE_SID)
  ) {
    return false;
  }
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_VERIFY_SERVICE_SID);
}

function isDevOtpMode() {
  if (process.env.OTP_VERIFY_SKIP === 'true') return true;
  return process.env.NODE_ENV === 'development' && !isTwilioConfigured();
}

function getVerifyService() {
  if (!isTwilioConfigured()) return null;
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID);
}

/** Indian 10-digit → E.164 */
function toE164(phoneDigits) {
  const err = validatePhoneNumber(phoneDigits);
  if (err) throw new Error(err);
  return `+91${phoneDigits}`;
}

function getVerifyChannel() {
  const ch = String(process.env.TWILIO_VERIFY_CHANNEL || 'sms').toLowerCase();
  return ch === 'whatsapp' ? 'whatsapp' : 'sms';
}

async function sendVerificationOtp(phoneDigits) {
  const e164 = toE164(phoneDigits);

  if (isDevOtpMode()) {
    console.warn('[twilio] dev/skip mode: OTP not sent. Use OTP_DEV_CODE from env.');
    return { dev: true };
  }

  const service = getVerifyService();
  if (!service) {
    throw new Error('Phone verification is not configured. Contact the event host.');
  }

  try {
    await service.verifications.create({
      to: e164,
      channel: getVerifyChannel(),
    });
  } catch (err) {
    const code = err?.code;
    if (code === 20003) {
      throw new Error(
        'Invalid Twilio credentials. Use Live Account SID + Live Auth Token in server/.env.',
      );
    }
    if (code === 20008) {
      throw new Error(
        'Twilio Verify needs Live Account SID + Live Auth Token in server/.env (Test credentials do not work).',
      );
    }
    if (code === 20404) {
      throw new Error('Invalid TWILIO_VERIFY_SERVICE_SID. Create a service in Twilio Verify console.');
    }
    if (code === 60200 || code === 60203) {
      throw new Error('Invalid phone number for verification');
    }
    if (code === 60205) {
      throw new Error(
        'This number is not verified on the Twilio trial account. Use a verified test number.',
      );
    }
    throw new Error(err?.message || 'Failed to send verification code');
  }

  return { dev: false };
}

async function checkVerificationOtp(phoneDigits, code) {
  const e164 = toE164(phoneDigits);
  const trimmedCode = String(code || '').trim();

  if (!/^\d{4,8}$/.test(trimmedCode)) {
    throw new Error('Please enter a valid verification code');
  }

  const devCode = process.env.OTP_DEV_CODE || '123456';
  if (isDevOtpMode()) {
    if (trimmedCode !== devCode) {
      throw new Error('Invalid verification code');
    }
    return { dev: true };
  }

  const service = getVerifyService();
  if (!service) {
    throw new Error('Phone verification is not configured. Contact the event host.');
  }

  try {
    const check = await service.verificationChecks.create({
      to: e164,
      code: trimmedCode,
    });
    if (check.status !== 'approved') {
      throw new Error('Invalid or expired verification code');
    }
  } catch (err) {
    const twilioCode = err?.code;
    if (twilioCode === 20003) {
      throw new Error(
        'Invalid Twilio credentials. Use Live Account SID + Live Auth Token in server/.env.',
      );
    }
    if (twilioCode === 20008) {
      throw new Error(
        'Twilio Verify needs Live Account SID + Live Auth Token in server/.env (Test credentials do not work).',
      );
    }
    if (twilioCode === 20404) {
      throw new Error('Invalid TWILIO_VERIFY_SERVICE_SID. Create a service in Twilio Verify console.');
    }
    if (err.message?.includes('Invalid or expired')) throw err;
    throw new Error(err?.message || 'Verification failed');
  }

  return { dev: false };
}

module.exports = {
  sendVerificationOtp,
  checkVerificationOtp,
  toE164,
  isTwilioConfigured,
  isDevOtpMode,
};
