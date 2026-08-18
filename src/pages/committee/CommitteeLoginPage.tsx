import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { api } from '@/services/api';

export const CommitteeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.loginAdmin(username, password);
      if (res.success && res.user) {
        if (res.user.role === 'EVENT_COORDINATOR' && res.user.assignedEventId) {
          navigate('/committee/event-scanner');
        } else {
          navigate('/committee/dashboard');
        }
      } else {
        setError(res.message || 'Invalid username or password credentials.');
      }
    } catch {
      setError('Authentication server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset helper for effortless committee evaluation
  const setQuickRole = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-cyber-card border border-cyan-500/20 shadow-glow-cyan/20"
        >
          {/* Brand Icon */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-[2px] mx-auto mb-3 shadow-glow-cyan">
              <div className="w-full h-full bg-[#080C15] rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-2xl font-display font-black text-white">Committee Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
              EvoXis'26 Official Staff, Reception & Coordinator Access
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Username / Coordinator ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. reception or evoxisadmin"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Access Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-display font-bold text-sm text-black bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-glow-cyan transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Secure Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Presets */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-3 text-center">
              Quick One-Click Test Accounts:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setQuickRole('reception', 'sriram2026')}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-cyan-300 font-medium transition-colors"
              >
                Reception Desk
              </button>
              <button
                type="button"
                onClick={() => setQuickRole('coord_te01', 'coord2026')}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 text-[11px] text-purple-300 font-medium transition-colors"
              >
                TE01 Desk
              </button>
              <button
                type="button"
                onClick={() => setQuickRole('evoxisadmin', 'evoxis2026!')}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-[11px] text-amber-300 font-medium transition-colors"
              >
                Super Admin
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommitteeLoginPage;
