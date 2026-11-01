import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Analyzing data with AI engine...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-indigo-600`} />
      {message && <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>}
    </div>
  );
}
