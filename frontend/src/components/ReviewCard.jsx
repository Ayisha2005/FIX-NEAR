import React from 'react';
import { Star, User, Calendar } from 'lucide-react';

export default function ReviewCard({ review }) {
  const { reviewer_name, rating, comment, created_at } = review;
  const dateStr = created_at ? new Date(created_at).toLocaleDateString() : 'Recent';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-purple-400 font-bold text-xs">
            {reviewer_name ? reviewer_name.charAt(0) : 'U'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{reviewer_name || 'Homeowner'}</h4>
            <div className="flex items-center space-x-1 text-xs text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                />
              ))}
            </div>
          </div>
        </div>

        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {dateStr}
        </span>
      </div>

      <p className="text-slate-300 text-xs leading-relaxed italic pl-1">
        "{comment}"
      </p>
    </div>
  );
}
