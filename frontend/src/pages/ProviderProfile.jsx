import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Briefcase, 
  Phone, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  CheckCircle, 
  ArrowLeft 
} from 'lucide-react';
import { providersApi } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import BookingModal from '../components/BookingModal';
import ContactUnlockModal from '../components/ContactUnlockModal';
import ProviderMap from '../components/ProviderMap';

export default function ProviderProfile() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isUnlockOpen, setIsUnlockOpen] = useState(false);

  const fetchProviderDetails = async () => {
    setLoading(true);
    try {
      const res = await providersApi.getById(id);
      setProvider(res.data.provider);
    } catch (err) {
      setError(err.response?.data?.message || 'Provider not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-slate-400 text-sm">Loading professional profile...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Provider Profile Not Found</h2>
        <Link to="/search" className="inline-block px-6 py-2.5 rounded-xl gradient-bg text-white font-semibold text-sm">
          Return to Marketplace Search
        </Link>
      </div>
    );
  }

  const servicesList = provider.services_offered
    ? provider.services_offered.split(',').map((s) => s.trim())
    : ['General Home Maintenance'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <Link to="/search" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white gap-1 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Search Results
      </Link>

      {/* Main Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-8 items-start justify-between relative">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <img
                src={provider.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                alt={provider.provider_name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-purple-500/50 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-teal-500 text-slate-950 px-2 py-0.5 rounded-full text-xs font-extrabold flex items-center shadow">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified India
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-md bg-purple-950/60 text-purple-400 border border-purple-800/40">
                {provider.category_name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {provider.provider_name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 mr-1" />
                  <span className="font-bold text-sm text-white">{provider.rating ? provider.rating.toFixed(1) : '5.0'}</span>
                  <span className="text-slate-400 ml-1">({provider.total_reviews} reviews)</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  <span>{provider.location}</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  <span>{provider.experience_years} Years Experience</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-4 flex-shrink-0 text-center md:text-right">
            <div>
              <span className="text-xs text-slate-400 font-medium block">Standard Hourly Rate</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                ₹{provider.hourly_rate}
                <span className="text-xs text-slate-400 font-normal"> / hour</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full px-6 py-3 rounded-xl gradient-bg text-white font-bold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-purple-600/30"
              >
                Schedule Service
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Details, Map & Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white">About the Professional</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {provider.bio}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Services & Expertise</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {servicesList.map((service, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center space-x-2 text-xs font-semibold text-slate-200">
                  <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* OpenStreetMap Provider Location */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-400" /> OpenStreetMap Service Coverage
              </h3>
              <span className="text-xs text-slate-400 font-mono">{provider.location}</span>
            </div>
            <ProviderMap providers={[provider]} height="320px" zoom={12} />
          </div>

          {/* Reviews */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Customer Reviews</h3>
                <p className="text-xs text-slate-400">Verified feedback from completed Indian home bookings</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-amber-400">{provider.rating ? provider.rating.toFixed(1) : '5.0'}</span>
                <span className="text-xs text-slate-500 block">Out of 5.0</span>
              </div>
            </div>

            {provider.reviews && provider.reviews.length > 0 ? (
              <div className="space-y-4">
                {provider.reviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">No customer reviews written for this provider yet.</p>
            )}
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-400" /> Direct Contact Info
              </h3>
              {provider.is_unlocked ? (
                <span className="text-xs text-emerald-400 font-bold flex items-center">
                  <Unlock className="w-3.5 h-3.5 mr-1" /> Unlocked
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-bold flex items-center">
                  <Lock className="w-3.5 h-3.5 mr-1" /> Masked
                </span>
              )}
            </div>

            <div className="space-y-3 font-mono text-sm">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-sans text-slate-400">Phone:</span>
                <span className="text-white font-bold">{provider.phone}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-sans text-slate-400">Email:</span>
                <span className="text-slate-300 text-xs truncate max-w-[180px]">{provider.email}</span>
              </div>
            </div>

            {!provider.is_unlocked && (
              <button
                onClick={() => setIsUnlockOpen(true)}
                className="w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs hover:bg-amber-300 transition-colors flex items-center justify-center space-x-1.5 shadow-lg"
              >
                <Lock className="w-4 h-4" />
                <span>Unlock Direct Phone & Email</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      <BookingModal
        provider={provider}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
      <ContactUnlockModal
        provider={provider}
        isOpen={isUnlockOpen}
        onClose={() => setIsUnlockOpen(false)}
        onUnlocked={() => fetchProviderDetails()}
      />
    </div>
  );
}
