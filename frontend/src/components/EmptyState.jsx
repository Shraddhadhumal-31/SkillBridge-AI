import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No Data Available',
  description = 'Get started by taking action or uploading your resume.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
