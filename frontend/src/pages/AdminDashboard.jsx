import React, { useState, useEffect } from 'react';
import { 
  Users, 
  IndianRupee, 
  Crown, 
  CheckCircle, 
  TrendingUp, 
  Filter,
  BarChart3,
  ShieldAlert,
  Activity,
  Trash2,
  Sparkles,
  Server
} from 'lucide-react';
import { adminApi } from '../services/api';
import StatsCard from '../components/StatsCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState('Online');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, logs
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(roleFilter),
        adminApi.getLogs()
      ]);
      setStats(statsRes.data);
      setUsersList(usersRes.data.users || []);
      setLogs(logsRes.data.logs || []);
      setSystemStatus(logsRes.data.system_status || 'Online');
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [roleFilter]);

  const handleTogglePremium = async (userId) => {
    try {
      await adminApi.toggleUserPremium(userId);
      fetchAdminData();
    } catch (err) {
      alert("Failed to toggle premium status.");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}" (#${userId})? This action cannot be undone.`)) {
      return;
    }
    try {
      await adminApi.deleteUser(userId);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  if (loading || !stats) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-slate-400 text-sm font-semibold">Verifying Super Admin AYISHA Authority...</p>
      </div>
    );
  }

  const kpis = stats.kpis || {};
  const categories = stats.category_breakdown || [];
  const recentBookings = stats.recent_bookings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Super Admin Executive Header */}
      <div className="bg-slate-900 border border-purple-900/50 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Super Admin Portal
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Welcome, AYISHA <span className="text-sm font-semibold text-purple-400 bg-purple-950 px-2.5 py-0.5 rounded-full border border-purple-800">Master Control</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Full website governance, live MongoDB Atlas logs, and Indian Rupee (₹) analytics.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            User Management ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'logs' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Backend & DB Logs
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Gross Revenue"
          value={`₹${kpis.total_revenue?.toFixed(2)}`}
          icon={IndianRupee}
          change="Real-time INR Analytics"
          trend="up"
          color="teal"
        />
        <StatsCard
          title="Registered Users"
          value={kpis.total_users}
          icon={Users}
          change={`${kpis.total_customers} Customers / ${kpis.total_providers} Pros`}
          trend="up"
          color="purple"
        />
        <StatsCard
          title="Completed Services"
          value={kpis.completed_bookings}
          icon={CheckCircle}
          change={`${kpis.total_bookings} total requests`}
          trend="up"
          color="blue"
        />
        <StatsCard
          title="Active Premium Pass Members"
          value={kpis.premium_users}
          icon={Crown}
          change={`₹${kpis.subscription_revenue?.toFixed(2)} sub MRR`}
          trend="up"
          color="amber"
        />
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-400" /> Revenue Stream Composition
                </h3>
                <p className="text-xs text-slate-400">Booking service fees vs subscription passes</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Service Booking Fees</span>
                    <span className="text-teal-400 font-bold">₹{kpis.booking_revenue?.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-teal-400 h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Premium Contact Subscriptions</span>
                    <span className="text-amber-400 font-bold">₹{kpis.subscription_revenue?.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" /> Category Provider Distribution
                </h3>
                <p className="text-xs text-slate-400">Total active professionals per service vertical</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {categories.map((c, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="text-xs text-slate-400 block truncate">{c.category}</span>
                    <div className="text-xl font-extrabold text-white">{c.provider_count} <span className="text-xs font-normal text-slate-500">pros</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white">Recent System Bookings</h2>
              <p className="text-xs text-slate-400">Global transaction audit log</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-slate-500">#{b.id}</td>
                      <td className="py-3 px-4 text-white font-medium">{b.customer_name}</td>
                      <td className="py-3 px-4 text-purple-300 font-medium">{b.provider_name}</td>
                      <td className="py-3 px-4 text-slate-400">{b.service_date}</td>
                      <td className="py-3 px-4 text-teal-400 font-bold">₹{b.total_price?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="capitalize px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">System User Governance</h2>
              <p className="text-xs text-slate-400">Manage platform permissions, toggle premium passes, or delete users</p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <Filter className="w-4 h-4 text-purple-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="customer">Customers</option>
                <option value="provider">Service Providers</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Subscription Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">#{u.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{u.name}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2.5 py-0.5 rounded font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-950 text-purple-400 border border-purple-800/40' :
                        u.role === 'provider' ? 'bg-teal-950 text-teal-400 border border-teal-800/40' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {u.is_premium ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 fill-amber-400" /> Premium Pass Active
                        </span>
                      ) : (
                        <span className="text-slate-500">Standard Free</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleTogglePremium(u.id)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700"
                      >
                        {u.is_premium ? 'Demote' : 'Grant Premium'}
                      </button>

                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-semibold border border-red-800/80 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-400" /> Live Backend & Database Connection Logs
              </h2>
              <p className="text-xs text-slate-400">Real-time health check, MongoDB Atlas cluster status, and audit logs</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold">
              {systemStatus}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2 max-h-96 overflow-y-auto">
            {logs.map((l, i) => (
              <div key={i} className="flex items-start gap-3 py-1 border-b border-slate-900">
                <span className="text-slate-500 font-bold">{l.timestamp}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  l.level === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-purple-950 text-purple-400 border border-purple-800'
                }`}>
                  [{l.level}]
                </span>
                <span className="text-slate-400 font-bold">[{l.source}]</span>
                <span className="text-slate-200">{l.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
