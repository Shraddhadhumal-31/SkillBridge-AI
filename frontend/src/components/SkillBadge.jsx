import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function SkillBadge({
  name,
  status = 'default', // 'acquired', 'missing', 'partial', 'default'
  category,
  importance,
  onClick,
}) {
  const getColors = () => {
    if (status === 'acquired') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    }
    if (status === 'missing') {
      return 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
    }
    if (status === 'partial') {
      return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
    }
    // Default by category or neutral
    return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${getColors()} ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
    >
      {status === 'acquired' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
      {status === 'missing' && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
      {status === 'partial' && <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
      
      <span>{name}</span>

      {importance && (
        <span className="text-[10px] uppercase font-bold opacity-75 ml-0.5">
          • {importance}
        </span>
      )}
    </span>
  );
}
