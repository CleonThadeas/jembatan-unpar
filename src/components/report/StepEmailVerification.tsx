'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useReporterSession } from '@/context/ReporterSessionContext';
import { requestEmailVerification, confirmEmailVerification, ReportApiError } from '@/lib/api-client';
import { OTP_LENGTH, sanitizeOtp, isValidOtp } from '@/lib/utils';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Send, Key, Clock } from 'lucide-react';

interface StepEmailVerificationProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepEmailVerification({ onNext, onBack }: StepEmailVerificationProps) {
  const { draft, setVerification, verifiedEmail, verificationTicket } = useReporterSession();

  const isAlreadyVerified = Boolean(
    verificationTicket &&
    verifiedEmail &&
    verifiedEmail.trim().toLowerCase() === draft.email.trim().toLowerCase()
  );

  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const startCooldown = (seconds: number) => {
    setCooldownUntil(Date.now() + seconds * 1000);
    setCooldownSeconds(seconds);
  };

  const [tokenInput, setTokenInput] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldownUntil <= 0) return;
    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownSeconds(remaining);
      if (remaining === 0) setCooldownUntil(0);
    };
    const timer = setInterval(updateRemaining, 1000);
    document.addEventListener('visibilitychange', updateRemaining);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', updateRemaining);
    };
  }, [cooldownUntil]);

  const handleRequestToken = async (isAutomatic = false) => {
    setRequestLoading(true);
    setRequestError(null);
    setRequestMessage(null);
    try {
      const resp = await requestEmailVerification(draft.email);
      setRequestSent(true);
      startCooldown(60);
      setConfirmError(null);
      setTokenInput('');
      setRequestMessage(resp.message || 'Kode OTP telah dikirim. Periksa email Anda.');
    } catch (err: unknown) {
      if (err instanceof ReportApiError) {
        if (err.code === 'RESEND_COOLDOWN') {
          const retryAfter = (err.meta?.retry_after_seconds as number) || 60;
          setRequestSent(true);
          startCooldown(retryAfter);
          // Returning to this step shortly after a send is normal: the earlier code is still valid.
          if (isAutomatic) {
            setRequestMessage('Kode OTP sebelumnya masih berlaku. Gunakan kode terakhir yang Anda terima.');
          } else {
            setRequestError(`Mohon tunggu ${retryAfter} detik sebelum meminta kode baru.`);
          }
          return;
        }
      }
      const msg = err instanceof Error ? err.message : 'Gagal mengirim permintaan verifikasi';
      setRequestError(msg);
    } finally {
      setRequestLoading(false);
    }
  };

  // Send the OTP automatically once the reporter submits the form and lands here.
  // The ref survives React StrictMode's dev double-mount, so only one email goes out.
  // If the email is already verified and has a valid ticket in memory, do not request a new OTP.
  const autoRequestedRef = useRef(false);
  useEffect(() => {
    if (autoRequestedRef.current) return;
    autoRequestedRef.current = true;
    if (isAlreadyVerified) {
      return;
    }
    void handleRequestToken(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestLoading || confirmLoading) return;
    if (!isValidOtp(tokenInput)) {
      setConfirmError('Masukkan kode OTP 6 digit dari email.');
      return;
    }

    setConfirmLoading(true);
    setConfirmError(null);
    try {
      const resp = await confirmEmailVerification({
        email: draft.email,
        code: tokenInput,
      });
      setVerification(resp.verification_ticket, resp.verified_email);
      onNext();
    } catch (err: unknown) {
      if (err instanceof ReportApiError) {
        if (err.code === 'INVALID_OTP') {
          const remaining = err.meta?.remaining_attempts;
          setConfirmError(
            remaining !== undefined
              ? `Kode OTP tidak valid. Sisa percobaan: ${remaining}.`
              : 'Kode OTP tidak valid atau salah. Periksa kembali email Anda.'
          );
          return;
        }
        if (err.code === 'OTP_EXPIRED') {
          setConfirmError('Kode OTP telah kedaluwarsa atau belum diminta. Silakan minta kode baru.');
          return;
        }
        if (err.code === 'OTP_ATTEMPTS_EXCEEDED') {
          setConfirmError('Batas percobaan memasukkan kode OTP telah terlampaui. Silakan minta kode baru.');
          return;
        }
        if (err.code === 'VERIFICATION_REQUIRED') {
          setConfirmError('Verifikasi email diperlukan sebelum laporan dapat dikirimkan.');
          return;
        }
      }
      const msg = err instanceof Error ? err.message : 'Kode OTP tidak valid atau kedaluwarsa';
      setConfirmError(msg);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="text-xs font-semibold text-brand-700 mb-2">
          <span>Langkah 2 dari 3: Verifikasi Alamat Email</span>
        </div>
        <h2 tabIndex={-1} className="font-display text-lg sm:text-xl font-bold text-brand-900 focus:outline-none text-balance">Verifikasi Kepemilikan Email</h2>
        <p className="text-xs text-slate-600 mt-1">
          Masukkan kode OTP 6 digit yang dikirim ke email Anda.
        </p>
      </div>

      {/* 10-minute TTL Guidance Notice */}
      <p className="flex items-center gap-2 text-sm text-slate-600">
        <Clock className="w-4 h-4 shrink-0 text-brand-700" aria-hidden="true" />
        Masa Berlaku Kode OTP: 10 Menit
      </p>

      {/* Email Display Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-600 block">Alamat Email Pelapor:</span>
            <span className="font-semibold text-slate-900 text-sm break-all">{draft.email}</span>
          </div>
        </div>

        {!isAlreadyVerified && <button
          type="button"
          onClick={() => handleRequestToken()}
          disabled={requestLoading || confirmLoading || cooldownSeconds > 0}
          className="inline-flex min-h-[48px] items-center justify-center space-x-2 px-4 py-2 border border-brand-600 text-brand-700 bg-white hover:bg-brand-50 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-white disabled:cursor-not-allowed rounded-lg text-xs font-medium transition"
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
          <span>
            {requestLoading
              ? 'Mengirim kode...'
              : cooldownSeconds > 0
              ? `Kirim Ulang (${cooldownSeconds} dtk)`
              : requestSent
              ? 'Kirim Ulang Kode'
              : 'Kirim Kode Lagi'}
          </span>
        </button>}
      </div>

      {/* Already Verified Notice */}
      {isAlreadyVerified && (
        <div
          role="status"
          className="bg-brand-50 border border-brand-200 rounded-md p-4 text-xs text-brand-800 flex items-start space-x-2.5"
        >
          <CheckCircle2 className="w-5 h-5 text-seal-green flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-brand-900 text-sm">Alamat Email Telah Terverifikasi</p>
            <p className="text-brand-800 leading-relaxed">
              Email <span className="font-medium text-slate-900 break-all">{draft.email}</span> sudah terverifikasi. Lanjutkan tanpa meminta OTP baru.
            </p>
          </div>
        </div>
      )}

      {requestSent && cooldownSeconds === 0 && (
        <span role="status" className="sr-only">Kode OTP dapat diminta kembali.</span>
      )}

      {/* Status Messages for Request */}
      {requestMessage && (
        <div role="status" className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-xs text-brand-800 flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-seal-green flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">{requestMessage}</p>
            <p className="text-brand-700 mt-0.5">
              Pada prototipe ini, email tidak dikirimkan secara sungguhan. Buka{' '}
              <a href="/demo" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                Pusat Demo (/demo)
              </a>{' '}
              (terbuka di tab baru agar draf formulir tidak hilang) untuk melihat simulasi kode OTP yang diterima.
            </p>
          </div>
        </div>
      )}

      {requestError && (
        <div
          id="request-error"
          role="alert"
          className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start space-x-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">Gagal Mengirim Permintaan Verifikasi</p>
            <p className="mt-0.5">{requestError}</p>
          </div>
        </div>
      )}

      {/* Confirmation Form */}
      <form onSubmit={handleConfirmToken} noValidate className="space-y-4">
        {!isAlreadyVerified && <div>
          <label htmlFor="token" className="block text-sm font-semibold text-slate-800 mb-1">
            Kode OTP Email <span className="text-rose-500">*</span>
          </label>
          <p id="token-hint" className="text-xs text-slate-600 mb-2">
            Masukkan 6 digit kode dari email.
          </p>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Key className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              type="text"
              id="token"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              pattern="[0-9]{6}"
              value={tokenInput}
              disabled={requestLoading || confirmLoading}
              onChange={(e) => { setTokenInput(sanitizeOtp(e.target.value)); setConfirmError(null); }}
              placeholder="Contoh: 123456"
              className="w-full min-h-12 pl-9 pr-3.5 py-3 rounded-md border border-slate-300 font-mono text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              required
              aria-invalid={Boolean(confirmError)}
              aria-describedby={confirmError ? 'token-error token-hint' : 'token-hint'}
            />
          </div>
          {confirmError && (
            <p id="token-error" role="alert" className="mt-1.5 text-xs text-rose-600 font-medium">
              {confirmError}
            </p>
          )}
        </div>}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onBack}
            disabled={requestLoading || confirmLoading}
            className="w-full sm:w-auto min-h-[48px] min-w-[48px] inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Kembali ke Formulir Draf</span>
          </button>

          <button
            type={isAlreadyVerified ? 'button' : 'submit'}
            onClick={isAlreadyVerified ? onNext : undefined}
            disabled={!isAlreadyVerified && (requestLoading || confirmLoading || !tokenInput.trim())}
            className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {isAlreadyVerified
              ? 'Lanjut ke Tinjauan Laporan →'
              : confirmLoading
              ? 'Memverifikasi...'
              : 'Konfirmasi Kode OTP & Tinjau Laporan →'}
          </button>
        </div>
      </form>
    </div>
  );
}
