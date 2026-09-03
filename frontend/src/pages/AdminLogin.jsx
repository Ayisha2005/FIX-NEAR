import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Key, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityKey, setSecurityKey] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.adminLogin({
        email,
        password,
        security_key: securityKey
      });

      const { token, user } = res.data;
      localStorage.setItem('homeserve_token', token);
      localStorage.setItem('homeserve_user', JSON.stringify(user));
      setToken(token);
      setUser(user);

      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Admin Credentials or Security Key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-purple-900/40 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-pink-600 p-3 flex items-center justify-center mx-auto shadow-xl shadow-purple-600/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-purple-400" /> Super Admin Portal
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Executive Login</h2>
          <p className="text-xs text-slate-400">Restricted system administration & website management</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-950/70 border border-red-800/80 rounded-xl text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" /> Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ayisha@gmail.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ayisha123"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-purple-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-pink-400" /> Secret Security Key
            </label>
            <input
              type="password"
              value={securityKey}
              onChange={(e) => setSecurityKey(e.target.value)}
              placeholder="AYISHA"
              className="w-full bg-slate-950 border border-purple-800/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 font-mono font-bold tracking-widest"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Verifying Admin Authority...' : 'Access Executive Portal'}</span>
          </button>
        </form>

        <div className="text-center text-[10px] text-slate-500 border-t border-slate-800/80 pt-3">
          Unauthorized access attempts are monitored and recorded.
        </div>
      </div>
    </div>
  );
}
