import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        <div className="relative rounded-3xl p-8 sm:p-10 space-y-7 bg-white border border-slate-200 shadow-2xl">
          {/* Branded header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <KmLogo variant="dark" size="lg" />
            </div>
            <div className="space-y-1.5">
              <span className="section-eyebrow">Dealership Portal</span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Sign In</h2>
              <p className="text-xs text-slate-500">Authenticated access for KM Car Deals staff only</p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1.5 tracking-wide">Username</label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="Enter admin username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 focus:bg-white transition-colors duration-300"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1.5 tracking-wide">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus:border-slate-900 focus:bg-white transition-colors duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent-apple w-full flex items-center justify-center gap-2 disabled:opacity-50 mt-2 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-5 border-t border-slate-100 text-center">
            <button
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none rounded-sm"
            >
              Return to Public Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
