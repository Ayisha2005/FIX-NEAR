import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, MapPin, Map, Grid, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { servicesApi, providersApi } from '../services/api';
import ProviderCard from '../components/ProviderCard';
import BookingModal from '../components/BookingModal';
import ContactUnlockModal from '../components/ContactUnlockModal';
import ProviderMap from '../components/ProviderMap';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category_id') || '';
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [minRating, setMinRating] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedBookingProvider, setSelectedBookingProvider] = useState(null);
  const [selectedUnlockProvider, setSelectedUnlockProvider] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await servicesApi.getCategories();
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.q = query;
      if (categoryId) params.category_id = categoryId;
      if (minRating) params.min_rating = minRating;
      if (maxRate) params.max_rate = maxRate;

      const res = await providersApi.search(params);
      setProviders(res.data.providers || []);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [categoryId, minRating, maxRate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  const handleResetFilters = () => {
    setQuery('');
    setCategoryId('');
    setMinRating('');
    setMaxRate('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Marketplace Search (India)</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Find Verified Local Service Providers</h1>
        </div>
      </div>

      {/* Filter & Search Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search provider name, bio, service, or city (e.g. Chennai, Bengaluru, Mumbai)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl gradient-bg text-white font-bold text-sm hover:opacity-90 flex items-center justify-center space-x-2 shadow-md"
            >
              <SearchIcon className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Minimum Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Any Rating</option>
                <option value="4.9">4.9+ Stars (Exceptional)</option>
                <option value="4.5">4.5+ Stars (Top Rated)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Max Hourly Rate (₹)</label>
              <select
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Any Hourly Rate</option>
                <option value="400">Under ₹400 / hr</option>
                <option value="600">Under ₹600 / hr</option>
                <option value="1000">Under ₹1,000 / hr</option>
              </select>
            </div>
          </div>

          {/* Bar footer with view toggle */}
          <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
            <span>Showing {providers.length} verified service providers</span>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Clear Filters
              </button>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Grid className="w-3.5 h-3.5" /> Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${viewMode === 'map' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Map className="w-3.5 h-3.5" /> OpenStreetMap
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Provider Results View */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-slate-400 text-sm">Searching professionals...</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <SlidersHorizontal className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No service providers match your criteria</h3>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl gradient-bg text-white font-semibold text-xs mt-2"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs text-slate-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>Interactive OpenStreetMap view rendering provider locations in Indian cities (Chennai, Bengaluru, Mumbai, Delhi). Click pins to preview.</span>
          </div>
          <ProviderMap providers={providers} height="500px" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              onUnlockClick={(prov) => setSelectedUnlockProvider(prov)}
              onBookClick={(prov) => setSelectedBookingProvider(prov)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <BookingModal
        provider={selectedBookingProvider}
        isOpen={!!selectedBookingProvider}
        onClose={() => setSelectedBookingProvider(null)}
      />
      <ContactUnlockModal
        provider={selectedUnlockProvider}
        isOpen={!!selectedUnlockProvider}
        onClose={() => setSelectedUnlockProvider(null)}
        onUnlocked={() => fetchProviders()}
      />
    </div>
  );
}
