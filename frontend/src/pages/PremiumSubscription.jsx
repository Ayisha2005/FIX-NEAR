import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Check, 
  X, 
  Sparkles, 
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { premiumApi } from '../services/api';

export default function PremiumSubscription() {
  const { user, updateUserState } = useAuth();
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState('premium_monthly');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login?redirect=/subscribe');
      return;
    }
    setLoading(true);
    try {
      const res = await premiumApi.subscribe(selectedPlan);
      const { token: newToken, user: updatedUser } = res.data;
      updateUserState(updatedUser, newToken);
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || "Subscription payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 bg-amber-400/10 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold border border-amber-400/20">
          <Crown className="w-4 h-4 fill-amber-400" /> HomeServe Premium India
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Unlock Unlimited Direct <br />
          <span className="gradient-text">Provider Contact Details</span>
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          Skip contact masking fees forever. Get direct phone numbers, personal email addresses, and priority booking dispatch across India.
        </p>
      </div>

      {/* Pricing Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        
        {/* Free Plan */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Standard Tier</span>
            <div className="text-3xl font-extrabold text-white">Free</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Ideal for occasional home maintenance inquiries with standard contact masking.
            </p>
            <ul className="space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Search 5,000+ Verified Pros</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-400" /> Standard Booking Dispatch</li>
              <li className="flex items-center gap-2 text-slate-500"><X className="w-4 h-4 text-slate-600" /> Masked Phone & Email</li>
              <li className="flex items-center gap-2 text-slate-500"><X className="w-4 h-4 text-slate-600" /> Priority Booking Queue</li>
            </ul>
          </div>
          <button
            disabled
            className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed"
          >
            Current Basic Plan
          </button>
        </div>

        {/* Monthly Plan (Recommended) */}
        <div className="bg-slate-900 border-2 border-purple-500 rounded-3xl p-8 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-purple-600/20">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-bg text-white px-4 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase shadow">
            Most Popular
          </div>
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">Monthly Premium</span>
            <div className="text-4xl font-extrabold text-white">₹499 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Full unmasked contact directory with zero single-unlock charges.
            </p>
            <ul className="space-y-3 text-xs text-slate-200 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> <strong>Unlimited</strong> Phone & Email Unlocks</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Direct Call & WhatsApp Dispatch</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Priority Booking Response</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 24/7 Dedicated Support</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setSelectedPlan('premium_monthly');
              setIsCheckoutOpen(true);
            }}
            className="w-full py-3.5 rounded-xl gradient-bg text-white font-extrabold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Subscribe for ₹499/mo
          </button>
        </div>

        {/* Annual Plan */}
        <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-8 flex flex-col justify-between space-y-6 relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Annual Pass</span>
              <span className="bg-amber-400/20 text-amber-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/30">Save 33%</span>
            </div>
            <div className="text-4xl font-extrabold text-white">₹3,999 <span className="text-xs text-slate-400 font-normal">/ year</span></div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Best value for homeowners undergoing renovations across India.
            </p>
            <ul className="space-y-3 text-xs text-slate-200 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Everything in Monthly Pass</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> VIP Home Care Concierge</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Emergency Same-Day Dispatch</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setSelectedPlan('premium_annual');
              setIsCheckoutOpen(true);
            }}
            className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm transition-colors shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4 fill-slate-950" /> Subscribe for ₹3,999/yr
          </button>
        </div>

      </div>

      {/* Simulated Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            {success ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white">Welcome to Premium!</h3>
                <p className="text-slate-300 text-xs max-w-xs mx-auto">
                  Your account has been upgraded. You now have instant unmasked access to all provider contact numbers and emails across India.
                </p>
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    navigate('/search');
                  }}
                  className="w-full py-3 rounded-xl gradient-bg text-white font-extrabold text-sm shadow-lg"
                >
                  Explore Unlocked Marketplace
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-xs uppercase font-bold text-amber-400">Secure Checkout (UPI / NetBanking / Cards)</span>
                  <h3 className="text-xl font-extrabold text-white mt-1">Activate Premium Pass</h3>
                  <p className="text-xs text-slate-400">
                    Plan: <strong className="text-white">{selectedPlan === 'premium_monthly' ? '₹499 / Month' : '₹3,999 / Year'}</strong>
                  </p>
                </div>

                <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <span className="font-mono">Demo Razorpay / UPI</span>
                  </div>
                  <div className="font-mono text-sm tracking-wider text-slate-200">upi_user@okaxis</div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>CURRENCY: INR (₹)</span>
                    <span>STATUS: READY</span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl gradient-bg text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-md"
                  >
                    {loading ? 'Processing...' : 'Confirm Subscription'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
