import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { KmLogo } from '../common/KmLogo';
import { loginApi, setAuthToken } from '../../lib/api';

interface AdminLoginModalProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginApi(username, password);
      setAuthToken(result.token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-obsidian" />
      <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl animate-orb-1" />
      <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute inset-0 bg-noise opacity-40" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="relative rounded-3xl p-8 sm:p-10 space-y-7 glass-dark shadow-premium">
          {/* Branded header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-lg shadow-amber-900/30">
                <ShieldCheck className="w-7 h-7 text-slate-950" />
              </div>
            </div>
            <div className="flex justify-center">
              <KmLogo variant="white" size="lg" />
            </div>
            <div className="space-y-1.5">
              <span className="section-eyebrow-light">Dealership Portal</span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Staff Sign In</h2>
              <p className="text-xs text-slate-400">Authenticated access for KM Car Deals staff only</p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5 tracking-wide">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Enter admin username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 focus:bg-white/10 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5 tracking-wide">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60 focus:bg-white/10 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent-apple w-full flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-5 border-t border-white/10 text-center">
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
            >
              Return to Public Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
