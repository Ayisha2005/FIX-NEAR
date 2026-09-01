import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShieldCheck, 
  Star, 
  Crown, 
  ArrowRight, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { servicesApi, providersApi } from '../services/api';
import CategoryCard from '../components/CategoryCard';
import ProviderCard from '../components/ProviderCard';
import BookingModal from '../components/BookingModal';
import ContactUnlockModal from '../components/ContactUnlockModal';
import ProviderMap from '../components/ProviderMap';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState(null);
  const [selectedProviderForUnlock, setSelectedProviderForUnlock] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, provRes] = await Promise.all([
          servicesApi.getCategories().catch(() => ({ data: { categories: [] } })),
          providersApi.search({}).catch(() => ({ data: { providers: [] } }))
        ]);
        setCategories(catRes.data?.categories || []);
        const provs = provRes.data?.providers || [];
        setAllProviders(provs);
        setFeaturedProviders(provs.slice(0, 3));
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-20 pb-12">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-purple-600/30 via-indigo-600/20 to-teal-500/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center space-x-2 bg-slate-900/90 border border-purple-500/30 px-4 py-1.5 rounded-full mb-8 shadow-inner text-xs font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-ping" />
            <span className="gradient-text">Premier Home Service Marketplace (India)</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Connect with Certified <br className="hidden sm:inline" />
            <span className="gradient-text">Home Service Professionals</span>
          </h1>

          <p className="mt-6 text-slate-300 text-base md:text-lg max-w-2xl mx-auto font-normal">
            From master plumbers and electricians to AC repair and deep home cleaners in Chennai, Bengaluru, Mumbai & Delhi. Verified credentials, transparent Rupee (₹) pricing, and direct contact unlocking.
          </p>

          {/* Search Box */}
          <div className="mt-10 max-w-3xl mx-auto space-y-4">
            <form onSubmit={handleHeroSearch}>
              <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search services (e.g. AC Repair Chennai, Plumber Bangalore, Electrician)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl gradient-bg text-white font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2"
                >
                  <span>Search Pros</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-slate-800/80 pt-8">
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-white">5,000+</div>
              <div className="text-xs text-slate-400 font-medium">Verified Indian Pros</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-teal-400">99.4%</div>
              <div className="text-xs text-slate-400 font-medium">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-purple-400">₹499/mo</div>
              <div className="text-xs text-slate-400 font-medium">Unlimited Premium Pass</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-indigo-400">OpenStreetMap</div>
              <div className="text-xs text-slate-400 font-medium">Interactive Map Pins</div>
            </div>
          </div>

        </div>
      </section>

      {/* Prominent OpenStreetMap Nearby Provider Locations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-400" /> Interactive Location Map
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Discover Nearby Service Professionals</h2>
          </div>
          <Link to="/search" className="mt-2 md:mt-0 text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
            Explore Full Search <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-2xl space-y-4">
          <div className="text-xs text-slate-300 flex items-center justify-between">
            <span>Live OpenStreetMap pins for verified professionals in Chennai, Bengaluru, Mumbai, and Delhi NCR.</span>
            <span className="font-semibold text-teal-400">{allProviders.length} Pins Active</span>
          </div>
          <ProviderMap providers={allProviders} height="420px" zoom={6} center={[16.0, 78.0]} />
        </div>
      </section>

      {/* Service Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Top Specializations</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Explore Service Categories</h2>
          </div>
          <Link to="/search" className="mt-4 md:mt-0 text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 8).map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Top-Rated Providers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Top Rated Professionals</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Featured Service Experts</h2>
          </div>
          <Link to="/search" className="mt-4 md:mt-0 text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
            Browse All Providers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onUnlockClick={(p) => setSelectedProviderForUnlock(p)}
              onBookClick={(p) => setSelectedProviderForBooking(p)}
            />
          ))}
        </div>
      </section>

      {/* Premium Subscription CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden gradient-bg p-1">
          <div className="bg-slate-950 rounded-[22px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/20">
                <Crown className="w-4 h-4 fill-amber-400" /> Premium Member Access
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Unlock Unlimited Provider Contacts for ₹499/mo
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Never pay single contact unlock fees again. Get direct phone numbers, personal email addresses, and priority booking dispatch for all Indian home repair projects.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Link
                to="/subscribe"
                className="px-8 py-3.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-sm hover:bg-amber-300 transition-colors text-center shadow-xl flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Upgrade to Premium (₹499)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <BookingModal
        provider={selectedProviderForBooking}
        isOpen={!!selectedProviderForBooking}
        onClose={() => setSelectedProviderForBooking(null)}
      />
      <ContactUnlockModal
        provider={selectedProviderForUnlock}
        isOpen={!!selectedProviderForUnlock}
        onClose={() => setSelectedProviderForUnlock(null)}
      />
    </div>
  );
}
