import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, LogIn, Key, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const registeredEmail = searchParams.get('email') || '';
  const isJustRegistered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (registeredEmail) {
      setEmail(registeredEmail);
    }
  }, [registeredEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'provider') navigate('/provider-dashboard');
      else navigate(redirect === '/' ? '/customer-dashboard' : redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPw) => {
    setEmail(demoEmail);
    setPassword(demoPw);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-bg p-2.5 flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign In to HomeServe</h2>
          <p className="text-xs text-slate-400">Access your bookings, contacts & service dashboard</p>
        </div>

        {isJustRegistered && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Account created successfully! Please sign in with your credentials.</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-bg text-white font-extrabold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Demo Login Auto-fill Bar */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
            Quick Demo Login One-Click Fill:
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleDemoFill('alex@example.com', 'customer123')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500 text-slate-300 text-left truncate"
            >
              <div className="font-bold text-white">Customer (Standard)</div>
              <div className="text-[10px] text-slate-500">alex@example.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('sarah@example.com', 'premium123')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 text-left truncate"
            >
              <div className="font-bold text-amber-400">Customer (Premium)</div>
              <div className="text-[10px] text-slate-500">sarah@example.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('david.plumbing@homeserve.com', 'provider123')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-teal-500 text-slate-300 text-left truncate"
            >
              <div className="font-bold text-teal-400">Service Provider</div>
              <div className="text-[10px] text-slate-500">david.plumbing@...</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@homeserve.com', 'admin123')}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500 text-slate-300 text-left truncate"
            >
              <div className="font-bold text-purple-400">Platform Admin</div>
              <div className="text-[10px] text-slate-500">admin@homeserve.com</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
