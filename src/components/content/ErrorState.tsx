import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  retryHref?: string;
}

export function ErrorState({
  title = 'Layanan Sedang Mengalami Kendala',
  message = 'Layanan informasi sedang tidak dapat dijangkau. Silakan coba beberapa saat lagi.',
  retryHref,
}: ErrorStateProps): React.JSX.Element {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-rose-50/60 rounded-xl border border-rose-200/80 shadow-sm my-6"
    >
      {/* Calm icon without circular background shape */}
      <AlertCircle className="w-8 h-8 text-rose-600 mb-3" aria-hidden="true" />
      <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">{title}</h2>
      <p className="text-sm text-slate-600 max-w-md leading-relaxed mb-5">{message}</p>
      {retryHref && (
        <a
          href={retryHref}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] min-w-[44px] text-xs font-semibold text-white bg-brand-800 hover:bg-brand-900 active:bg-brand-950 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shadow-sm"
        >
          Coba Lagi
        </a>
      )}
    </div>
  );
}
