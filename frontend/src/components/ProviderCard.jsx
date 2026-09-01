import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Briefcase, Phone, Lock, Unlock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ProviderCard({ provider, onUnlockClick, onBookClick }) {
  const {
    id,
    provider_name,
    category_name,
    hourly_rate,
    rating,
    total_reviews,
    phone,
    email,
    location,
    experience_years,
    avatar_url,
    bio,
    is_unlocked,
  } = provider;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/10 flex flex-col justify-between group">
      <div>
        {/* Header with Avatar & Category Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt={provider_name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-slate-700 group-hover:border-purple-500 transition-colors"
              />
              <div className="absolute -bottom-1 -right-1 bg-teal-500 text-slate-950 p-1 rounded-full text-xs shadow" title="Verified Pro India">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                {provider_name}
              </h3>
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-purple-400 border border-purple-900/40">
                {category_name}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-extrabold text-white">
              ₹{hourly_rate}
              <span className="text-xs font-normal text-slate-400">/hr</span>
            </div>
            <div className="flex items-center text-xs text-amber-400 mt-1 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
              {rating ? rating.toFixed(1) : '5.0'}
              <span className="text-slate-500 ml-1">({total_reviews})</span>
            </div>
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="text-slate-300 text-sm line-clamp-2 mb-4 leading-relaxed font-normal">
          {bio}
        </p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-800/80 text-xs text-slate-400 mb-4">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>{experience_years} Years Exp.</span>
          </div>
        </div>

        {/* Contact Field Masking Indicator */}
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 mb-5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-purple-400" />
            <span className="font-mono text-slate-300 tracking-wide">{phone}</span>
          </div>
          {is_unlocked ? (
            <span className="flex items-center text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-0.5 rounded border border-emerald-800/50">
              <Unlock className="w-3 h-3 mr-1" /> Unlocked
            </span>
          ) : (
            <button
              onClick={() => onUnlockClick && onUnlockClick(provider)}
              className="flex items-center text-amber-400 hover:text-amber-300 font-semibold bg-amber-950/40 hover:bg-amber-900/40 px-2.5 py-1 rounded border border-amber-800/50 transition-colors"
            >
              <Lock className="w-3 h-3 mr-1" /> Unlock Contact
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 pt-2">
        <Link
          to={`/providers/${id}`}
          className="flex-1 text-center py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-200 text-sm font-semibold hover:bg-slate-700 hover:text-white transition-colors"
        >
          View Profile
        </Link>
        <button
          onClick={() => onBookClick && onBookClick(provider)}
          className="flex-1 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-1 shadow-md shadow-purple-900/20"
        >
          <span>Book Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
