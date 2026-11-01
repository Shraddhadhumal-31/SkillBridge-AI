import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  color = 'indigo', // 'indigo', 'emerald', 'amber', 'rose'
  size = 'md', // 'sm', 'md', 'lg'
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    blue: 'bg-blue-600',
  };

  // Determine dynamic color based on percentage if not explicitly customized
  const dynamicBg =
    color === 'auto'
      ? percentage >= 75
        ? 'bg-emerald-500'
        : percentage >= 50
        ? 'bg-indigo-600'
        : percentage >= 30
        ? 'bg-amber-500'
        : 'bg-rose-500'
      : colorClasses[color] || colorClasses.indigo;

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-bold">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size] || heightClasses.md}`}>
        <div
          className={`${dynamicBg} ${heightClasses[size] || heightClasses.md} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
