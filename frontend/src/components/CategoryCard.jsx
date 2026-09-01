import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Zap, 
  Wind, 
  Sparkles, 
  Hammer, 
  Tv, 
  Paintbrush, 
  Trees, 
  ArrowRight 
} from 'lucide-react';

const iconMap = {
  Wrench,
  Zap,
  Wind,
  Sparkles,
  Hammer,
  Tv,
  Paintbrush,
  Trees
};

export default function CategoryCard({ category }) {
  const { id, name, icon, description, provider_count } = category;
  const IconComponent = iconMap[icon] || Wrench;

  return (
    <Link
      to={`/search?category_id=${id}`}
      className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-purple-600/10 flex flex-col justify-between"
    >
      <div>
        <div className="w-12 h-12 rounded-xl gradient-bg p-3 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md shadow-purple-600/20">
          <IconComponent className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
          {name}
        </h3>
        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
        <span className="font-semibold text-purple-400 bg-purple-950/40 px-2.5 py-1 rounded-md border border-purple-800/40">
          {provider_count || 0} Verified Pros
        </span>
        <span className="text-slate-400 group-hover:text-white flex items-center font-medium transition-colors">
          Browse <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
