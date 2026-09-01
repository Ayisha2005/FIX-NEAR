import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, UserPlus, User, Mail, Key, Briefcase, Phone, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi, servicesApi } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'provider' ? 'provider' : 'customer';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);

  // Provider fields
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [hourlyRate, setHourlyRate] = useState('500');
  const [phone, setPhone] = useState('+91 98400 11223');
  const [location, setLocation] = useState('Chennai, Tamil Nadu');
  const [bio, setBio] = useState('Certified home service professional in India.');
  const [servicesOffered, setServicesOffered] = useState('General Maintenance & Repair');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    servicesApi.getCategories().then((res) => {
      setCategories(res.data.categories || []);
      if (res.data.categories?.length) setCategoryId(res.data.categories[0].id);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        ...(role === 'provider' ? {
          category_id: categoryId,
          hourly_rate: parseFloat(hourlyRate),
          phone,
          location,
          bio,
          services_offered: servicesOffered
        } : {})
      };

      await authApi.register(payload);
      setSuccessMsg("Account created successfully! Redirecting to Sign In page...");
      
      setTimeout(() => {
        navigate(`/login?email=${encodeURIComponent(email)}&registered=true`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-bg p-2.5 flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create HomeServe Account</h2>
          <p className="text-xs text-slate-400">Join as a homeowner or verified service professional (India)</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2.5 rounded-xl transition-all ${
              role === 'customer'
                ? 'gradient-bg text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            I Need Home Services (Customer)
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`py-2.5 rounded-xl transition-all ${
              role === 'provider'
                ? 'gradient-bg text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            I Provide Services (Professional)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" /> Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arun Kumar"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="arun@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Provider Extra Fields */}
          {role === 'provider' && (
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <span className="block font-bold text-teal-400 uppercase tracking-wider text-[11px]">
                Service Professional Details
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Primary Specialization</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Hourly Rate (₹/hr)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Service City / Region</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Services Offered (comma separated)</label>
                <input
                  type="text"
                  value={servicesOffered}
                  onChange={(e) => setServicesOffered(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-bg text-white font-extrabold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
