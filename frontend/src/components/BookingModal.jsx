import React, { useState } from 'react';
import { Calendar, Clock, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { bookingsApi } from '../services/api';

export default function BookingModal({ provider, isOpen, onClose, onSuccess }) {
  const [serviceDate, setServiceDate] = useState('');
  const [serviceTime, setServiceTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState(false);

  if (!isOpen || !provider) return null;

  const estimatedTotal = (provider.hourly_rate || 500) * 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!serviceDate) {
      setError('Please select a service date.');
      return;
    }

    setLoading(true);
    try {
      await bookingsApi.create({
        provider_id: provider.id,
        service_date: serviceDate,
        service_time: serviceTime,
        notes: notes,
      });
      setBooked(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit booking request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {booked ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white">Booking Requested!</h3>
            <p className="text-slate-300 text-sm max-w-xs mx-auto">
              Your request for <strong className="text-purple-400">{provider.provider_name}</strong> on {serviceDate} at {serviceTime} has been sent.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl gradient-bg text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-400">Schedule Service</span>
              <h3 className="text-xl font-extrabold text-white mt-1">Book {provider.provider_name}</h3>
              <p className="text-xs text-slate-400">{provider.category_name} • ₹{provider.hourly_rate}/hr</p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" /> Service Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" /> Preferred Time Slot
              </label>
              <select
                value={serviceTime}
                onChange={(e) => setServiceTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                <option value="11:00 AM">11:00 AM - 01:00 PM</option>
                <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                <option value="06:00 PM">06:00 PM - 08:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-400" /> Job Notes / Address Details
              </label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specify your house address, door number, or issue description..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              ></textarea>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Estimated Total (2 hrs std):</span>
              <span className="text-base font-extrabold text-teal-400">₹{estimatedTotal.toFixed(2)}</span>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-600/30"
              >
                {loading ? 'Submitting...' : 'Confirm Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
