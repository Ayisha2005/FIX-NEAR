import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  Star, 
  Clock, 
  CheckCircle, 
  Calendar, 
  User, 
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingsApi, providersApi } from '../services/api';
import StatsCard from '../components/StatsCard';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [servicesOffered, setServicesOffered] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bookRes, profileRes] = await Promise.all([
        bookingsApi.list(),
        providersApi.getById(user?.provider?.id || 1).catch(() => null)
      ]);
      setBookings(bookRes.data.bookings || []);

      const prov = user?.provider || (profileRes?.data?.provider);
      if (prov) {
        setProviderProfile(prov);
        setBio(prov.bio || '');
        setHourlyRate(prov.hourly_rate || 500);
        setPhone(prov.phone || '');
        setLocation(prov.location || '');
        setServicesOffered(prov.services_offered || '');
      }
    } catch (err) {
      console.error("Failed to load provider dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await bookingsApi.updateStatus(bookingId, newStatus);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      await providersApi.updateProfile({
        bio,
        hourly_rate: parseFloat(hourlyRate),
        phone,
        location,
        services_offered: servicesOffered
      });
      setSaveSuccess("Profile settings updated successfully!");
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const pendingRequests = bookings.filter((b) => b.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Service Provider Portal (India)</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Welcome, {user?.name}!
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage incoming booking dispatches and update your public marketplace profile.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Earned (INR)"
          value={`₹${totalEarnings.toFixed(2)}`}
          icon={IndianRupee}
          color="teal"
        />
        <StatsCard
          title="Rating Average"
          value={providerProfile?.rating ? providerProfile.rating.toFixed(1) : '5.0'}
          icon={Star}
          color="amber"
        />
        <StatsCard
          title="Pending Requests"
          value={pendingRequests.length}
          icon={Clock}
          color="purple"
        />
        <StatsCard
          title="Jobs Completed"
          value={completedBookings.length}
          icon={CheckCircle}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white">Incoming Service Requests</h2>
              <p className="text-xs text-slate-400">Accept or reject homeowner appointment requests</p>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading requests...</div>
            ) : bookings.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs italic">
                No active booking requests assigned yet.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Client: {b.customer_name}</span>
                        <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{b.service_date} at {b.service_time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-teal-400">₹{b.total_price?.toFixed(2)}</div>
                        <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {b.status}
                        </span>
                      </div>
                    </div>

                    {b.notes && (
                      <p className="text-slate-300 text-xs italic bg-slate-900 p-2.5 rounded-xl border border-slate-800/60">
                        "{b.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-end space-x-2 pt-1">
                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'rejected')}
                            className="px-4 py-2 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold hover:bg-red-900/60"
                          >
                            Reject Request
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'accepted')}
                            className="px-4 py-2 rounded-xl gradient-bg text-white text-xs font-bold hover:opacity-90 shadow-md"
                          >
                            Accept Booking
                          </button>
                        </>
                      )}

                      {b.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'completed')}
                          className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold hover:bg-emerald-900 flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark Job Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 sticky top-24">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" /> Edit Profile Settings
              </h2>
              <p className="text-xs text-slate-400">Update rates in ₹, bio & listed services</p>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs">
                {saveSuccess}
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs">
                {saveError}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Hourly Rate (₹)</label>
                <input
                  type="number"
                  step="50"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Public Bio</label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Services Offered (comma separated)</label>
                <input
                  type="text"
                  value={servicesOffered}
                  onChange={(e) => setServicesOffered(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Location / City (India)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl gradient-bg text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center space-x-1.5 shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Settings'}</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
