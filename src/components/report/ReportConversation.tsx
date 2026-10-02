'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ReportMessage, ReportStatus, AccessResponse } from '@/types/report';
import { useReporterSession, SupersededError } from '@/context/ReporterSessionContext';
import { postReporterMessage } from '@/lib/api-client';
import { newIdempotencyKey } from '@/lib/idempotency';
import { formatDateTime } from '@/lib/utils';
import { MessageSquare, Send, Lock, ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReportConversationProps {
  reportId: string;
  status: ReportStatus;
  initialMessages: ReportMessage[];
  onMessageSent?: () => void;
  onSessionMismatch?: (mismatch: {
    targetReportId: string;
    newReportId: string;
    pendingSession?: AccessResponse;
  }) => void;
}

export function ReportConversation({
  reportId,
  status,
  initialMessages,
  onMessageSent,
  onSessionMismatch,
}: ReportConversationProps) {
  const {
    csrfToken,
    sessionToken,
    reportId: sessionReportId,
    hasMutationCapability,
    reauthenticateWithCode,
    clearLocalSession,
  } = useReporterSession();

  const [messages, setMessages] = useState<ReportMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // In-memory re-authentication after page reload
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [reauthLoading, setReauthLoading] = useState(false);
  const [reauthError, setReauthError] = useState<string | null>(null);
  const [reauthSuccess, setReauthSuccess] = useState(false);

  // Stale message props synchronization:
  // Update internal messages when parent passes fresh initialMessages
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const isClosed = status === 'SELESAI';

  // Exact report identity required for mutation:
  // sessionReportId must be present and must strictly match the conversation's reportId.
  const isSessionMatching = Boolean(sessionReportId && sessionReportId === reportId);
  const canMutate = hasMutationCapability && isSessionMatching;

  // Move focus to the newly unlocked reply form so keyboard/screen-reader users land on it.
  const replyRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (reauthSuccess && canMutate) {
      replyRef.current?.focus();
    }
  }, [reauthSuccess, canMutate]);

  const handleReauthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCodeInput.trim()) {
      setReauthError('Masukkan kode akses rahasia Anda.');
      return;
    }

    setReauthLoading(true);
    setReauthError(null);
    const targetReportId = reportId;
    try {
      const resp = await reauthenticateWithCode(accessCodeInput.trim(), targetReportId);
      if (!resp || typeof resp.report_id !== 'string') {
        throw new Error('Format respons sesi tidak valid dari server');
      }

      if (resp.report_id !== targetReportId || reportId !== targetReportId) {
        // Cross-report reauth mismatch:
        // checkAccessCode sets the HttpOnly report_session cookie for resp.report_id.
        // Wipe local in-memory session immediately so Report A does not retain B's tokens.
        clearLocalSession();
        setReauthError(
          `Kode akses rahasia valid untuk laporan lain (${resp.report_id}), bukan laporan ini (${targetReportId}). Sesi mutasi pada laporan ini ditolak demi keamanan. Silakan buka laporan terkait melalui menu Cek Laporan atau gunakan kode yang sesuai.`
        );
        setReauthSuccess(false);

        if (onSessionMismatch) {
          onSessionMismatch({
            targetReportId,
            newReportId: resp.report_id,
            pendingSession: resp,
          });
        }
        return;
      }

      setReauthSuccess(true);
      setAccessCodeInput('');
    } catch (err: unknown) {
      if (err instanceof SupersededError || (err instanceof Error && err.name === 'SupersededError')) {
        return;
      }
      const msg = err instanceof Error ? err.message : 'Kode akses rahasia tidak cocok';
      setReauthError(msg);
    } finally {
      setReauthLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const targetReportId = reportId;
    if (!canMutate || !sessionReportId || sessionReportId !== targetReportId) {
      setSendError('Sesi mutasi tidak cocok dengan laporan ini. Pengiriman pesan ditolak.');
      return;
    }

    setSending(true);
    setSendError(null);
    try {
      const idempotencyKey = newIdempotencyKey();

      const created = await postReporterMessage(
        newMessage.trim(),
        csrfToken,
        sessionToken,
        idempotencyKey
      );

      // Guard against reportId changing during async network transit
      if (reportId !== targetReportId || sessionReportId !== targetReportId) {
        return;
      }

      setMessages((prev) => [...prev, created]);
      setNewMessage('');
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim pesan balasan';
      setSendError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6" aria-labelledby="percakapan-heading">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-brand-600" aria-hidden="true" />
          <h2 id="percakapan-heading" className="text-lg font-bold text-slate-900">
            Percakapan Terbuka dengan Tim Pengelola
          </h2>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
          {messages.length} Pesan
        </span>
      </div>

      {/* Messages List */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Riwayat pesan percakapan"
        className="space-y-4 max-h-[500px] overflow-y-auto pr-1 focus:outline-none focus:ring-1 focus:ring-brand-500 rounded-lg"
      >
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-xs">
            Belum ada pesan percakapan untuk laporan ini. Anda dapat mengirimkan pesan tambahan atau tanggapan melalui kolom di bawah.
          </div>
        ) : (
          messages.map((msg) => {
            const isReporter = msg.sender_type === 'PELAPOR';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isReporter ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-2 mb-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {isReporter ? 'Anda (Pelapor)' : msg.admin_name || 'Tim Mahasiswa Pengelola'}
                  </span>
                  <span>•</span>
                  <span>{formatDateTime(msg.created_at)}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-lg text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                    isReporter
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Section */}
      {isClosed ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-600 flex items-center justify-center space-x-2">
          <Lock className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <span>
            Laporan ini telah berstatus <strong>SELESAI</strong>. Percakapan telah ditutup dan balasan baru dinonaktifkan.
          </span>
        </div>
      ) : !canMutate ? (
        /* Security Guard: Page was reloaded or session belongs to another report, requiring Secret Access Code */
        <div className="bg-gold-50 border border-gold-400 rounded-xl p-5 text-xs text-ink-900 space-y-3">
          <div className="flex items-start space-x-2.5">
            <KeyRound className="w-5 h-5 text-gold-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-bold text-ink-900 text-sm">
                Otorisasi Balasan Baru Diperlukan (Keamanan Memori)
              </h3>
              <p className="mt-1 text-ink-600 leading-relaxed">
                Demi keamanan akun laporan Anda, token CSRF mutasi hanya disimpan di memori browser dan dihapus secara otomatis saat halaman dimuat ulang. Untuk mengirim balasan baru, silakan masukkan kembali Kode Akses Rahasia Anda.
              </p>
            </div>
          </div>

          <form onSubmit={handleReauthenticate} className="flex flex-col sm:flex-row gap-2 pt-1">
            <label htmlFor="reauth-access-code" className="sr-only">
              Kode Akses Rahasia
            </label>
            <input
              id="reauth-access-code"
              type="password"
              autoComplete="current-password"
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              placeholder="Masukkan Kode Akses Rahasia..."
              className="flex-1 px-3.5 py-2 rounded-lg border border-gold-400 font-mono text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
              aria-invalid={Boolean(reauthError)}
              aria-describedby={reauthError ? 'reauth-error-desc' : undefined}
              required
            />
            <button
              type="submit"
              disabled={reauthLoading || !accessCodeInput.trim()}
              className="min-h-[44px] px-4 py-2 bg-brand-700 hover:bg-brand-800 disabled:bg-slate-300 text-white font-semibold rounded-lg text-xs transition"
            >
              {reauthLoading ? 'Memverifikasi...' : 'Aktifkan Formulir Balasan'}
            </button>
          </form>

          {reauthError && (
            <p id="reauth-error-desc" role="alert" className="text-xs text-rose-600 font-medium">
              {reauthError}
            </p>
          )}
        </div>
      ) : (
        /* Active Reply Form */
        <form onSubmit={handleSendMessage} className="space-y-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <label htmlFor="reply-message" className="font-semibold text-slate-800">
              Tulis Balasan / Informasi Tambahan
            </label>
            <span className="flex items-center space-x-1 text-brand-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Otorisasi Mutasi Aktif</span>
            </span>
          </div>

          {reauthSuccess && (
            <div role="status" className="flex items-center space-x-1.5 text-xs text-brand-700 font-medium">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Sesi mutasi berhasil diaktifkan kembali.</span>
            </div>
          )}

          <textarea
            ref={replyRef}
            id="reply-message"
            rows={3}
            aria-invalid={Boolean(sendError)}
            aria-describedby={sendError ? 'reply-error-desc' : undefined}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tuliskan pesan tanggapan atau informasi tambahan untuk tim penanganan..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            required
          />

          {sendError && (
            <div id="reply-error-desc" role="alert" className="flex items-center space-x-1.5 text-xs text-rose-600 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>{sendError}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="inline-flex items-center space-x-2 min-h-[44px] px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{sending ? 'Mengirim...' : 'Kirim Balasan'}</span>
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
