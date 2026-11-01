import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800 flex items-start space-x-3 my-4">
      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold">An Error Occurred</h4>
        <p className="text-sm text-rose-700 mt-0.5">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs font-medium text-rose-800 underline hover:text-rose-900 cursor-pointer"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
