'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// The raw error is intentionally never rendered client-side: it may carry internal hosts or sensitive details.
export default function ErrorBoundary({ reset }: ErrorProps): React.JSX.Element {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div role="alert" className="max-w-md w-full text-center space-y-6">
        <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" aria-hidden="true" />

        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-wider text-rose-600 uppercase">Terjadi Kendala</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl font-display">
            Informasi Belum Dapat Ditampilkan
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Kami sedang mengalami kendala saat memuat halaman ini. Silakan coba memuat ulang beberapa saat lagi atau kembali ke halaman beranda.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold text-white bg-brand-700 hover:bg-brand-800 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            <Home className="w-4 h-4 mr-2" aria-hidden="true" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
