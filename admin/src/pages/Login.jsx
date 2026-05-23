import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../lib/api';
import { setAdminToken } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await adminLogin(password);
      setAdminToken(token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-svh flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4"
      >
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-indigo-400">Admin</p>
          <h1 className="text-2xl font-bold mt-1">Live Dashboard</h1>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3"
          autoComplete="current-password"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl bg-indigo-600 py-3 font-bold disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
