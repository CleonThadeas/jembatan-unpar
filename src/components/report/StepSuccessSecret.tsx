'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SubmitReportResponse } from '@/types/report';
import { useReporterSession } from '@/context/ReporterSessionContext';
import { checkAccessCode } from '@/lib/api-client';
import {
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  FilePlus,
  Lock,
  Download,
  KeyRound,
  Search,
} from 'lucide-react';

interface StepSuccessSecretProps {
  result: SubmitReportResponse;
  onReset: () => void;
}

export function StepSuccessSecret({ result, onReset }: StepSuccessSecretProps) {
  const router = useRouter();
  const { setSession } = useReporterSession();

  const hasAccessCode = Boolean(result.access_code && result.access_code.trim());

  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [loadingDirectAccess, setLoadingDirectAccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  // Guard against accidental page refresh or closing before saving credentials
  useEffect(() => {
    if (acknowledged || !hasAccessCode) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [acknowledged, hasAccessCode]);

  const handleCopy = async () => {
    if (!hasAccessCode) return;
    try {
      await navigator.clipboard.writeText(result.access_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadTxt = () => {
    if (!hasAccessCode) return;
    const lines = [
      '====================================================',
      'KREDENSIAL AKSES LAPORAN KONDISI KAMPUS',
      '====================================================',
      '',
      `Nomor Referensi : ${result.reference_number}`,
      `Kode Akses      : ${result.access_code}`,
      `Waktu Dibuat    : ${result.created_at || new Date().toISOString()}`,
      '',
      'PERINGATAN PENTING:',
      '1. Simpan berkas ini di tempat yang aman dan rahasia.',
      '2. Kode Akses Rahasia adalah satu-satunya kunci untuk membuka',
      '   percakapan dan memantau status tindak lanjut laporan Anda.',
      '3. Prototipe ini menyimpan data laporan secara lokal pada peramban',
      '   untuk keperluan simulasi. Gunakan kode ini untuk masuk ke halaman detail.',
      '====================================================',
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kredensial-laporan-${result.reference_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDirectAccess = async () => {
    if (!hasAccessCode) return;
    setLoadingDirectAccess(true);
    setAccessError(null);
    try {
      const accessResp = await checkAccessCode(result.access_code);
      setSession(accessResp);
      router.push('/lapor/detail');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuka sesi laporan';
      setAccessError(msg);
    } finally {
      setLoadingDirectAccess(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Success Badge */}
      <div className="text-center max-w-lg mx-auto">
        <div className="w-14 h-14 bg-brand-50 border border-brand-200 text-seal-green rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
          <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
        </div>
        <h2 tabIndex={-1} className="text-2xl font-bold text-slate-900 focus:outline-none">
          {hasAccessCode ? 'Laporan Berhasil Diterima' : 'Laporan Telah Tercatat Sebelumnya'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {hasAccessCode ? (
            <>
              Laporan Anda telah tercatat di sistem yang dikelola tim mahasiswa dengan status awal{' '}
              <span className="font-semibold text-brand-700">BARU</span>.
            </>
          ) : (
            <>
              Pengiriman ulang berhasil dideteksi. Laporan Anda dengan nomor referensi di bawah ini telah aman tersimpan di sistem.
            </>
          )}
        </p>
      </div>

      {/* Reference Number */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          Nomor Referensi Publik
        </span>
        <div className="mt-1 text-xl font-mono font-bold text-slate-900 tracking-wide select-all">
          {result.reference_number}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Nomor ini dapat digunakan untuk korespondensi administratif atau pemulihan kode akses. Nomor ini <strong>tidak memberikan akses</strong> langsung ke detail laporan.
        </p>
      </div>

      {/* Replay Notice when access_code is empty */}
      {!hasAccessCode ? (
        <div
          role="status"
          className="bg-brand-50 border-2 border-brand-300 rounded-xl p-5 shadow-sm space-y-4 text-left"
        >
          <div className="flex items-start space-x-3">
            <KeyRound className="w-6 h-6 text-brand-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h3 className="font-bold text-brand-950 text-sm sm:text-base">
                Kode Akses Tidak Ditampilkan Ulang (Kebijakan Keamanan)
              </h3>
              <p className="text-xs text-brand-900 leading-relaxed">
                Sistem mendeteksi bahwa laporan ini merupakan pengiriman ulang yang identik. Demi melindungi kerahasiaan dan privasi pelapor, Kode Akses Rahasia hanya dibuat dan ditampilkan satu kali pada saat laporan pertama kali dikirim, serta tidak disimpan dalam bentuk teks biasa di server.
              </p>
              <p className="text-xs text-brand-900 leading-relaxed font-medium">
                Jika Anda belum menyimpan atau kehilangan Kode Akses Rahasia untuk nomor referensi ini, silakan gunakan fitur Pemulihan Kode Akses menggunakan alamat email mahasiswa Anda.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-brand-200 flex flex-col sm:flex-row gap-3">
            <Link
              href="/lapor/pemulihan"
              className="inline-flex min-h-[48px] items-center justify-center space-x-2 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <KeyRound className="w-4 h-4" aria-hidden="true" />
              <span>Buka Pemulihan Kode Akses</span>
            </Link>

            <Link
              href="/lapor/cek-laporan"
              className="inline-flex min-h-[48px] items-center justify-center space-x-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>Cek Status Laporan</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Secret Access Code Card (ONE-TIME DISPLAY) */
        <div className="bg-gold-50 border-2 border-gold-400 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-ink-900 font-bold text-sm">
            <Lock className="w-5 h-5 text-gold-700" aria-hidden="true" />
            <span>KODE AKSES RAHASIA (DITAMPILKAN SATU KALI)</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gold-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div className="font-mono text-lg sm:text-xl font-extrabold text-slate-900 tracking-wider text-center sm:text-left select-all break-all">
              {result.access_code}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className={`min-h-[48px] inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-sm ${
                  copied
                    ? 'bg-seal-green text-white'
                    : 'bg-brand-700 hover:bg-brand-800 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    <span>Kode Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    <span>Salin Kode Rahasia</span>
                  </>
                )}
                {copied && <span role="status" className="sr-only">Kode akses rahasia berhasil disalin ke papan klip</span>}
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="min-h-[48px] inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-bold bg-white border border-gold-400 hover:bg-gold-100 text-ink-900 transition shadow-sm"
              >
                <Download className="w-4 h-4 text-gold-700" aria-hidden="true" />
                <span>Unduh Kredensial (.txt)</span>
              </button>
            </div>
          </div>

          {/* Security Warning */}
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 text-xs text-rose-900 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-rose-950">
              <ShieldAlert className="w-4 h-4 text-rose-700 flex-shrink-0" aria-hidden="true" />
              <span>Peringatan Keamanan Kredensial Penting</span>
            </div>
            <p className="leading-relaxed">
              Kode akses ini adalah <strong>satu-satunya kunci rahasia</strong> untuk membaca balasan tim dan memantau perkembangan laporan Anda. Sistem tidak menyimpan kode dalam teks biasa (hanya hash Argon2id satu arah) dan kode tidak dituliskan di badan email.
            </p>
            <p className="leading-relaxed font-semibold text-rose-950">
              Jika halaman ini ditutup sebelum Anda menyalin kode, Anda harus melalui prosedur pemulihan email. Catat dan simpan kode ini di tempat yang aman sekarang juga!
            </p>
          </div>

          {/* Mandatory Acknowledgment Checkbox */}
          <label className="flex items-start space-x-3 p-3 bg-white/90 border border-gold-400 rounded-lg cursor-pointer hover:bg-white transition">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gold-400 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs font-medium text-slate-800 leading-relaxed">
              Saya telah menyalin dan menyimpan Nomor Referensi serta Kode Akses Rahasia di atas pada tempat yang aman.
            </span>
          </label>
        </div>
      )}

      {accessError && (
        <div role="alert" className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p>{accessError}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 min-h-[48px] px-4 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
        >
          <FilePlus className="w-4 h-4" aria-hidden="true" />
          <span>Buat Laporan Baru Lainnya</span>
        </button>

        {hasAccessCode && (
          <button
            type="button"
            onClick={handleDirectAccess}
            disabled={!acknowledged || loadingDirectAccess}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 min-h-[48px] px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <span>{loadingDirectAccess ? 'Membuka Sesi Laporan...' : 'Langsung Pantau Laporan Ini'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
