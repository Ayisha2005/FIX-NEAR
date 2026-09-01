import React from 'react';

export default function StatsCard({ title, value, icon: Icon, change, trend = 'up', color = 'purple' }) {
  const colorStyles = {
    purple: 'bg-purple-950/40 border-purple-800/40 text-purple-400',
    teal: 'bg-teal-950/40 border-teal-800/40 text-teal-400',
    amber: 'bg-amber-950/40 border-amber-800/40 text-amber-400',
    blue: 'bg-blue-950/40 border-blue-800/40 text-blue-400',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
      <div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          {title}
        </span>
        <div className="text-2xl font-extrabold text-white tracking-tight">
          {value}
        </div>
        {change && (
          <span className={`text-xs font-semibold mt-1 inline-block ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>

      <div className={`p-3.5 rounded-2xl border ${colorStyles[color] || colorStyles.purple}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
