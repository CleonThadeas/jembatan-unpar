'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { requestCodeRecovery, confirmCodeRecovery, ReportApiError } from '@/lib/api-client';
import { OTP_LENGTH, sanitizeOtp, isValidOtp } from '@/lib/utils';
import { RecoveryResponse } from '@/types/report';
import { ReportPageHeader } from '@/components/report/ReportPageHeader';
import {
  Mail,
  Hash,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Clock,
} from 'lucide-react';

export function ReportRecoveryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'request' | 'confirm'>('request');
  const tokenCapturedRef = useRef(false);
  const tokenInputRef = useRef<HTMLInputElement>(null);
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);
  const [shouldFocusToken, setShouldFocusToken] = useState(false);

  // Tab 1 state: Request
  const [emailInput, setEmailInput] = useState('');
  const [refInput, setRefInput] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestResult, setRequestResult] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const startCooldown = (seconds: number) => {
    setCooldownUntil(Date.now() + seconds * 1000);
    setCooldownSeconds(seconds);
  };

  // Tab 2 state: Confirm
  const [tokenInput, setTokenInput] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmResult, setConfirmResult] = useState<RecoveryResponse | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [refError, setRefError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldownUntil <= 0) return;
    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownSeconds(remaining);
      if (remaining === 0) {
        setCooldownUntil(0);
      }
    };
    const timer = setInterval(updateRemaining, 1000);
    document.addEventListener('visibilitychange', updateRemaining);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', updateRemaining);
    };
  }, [cooldownUntil]);

  // If URL has ?token=..., capture the numeric OTP once and switch to confirm.
  // Email and reference number are still required before submitting.
  useEffect(() => {
    if (tokenCapturedRef.current) return;
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      tokenCapturedRef.current = true;
      setTokenInput(sanitizeOtp(tokenParam));
      setActiveTab('confirm');

      // Drop the one-time token from address bar and history entry.
      // Calling window.history.replaceState(null, '', cleanUrl) allows Next 14.1+
      // to re-inject its internal history state (copyNextJsInternalHistoryState)
      // and synchronize the router (applyUrlFromHistoryPushReplace).
      try {
        let cleanUrl = window.location.pathname;
        try {
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.delete('token');
          const searchStr = currentUrl.searchParams.toString();
          cleanUrl = `${currentUrl.pathname}${searchStr ? `?${searchStr}` : ''}${currentUrl.hash}`;
        } catch {
          cleanUrl = window.location.pathname;
        }

        window.history.replaceState(null, '', cleanUrl);
      } catch {
        // Fallback for non-browser/restricted environments
      }
    }
  }, [searchParams]);

  // When switching to confirm tab via "Lanjut ke Langkah 2", move focus to token input
  useEffect(() => {
    if (activeTab === 'confirm' && shouldFocusToken) {
      tokenInputRef.current?.focus();
      setShouldFocusToken(false);
    }
  }, [activeTab, shouldFocusToken]);

  useEffect(() => {
    if (confirmResult) confirmHeadingRef.current?.focus();
  }, [confirmResult]);

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextTab = activeTab === 'request' ? 'confirm' : 'request';
      setActiveTab(nextTab);
      const nextId = nextTab === 'request' ? 'tab-request' : 'tab-confirm';
      document.getElementById(nextId)?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab('request');
      document.getElementById('tab-request')?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveTab('confirm');
      document.getElementById('tab-confirm')?.focus();
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestLoading || confirmLoading || cooldownSeconds > 0) return;
    if (!emailInput.trim() || !refInput.trim()) {
      setRequestError('Email dan Nomor Referensi wajib diisi.');
      return;
    }

    setRequestLoading(true);
    setRequestError(null);
    setRequestResult(null);
    try {
      const resp = await requestCodeRecovery(emailInput.trim(), refInput.trim());
      // Keep the response generic so the form does not disclose whether a report exists.
      startCooldown(60);
      setRequestResult(
        resp.message ||
          'Jika kombinasi email dan nomor referensi terdaftar, instruksi pemulihan telah dikirim ke email Anda.'
      );
    } catch (err: unknown) {
      if (err instanceof ReportApiError) {
        if (err.code === 'RESEND_COOLDOWN') {
          const retryAfter = (err.meta?.retry_after_seconds as number) || 60;
          startCooldown(retryAfter);
          setRequestError(`Mohon tunggu ${retryAfter} detik sebelum meminta kode baru.`);
          return;
        }
      }
      const msg = err instanceof Error ? err.message : 'Gagal mengirim permintaan pemulihan';
      setRequestError(msg);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestLoading || confirmLoading || confirmResult) return;
    const email = emailInput.trim();
    const referenceNumber = refInput.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setEmailError(!email ? 'Alamat email wajib diisi.' : !validEmail ? 'Format alamat email tidak valid.' : null);
    setRefError(referenceNumber ? null : 'Nomor referensi wajib diisi.');
    if (!validEmail || !referenceNumber) return;
    if (!isValidOtp(tokenInput)) {
      setConfirmError('Masukkan kode OTP 6 digit dari email.');
      return;
    }

    setConfirmLoading(true);
    setConfirmError(null);
    try {
      const resp = await confirmCodeRecovery({ email, reference_number: referenceNumber, code: tokenInput });
      setConfirmResult(resp);
    } catch (err: unknown) {
      if (err instanceof ReportApiError && err.code === 'INVALID_OTP') {
        setConfirmError('Kode OTP tidak valid atau kedaluwarsa. Periksa kembali email Anda.');
        return;
      }
      const msg = err instanceof Error ? err.message : 'Kode OTP tidak valid atau kedaluwarsa.';
      setConfirmError(msg);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <ReportPageHeader
        title="Pemulihan Kode"
        description="Minta kode akses baru melalui verifikasi email dan nomor referensi jika Anda kehilangan Kode Akses Rahasia."
        guideHref="/lapor/tentang#pemulihan"
      />

      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-5 sm:p-6 space-y-5">
        {/* Tabs */}
        {!confirmResult && (
          <div role="tablist" aria-label="Metode Pemulihan Kode Akses" className="flex border-b border-slate-200">
            <button
              id="tab-request"
              role="tab"
              aria-selected={activeTab === 'request'}
              aria-controls="panel-request"
              tabIndex={activeTab === 'request' ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              type="button"
              onClick={() => setActiveTab('request')}
              className={`flex-1 min-h-[48px] py-2.5 text-xs sm:text-sm font-semibold text-center border-b-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                activeTab === 'request'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              1. Ajukan Permintaan Pemulihan
            </button>
            <button
              id="tab-confirm"
              role="tab"
              aria-selected={activeTab === 'confirm'}
              aria-controls="panel-confirm"
              tabIndex={activeTab === 'confirm' ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              type="button"
              onClick={() => setActiveTab('confirm')}
              className={`flex-1 min-h-[48px] py-2.5 text-xs sm:text-sm font-semibold text-center border-b-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                activeTab === 'confirm'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              2. Masukkan Kode OTP
            </button>
          </div>
        )}

        {/* Tab 1: Request */}
        <div
          id="panel-request"
          role="tabpanel"
          aria-labelledby="tab-request"
          tabIndex={0}
          hidden={activeTab !== 'request' || Boolean(confirmResult)}
          className={
            activeTab === 'request' && !confirmResult
              ? 'block focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-md'
              : 'hidden'
          }
        >
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label htmlFor="recovery-email" className="block text-sm font-semibold text-slate-800 mb-1">
                Alamat Email Pelapor Terdaftar <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  type="email"
                  id="recovery-email"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setRequestError(null); }}
                  placeholder="nama.mahasiswa@univ.ac.id"
                  className="w-full min-h-[48px] pl-9 pr-3.5 py-3 rounded-md border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-invalid={Boolean(requestError)}
                  aria-describedby={requestError ? 'request-error-msg' : undefined}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="recovery-ref" className="block text-sm font-semibold text-slate-800 mb-1">
                Nomor Referensi Laporan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="recovery-ref"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  placeholder="REP-YYYYMMDD-XXXXX"
                  className="w-full min-h-[48px] pl-9 pr-3.5 py-3 rounded-md border border-slate-300 font-mono uppercase text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-invalid={Boolean(requestError)}
                  aria-describedby={requestError ? 'request-error-msg' : undefined}
                  required
                />
              </div>
            </div>

            {requestError && (
              <div id="request-error-msg" role="alert" className="bg-rose-50 border border-rose-200 rounded-md p-3 text-xs text-rose-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p>{requestError}</p>
              </div>
            )}

            {requestResult && (
              <div role="status" className="bg-brand-50 border border-brand-200 rounded-md p-3.5 text-xs text-brand-800 space-y-2">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="font-semibold">{requestResult}</p>
                </div>
                <p className="text-[11px] text-brand-700 leading-relaxed">
                  Pada prototipe ini, email disimulasikan secara lokal. Buka{' '}
                  <Link href="/demo" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                    Pusat Demo (/demo)
                  </Link>{' '}
                  (di tab baru) untuk melihat simulasi kode OTP yang diterima.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('confirm');
                      setShouldFocusToken(true);
                    }}
                    className="min-h-[44px] px-3.5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-md text-xs font-semibold transition"
                  >
                    Lanjut ke Langkah 2: Masukkan Kode OTP &rarr;
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={requestLoading || cooldownSeconds > 0}
              className="w-full min-h-[48px] py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md shadow-sm transition flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>
                {requestLoading
                  ? 'Mengirim Permintaan...'
                  : cooldownSeconds > 0
                  ? `Kirim Kode Pemulihan (${cooldownSeconds}d)`
                  : 'Kirim Kode Pemulihan'}
              </span>
            </button>
          </form>
        </div>

        {/* Tab 2: Confirm */}
        <div
          id="panel-confirm"
          role="tabpanel"
          aria-labelledby="tab-confirm"
          tabIndex={0}
          hidden={activeTab !== 'confirm' || Boolean(confirmResult)}
          className={
            activeTab === 'confirm' && !confirmResult
              ? 'block focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-md'
              : 'hidden'
          }
        >
          <form onSubmit={handleConfirmSubmit} noValidate className="space-y-4">
            {/* Collapsed 10-minute TTL short hint */}
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>Kode OTP 6 digit berlaku 10 menit sejak diajukan.</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="confirm-email" className="block text-sm font-semibold text-slate-800 mb-1">
                  Alamat Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  id="confirm-email"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setEmailError(null); }}
                  placeholder="nama@univ.ac.id"
                  className="w-full min-h-[48px] px-3.5 py-3 rounded-md border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? 'confirm-email-error' : undefined}
                  required
                />
                {emailError && <p id="confirm-email-error" role="alert" className="mt-1 text-xs text-rose-700">{emailError}</p>}
              </div>
              <div>
                <label htmlFor="confirm-ref" className="block text-sm font-semibold text-slate-800 mb-1">
                  Nomor Referensi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="confirm-ref"
                  value={refInput}
                  onChange={(e) => { setRefInput(e.target.value); setRefError(null); }}
                  placeholder="REP-YYYYMMDD-XXXXX"
                  className="w-full min-h-[48px] px-3.5 py-3 rounded-md border border-slate-300 font-mono uppercase text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-invalid={Boolean(refError)}
                  aria-describedby={refError ? 'confirm-ref-error' : undefined}
                  required
                />
                {refError && <p id="confirm-ref-error" role="alert" className="mt-1 text-xs text-rose-700">{refError}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="recovery-token" className="block text-sm font-semibold text-slate-800 mb-1">
                Kode OTP Pemulihan <span className="text-rose-500">*</span>
              </label>
              <p id="recovery-token-hint" className="text-xs text-slate-500 mb-1.5">
                Masukkan 6 digit kode dari email pemulihan.
              </p>
              <input
                ref={tokenInputRef}
                type="text"
                id="recovery-token"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                pattern="[0-9]{6}"
                value={tokenInput}
                onChange={(e) => { setTokenInput(sanitizeOtp(e.target.value)); setConfirmError(null); }}
                placeholder="Contoh: 123456"
                className="w-full min-h-[48px] px-3.5 py-3 rounded-md border border-slate-300 font-mono text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-invalid={Boolean(confirmError)}
                aria-describedby={confirmError ? 'confirm-error-msg recovery-token-hint' : 'recovery-token-hint'}
                required
              />
            </div>

            {confirmError && (
              <div id="confirm-error-msg" role="alert" className="bg-rose-50 border border-rose-200 rounded-md p-3 text-xs text-rose-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p>{confirmError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={confirmLoading || !tokenInput.trim()}
              className="w-full min-h-[48px] py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-md shadow-sm transition"
            >
              {confirmLoading ? 'Memeriksa Kode OTP...' : 'Konfirmasi Kode OTP'}
            </button>
          </form>
        </div>

        {/* Kode akses baru dikirim melalui email, tidak pernah ditampilkan di layar. */}
        {confirmResult && (
          <div className="space-y-5 py-2">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h2 ref={confirmHeadingRef} tabIndex={-1} className="text-lg font-bold text-slate-900 focus:outline-none">Kode Akses Baru Sedang Dikirim ke Email Anda</h2>
              {refInput && (
                <p className="text-xs text-slate-500 mt-1">
                  Nomor Referensi: <span className="font-mono font-bold text-slate-800">{refInput}</span>
                </p>
              )}
            </div>

            <div className="bg-brand-50 border border-brand-200 rounded-md p-4 text-xs text-brand-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-brand-900">
                <Mail className="w-4 h-4 text-brand-700 flex-shrink-0" aria-hidden="true" />
                <span>Instruksi Pengiriman Kredensial</span>
              </div>
              <p className="leading-relaxed">
                {confirmResult.message || 'Kode akses rahasia yang baru telah dibuat dan sedang diproses untuk dikirim ke alamat email terdaftar Anda. Email bisa memerlukan beberapa menit untuk tiba.'}
              </p>
            </div>

            <div className="bg-gold-50 border border-gold-400 rounded-md p-4 text-xs text-ink-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-ink-900">
                <ShieldAlert className="w-4 h-4 text-gold-700 flex-shrink-0" aria-hidden="true" />
                <span>Pemberitahuan Prototype &amp; Akses Demo</span>
              </div>
              <p className="leading-relaxed">
                Untuk menjaga privasi, kode akses rahasia baru tidak ditampilkan di layar ini. Seluruh sesi akses yang pernah aktif sebelumnya dibatalkan.
              </p>
              <p className="leading-relaxed font-semibold text-ink-900">
                Pada prototipe ini, buka{' '}
                <Link href="/demo" target="_blank" rel="noopener noreferrer" className="underline text-brand-700">
                  Pusat Demo (/demo)
                </Link>{' '}
                (di tab baru) untuk melihat simulasi kotak masuk dan mengambil kode akses baru, lalu gunakan untuk masuk di halaman Cek Laporan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/lapor/cek-laporan')}
              className="w-full min-h-[48px] py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-md shadow-sm transition flex items-center justify-center space-x-2"
            >
              <span>Menuju Halaman Cek Status Laporan</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
