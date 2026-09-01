import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Crown, ShieldCheck, X, Sparkles, Phone, Mail } from 'lucide-react';
import { contactsApi } from '../services/api';

export default function ContactUnlockModal({ provider, isOpen, onClose, onUnlocked }) {
  const [loading, setLoading] = useState(false);
  const [unlockedData, setUnlockedData] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen || !provider) return null;

  const handleSingleUnlock = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await contactsApi.unlock(provider.id);
      setUnlockedData(res.data.contact);
      if (onUnlocked) onUnlocked(provider.id, res.data.contact);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unlock provider contact details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {unlockedData ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Contact Unlocked!</h3>
            <p className="text-xs text-slate-300">
              Direct contact info for <strong className="text-purple-400">{provider.provider_name}</strong>:
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-2 font-mono text-sm">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Phone className="w-4 h-4" />
                <span>{unlockedData.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-indigo-300">
                <Mail className="w-4 h-4" />
                <span className="truncate">{unlockedData.email}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl gradient-bg text-white font-semibold shadow-lg hover:opacity-90"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Unlock Contact Information</h3>
              <p className="text-xs text-slate-400">
                Get direct phone & email access for <strong className="text-white">{provider.provider_name}</strong>.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs">
                {error}
              </div>
            )}

            <div className="gradient-bg p-0.5 rounded-xl">
              <div className="bg-slate-900 p-4 rounded-[10px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Crown className="w-4 h-4 mr-1 fill-amber-400" /> Premium Pass
                  </span>
                  <span className="text-xs font-extrabold text-teal-300">₹499 / mo</span>
                </div>
                <p className="text-xs text-slate-300">
                  Unlimited contact unlocks across all Indian service categories + Priority dispatch.
                </p>
                <Link
                  to="/subscribe"
                  onClick={onClose}
                  className="w-full py-2 rounded-lg bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center justify-center hover:bg-amber-300 transition-colors shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Upgrade to Premium (₹499)
                </Link>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 text-center">
              <p className="text-xs text-slate-400 mb-3">Or perform a single provider contact unlock:</p>
              <button
                onClick={handleSingleUnlock}
                disabled={loading}
                className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition-colors"
              >
                {loading ? 'Unlocking...' : 'Unlock This Contact Only'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
