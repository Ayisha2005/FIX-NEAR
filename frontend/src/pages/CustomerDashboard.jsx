import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Crown, 
  Unlock, 
  Star, 
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingsApi, contactsApi } from '../services/api';
import AddReviewModal from '../components/AddReviewModal';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [unlockedPros, setUnlockedPros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bookRes, contactRes] = await Promise.all([
        bookingsApi.list(),
        contactsApi.getUnlocked()
      ]);
      setBookings(bookRes.data.bookings || []);
      setUnlockedPros(contactRes.data.unlocked_providers || []);
    } catch (err) {
      console.error("Failed to load customer dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;
    try {
      await bookingsApi.updateStatus(bookingId, 'cancelled');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3.5 h-3.5" /> Completed</span>;
      case 'accepted':
        return <span className="bg-blue-950/60 text-blue-400 border border-blue-800/60 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><Clock className="w-3.5 h-3.5" /> Accepted</span>;
      case 'pending':
        return <span className="bg-amber-950/60 text-amber-400 border border-amber-800/60 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><AlertCircle className="w-3.5 h-3.5" /> Pending Approval</span>;
      case 'cancelled':
      case 'rejected':
        return <span className="bg-red-950/60 text-red-400 border border-red-800/60 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><XCircle className="w-3.5 h-3.5" /> {status.charAt(0).toUpperCase() + status.slice(1)}</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Customer Dashboard</span>
          <h1 className="text-3xl font-extrabold text-white mt-1 flex items-center gap-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage your active service requests and unlocked contact directory.</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
          <div className={`p-3 rounded-xl ${user?.is_premium ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 'bg-slate-800 text-slate-400'}`}>
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Subscription Status</span>
            <div className="text-sm font-extrabold text-white flex items-center gap-1">
              {user?.is_premium ? (
                <span className="text-amber-400">Premium Pass (₹499/mo)</span>
              ) : (
                <span>Free Plan</span>
              )}
            </div>
            {!user?.is_premium && (
              <Link to="/subscribe" className="text-xs text-purple-400 hover:text-purple-300 font-semibold mt-0.5 inline-block">
                Upgrade for Unlimited Access →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">My Service Appointments</h2>
            <p className="text-xs text-slate-400">Track status, contact providers, or submit reviews</p>
          </div>
          <Link to="/search" className="px-4 py-2 rounded-xl gradient-bg text-white font-bold text-xs shadow hover:opacity-90">
            + Book New Service
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <Calendar className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-medium">You haven't scheduled any home service appointments yet.</p>
            <Link to="/search" className="inline-block text-xs font-bold text-purple-400 hover:text-purple-300">
              Browse Available Professionals →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      <div>{b.provider_name}</div>
                      <div className="text-xs font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-purple-400" /> {b.provider_phone}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <span className="bg-slate-800 text-purple-400 px-2.5 py-1 rounded border border-purple-900/40">
                        {b.category_name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-300">
                      <div>{b.service_date}</div>
                      <div className="text-slate-500">{b.service_time}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-white">₹{b.total_price?.toFixed(2)}</td>
                    <td className="py-4 px-4">{getStatusBadge(b.status)}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold hover:bg-red-900/60"
                        >
                          Cancel
                        </button>
                      )}

                      {b.status === 'completed' && !b.review_id && (
                        <button
                          onClick={() => setSelectedReviewBooking(b)}
                          className="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400 text-xs font-semibold hover:bg-amber-900/60 flex items-center gap-1 inline-flex"
                        >
                          <Star className="w-3 h-3 fill-amber-400" /> Leave Review
                        </button>
                      )}

                      {b.status === 'completed' && b.review_id && (
                        <span className="text-xs text-slate-500 font-semibold italic flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-400" /> Reviewed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Unlock className="w-5 h-5 text-emerald-400" /> Unlocked Provider Directory
          </h2>
          <p className="text-xs text-slate-400">Direct phone numbers and email addresses available for instant contact in India</p>
        </div>

        {unlockedPros.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs italic">
            No unlocked contacts yet. Unlock provider contacts on search or profile pages.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedPros.map((p) => (
              <div key={p.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={p.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={p.provider_name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{p.provider_name}</h4>
                    <span className="text-xs text-purple-400">{p.category_name}</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl text-xs font-mono space-y-1 border border-slate-800/80">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {p.phone}
                  </div>
                  <div className="text-indigo-300 truncate">
                    {p.email}
                  </div>
                </div>

                <Link
                  to={`/providers/${p.id}`}
                  className="block text-center py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
                >
                  View Profile & Book
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddReviewModal
        booking={selectedReviewBooking}
        isOpen={!!selectedReviewBooking}
        onClose={() => setSelectedReviewBooking(null)}
        onSuccess={() => fetchDashboardData()}
      />
    </div>
  );
}
