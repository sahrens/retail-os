import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import * as api from '@/lib/api';
import shopConfig from '@/shop.config';

export function Login() {
  const setUser = useStore(s => s.setUser);
  const [step, setStep] = useState<'email' | 'code' | 'name'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.auth.requestOtp(email);
      setStep('code');
      setTimeout(() => codeInputRef.current?.focus(), 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.auth.verifyOtp(email, code);
      if (res.needsName) {
        setStep('name');
      } else {
        setUser(res.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.auth.setName(name);
      const { user } = await api.auth.me();
      setUser(user as any);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCooldown(30);
    const interval = setInterval(() => {
      setCooldown(c => { if (c <= 1) { clearInterval(interval); return 0; } return c - 1; });
    }, 1000);
    try { await api.auth.requestOtp(email); } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: shopConfig.colors.bg }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold" style={{ color: shopConfig.colors.text }}>
            {shopConfig.name}
          </h1>
          {shopConfig.tagline && (
            <p className="mt-1 text-sm" style={{ color: shopConfig.colors.muted }}>{shopConfig.tagline}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-medium mb-4" style={{ color: shopConfig.colors.text }}>Team Login</h2>

          {step === 'email' && (
            <form onSubmit={handleRequestOtp}>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': shopConfig.colors.primary } as any}
                placeholder="you@example.com"
                autoFocus
              />
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="mt-4 w-full py-3 text-white font-medium rounded-lg transition-opacity disabled:opacity-50"
                style={{ background: shopConfig.colors.primary }}
              >
                {loading ? 'Sending...' : 'Send login link'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerifyOtp}>
              <p className="text-sm text-gray-500 mb-4">
                We sent a login link to <span className="font-medium text-gray-700">{email}</span>.
              </p>
              <label className="block text-sm font-medium text-gray-600 mb-2">Login code</label>
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': shopConfig.colors.primary } as any}
                placeholder="000000"
              />
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="mt-4 w-full py-3 text-white font-medium rounded-lg transition-opacity disabled:opacity-50"
                style={{ background: shopConfig.colors.primary }}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
              <div className="mt-3 flex items-center justify-between">
                <button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }}
                  className="text-sm text-gray-400 hover:text-gray-600">Change email</button>
                <button type="button" onClick={handleResend} disabled={cooldown > 0}
                  className="text-sm disabled:text-gray-300" style={{ color: shopConfig.colors.primary }}>
                  {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend'}
                </button>
              </div>
            </form>
          )}

          {step === 'name' && (
            <form onSubmit={handleSetName}>
              <p className="text-sm text-gray-500 mb-4">Welcome! What should we call you?</p>
              <label className="block text-sm font-medium text-gray-600 mb-2">Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': shopConfig.colors.primary } as any}
                placeholder="e.g. Spencer"
                autoFocus
              />
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="mt-4 w-full py-3 text-white font-medium rounded-lg transition-opacity disabled:opacity-50"
                style={{ background: shopConfig.colors.primary }}
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: shopConfig.colors.muted }}>
          Powered by <a href="https://github.com/sahrens/retail-os" className="underline hover:opacity-70" target="_blank" rel="noopener">RetailOS</a>
        </p>
      </div>
    </div>
  );
}
