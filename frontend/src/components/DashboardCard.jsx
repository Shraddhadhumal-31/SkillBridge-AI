import React from 'react';

export default function DashboardCard({
  title,
  subtitle,
  action,
  children,
  className = '',
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
