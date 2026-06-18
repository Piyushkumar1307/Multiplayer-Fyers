import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendVerificationOtp, registerWithOtp, establishSession } from '../lib/api';
import { validatePhoneNumber } from '../lib/phoneValidation';
import { isLoggedIn } from '../lib/auth';

const RESEND_SECONDS = 60;

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/lobby', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  function validateForm() {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return 'Name is required (min 2 characters)';
    }
    const phoneDigits = phone.replace(/\D/g, '');
    return validatePhoneNumber(phoneDigits);
  }

  async function handleSendOtp() {
    const formError = validateForm();
    if (formError) {
      setError(formError);
      return;
    }

    setError('');
    setDevOtpHint('');
    setLoading(true);
    try {
      const data = await sendVerificationOtp(phone.replace(/\D/g, ''));
      setOtpSent(true);
      setResendIn(RESEND_SECONDS);
      if (data.devMode) {
        setDevOtpHint(data.message || `Use code ${data.devCodeHint || '123456'}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndEnter(e) {
    e.preventDefault();
    const formError = validateForm();
    if (formError) {
      setError(formError);
      return;
    }
    if (!otpSent) {
      setError('Please send the verification code first');
      return;
    }
    const code = otp.replace(/\D/g, '');
    if (code.length < 4) {
      setError('Enter the code from SMS');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const trimmedName = name.trim();
      const phoneDigits = phone.replace(/\D/g, '');
      const data = await registerWithOtp(trimmedName, phoneDigits, code);
      await establishSession({
        sessionToken: data.sessionToken,
        playerId: data.playerId,
        name: trimmedName,
      });
      navigate('/instructions', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-950 to-indigo-950 px-4 py-6 safe-bottom">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/90 p-6 sm:p-8 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-white mb-1 leading-snug">
          BornToTrade Challenge
        </h1>
        <p className="text-center text-slate-400 text-sm mb-8">
          Verify your mobile number to join
        </p>

        <form onSubmit={handleVerifyAndEnter} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={loading}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Phone (10 digits)
            </label>
            <input
              type="tel"
              required
              pattern="\d{10}"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(next);
                if (next.length === 10) {
                  const msg = validatePhoneNumber(next);
                  setError(msg || '');
                } else {
                  setError((prev) =>
                    prev === 'Please enter a valid number' ||
                      prev === 'Phone must be a 10-digit number'
                      ? ''
                      : prev,
                  );
                }
              }}
              placeholder="9876543210"
              disabled={loading || otpSent}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white/50 placeholder:text-slate-500/70 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading || phone.length !== 10}
              className="w-full min-h-[52px] rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white hover:bg-emerald-500 disabled:opacity-50 touch-manipulation"
            >
              {loading ? 'Sending…' : 'Send verification code'}
            </button>
          ) : (
            <>
              {devOtpHint ? (
                <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200 text-center">
                  {devOtpHint}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 text-center">
                  Check SMS for your 6-digit code (trial: verified numbers only)
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="6-digit code"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white text-center text-xl tracking-[0.3em] font-mono placeholder:text-slate-500 placeholder:tracking-normal placeholder:text-base focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || resendIn > 0}
                className="w-full text-sm text-slate-400 hover:text-slate-200 disabled:opacity-40"
              >
                {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend verification code'}
              </button>
              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full min-h-[52px] rounded-xl bg-indigo-600 py-4 text-lg font-bold text-white hover:bg-indigo-500 disabled:opacity-50 touch-manipulation"
              >
                {loading ? 'Verifying…' : 'Verify & Enter the Market'}
              </button>
            </>
          )}

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
