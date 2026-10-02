'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { checkAccessCode } from '@/lib/api-client';
import { useReporterSession } from '@/context/ReporterSessionContext';
import { ReportPageHeader } from '@/components/report/ReportPageHeader';
import { KeyRound, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function CekLaporanPage(): React.JSX.Element {
  const router = useRouter();
  const { setSession } = useReporterSession();

  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!code.trim()) {
      setError('Masukkan kode akses rahasia Anda.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsLocked(false);

    try {
      const resp = await checkAccessCode(code.trim());
      setSession(resp);
      router.push('/lapor/detail');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memeriksa kode akses';
      setError(msg);
      if (msg.includes('terkunci') || msg.includes('LOCKED') || msg.includes('percobaan')) {
        setIsLocked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <ReportPageHeader
        title="Cek Status Laporan"
        description="Masukkan Kode Akses Rahasia Anda untuk melihat perkembangan tindak lanjut dan berdialog dengan tim pengelola."
      />

      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
              <label htmlFor="access-code" className="block text-sm font-semibold text-slate-800">
                Kode Akses Rahasia <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-600">Format: XXXXX-XXXXX-XXXXX...</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                type={showCode ? 'text' : 'password'}
                id="access-code"
                value={code}
                disabled={loading}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Tempel atau ketik kode akses rahasia Anda..."
                className="w-full min-h-[48px] pl-9 pr-12 py-3 rounded-md border border-slate-300 font-mono text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                required
                autoComplete="off"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'access-code-error access-code-hint' : 'access-code-hint'}
              />
              <button
                type="button"
                onClick={() => setShowCode((prev) => !prev)}
                aria-pressed={showCode}
                aria-label={showCode ? 'Sembunyikan kode akses' : 'Tampilkan kode akses'}
                className="absolute inset-y-0 right-0 flex items-center justify-center min-w-[44px] min-h-[44px] w-11 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-r-md transition"
              >
                {showCode ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <p id="access-code-hint" className="text-xs text-slate-600 mt-1">
              Tanda hubung (-) atau spasi akan dinormalisasi secara otomatis oleh sistem.
            </p>
          </div>

          {error && (
            <div
              id="access-code-error"
              role="alert"
              className="bg-rose-50 border border-rose-200 rounded-md p-3.5 text-xs text-rose-800 flex items-start space-x-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-950">Pemeriksaan Akses Gagal</p>
                <p className="leading-relaxed">{error}</p>
                {isLocked && (
                  <p className="text-[11px] text-rose-900 font-medium">
                    Kode ini terkunci selama 15 menit karena batas 5 kali percobaan gagal telah terlampaui. Anda dapat menggunakan tautan pemulihan email jika lupa kode.
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full min-h-[48px] py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md shadow-sm transition flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <span>{loading ? 'Memeriksa Akses...' : 'Buka Laporan'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>

        {/* Links */}
        <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <Link
            href="/lapor/tentang#cek-status"
            className="min-h-[44px] inline-flex items-center text-slate-600 hover:text-slate-900 font-medium transition hover:underline"
          >
            Pelajari Panduan Cek Status &rarr;
          </Link>

          <Link
            href="/lapor/pemulihan"
            className="min-h-[44px] inline-flex items-center text-brand-600 hover:text-brand-800 font-semibold transition hover:underline"
          >
            Lupa Kode Akses? Pulihkan di Sini &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
