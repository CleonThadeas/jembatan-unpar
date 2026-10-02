'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ReporterReportDetail, AccessResponse, AttachmentMeta } from '@/types/report';
import { getReporterReportDetail, downloadReporterAttachment, ReportApiError } from '@/lib/api-client';
import { useReporterSession } from '@/context/ReporterSessionContext';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { ReportConversation } from './ReportConversation';
import {
  ShieldCheck,
  Calendar,
  Mail,
  AlertCircle,
  Clock,
  History,
  LogOut,
  RefreshCw,
  Info,
  ShieldAlert,
  ArrowRight,
  Paperclip,
  Download,
} from 'lucide-react';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReportDetailView() {
  const { sessionToken, reportId: contextReportId, clearLocalSession, setSession } = useReporterSession();

  const [detail, setDetail] = useState<ReporterReportDetail | null>(null);
  const detailRef = React.useRef<ReporterReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const activeReportIdRef = React.useRef<string | null>(null);
  const contextReportIdRef = React.useRef<string | null>(contextReportId);
  const sessionTokenRef = React.useRef<string | null>(sessionToken);
  const requestIdRef = React.useRef(0);
  const isMountedRef = React.useRef(true);
  const downloadAbortControllerRef = React.useRef<AbortController | null>(null);
  const isDownloadingRef = React.useRef(false);

  useEffect(() => {
    sessionTokenRef.current = sessionToken;
  }, [sessionToken]);

  useEffect(() => {
    contextReportIdRef.current = contextReportId;
    if (contextReportId && !activeReportIdRef.current) {
      activeReportIdRef.current = contextReportId;
    }
  }, [contextReportId]);

  const handleDownloadAttachment = async (att: AttachmentMeta) => {
    if (isDownloadingRef.current || downloadingId) return;
    isDownloadingRef.current = true;
    setDownloadingId(att.id);
    setDownloadError(null);

    const initialReportId = detail?.report?.id || contextReportIdRef.current || activeReportIdRef.current;
    const initialSessionToken = sessionTokenRef.current;

    downloadAbortControllerRef.current?.abort();
    const abortController = new AbortController();
    downloadAbortControllerRef.current = abortController;

    try {
      const { blob, filename } = await downloadReporterAttachment(
        att.id,
        sessionToken,
        abortController.signal
      );

      if (
        !isMountedRef.current ||
        abortController.signal.aborted ||
        (contextReportIdRef.current && initialReportId && contextReportIdRef.current !== initialReportId) ||
        sessionTokenRef.current !== initialSessionToken
      ) {
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      try {
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename || att.original_filename || att.filename || 'lampiran';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (err: unknown) {
      if (abortController.signal.aborted || !isMountedRef.current) return;
      if (
        (contextReportIdRef.current && initialReportId && contextReportIdRef.current !== initialReportId) ||
        sessionTokenRef.current !== initialSessionToken
      ) {
        return;
      }
      const msg = err instanceof Error ? err.message : 'Gagal mengunduh berkas lampiran';
      setDownloadError(`Gagal mengunduh berkas "${att.original_filename || att.filename}": ${msg}`);
    } finally {
      isDownloadingRef.current = false;
      if (isMountedRef.current) {
        setDownloadingId(null);
      }
    }
  };

  // Cross-report mismatch protection:
  // When an access code for another report is entered or detected in the ambient cookie,
  // confidential detail of the previous report is cleared and an explicit navigation prompt is displayed.
  const [sessionMismatch, setSessionMismatch] = useState<{
    targetReportId: string;
    newReportId: string;
    pendingSession?: AccessResponse;
  } | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      downloadAbortControllerRef.current?.abort();
    };
  }, []);

  // When session drops (e.g. logout or external reset clearing sessionToken)
  const prevSessionTokenRef = React.useRef(sessionToken);
  useEffect(() => {
    if (prevSessionTokenRef.current && !sessionToken) {
      requestIdRef.current += 1;
      downloadAbortControllerRef.current?.abort();
      detailRef.current = null;
      setDetail(null);
      setSessionMismatch(null);
      activeReportIdRef.current = null;
      setError('Sesi laporan tidak valid atau kedaluwarsa');
    }
    prevSessionTokenRef.current = sessionToken;
  }, [sessionToken]);

  // Synchronize with demo database reset events and cross-tab reset channel
  useEffect(() => {
    const handleReset = () => {
      requestIdRef.current += 1;
      downloadAbortControllerRef.current?.abort();
      detailRef.current = null;
      setDetail(null);
      setSessionMismatch(null);
      activeReportIdRef.current = null;
      setError('Sesi laporan telah diatur ulang atau kedaluwarsa');
    };

    window.addEventListener('demo-database-reset', handleReset);
    const channel =
      typeof BroadcastChannel === 'function'
        ? new BroadcastChannel('portal-guest-prototype-reset')
        : null;
    if (channel) {
      channel.onmessage = handleReset;
    }

    return () => {
      window.removeEventListener('demo-database-reset', handleReset);
      channel?.close();
    };
  }, []);

  useEffect(() => {
    return () => {
      downloadAbortControllerRef.current?.abort();
    };
  }, [contextReportId, sessionToken]);

  // The mismatch prompt replaces the whole detail (including whatever control had focus),
  // so move focus to its heading instead of letting it fall back to <body>.
  const mismatchHeadingRef = React.useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (sessionMismatch) {
      mismatchHeadingRef.current?.focus();
    }
  }, [sessionMismatch]);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const logoutTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const modalRef = React.useRef<HTMLDivElement | null>(null);
  const modalLinkRef = React.useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (showLogoutModal) {
      modalLinkRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowLogoutModal(false);
          logoutTriggerRef.current?.focus();
        } else if (e.key === 'Tab' && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showLogoutModal]);

  const loadDetail = useCallback(
    async (expectedId?: string, overrideToken?: string | null) => {
      const requestId = ++requestIdRef.current;
      const currentActiveId =
        typeof expectedId === 'string' ? expectedId : activeReportIdRef.current;

      // Only display the full-screen loading state when there is no detail rendered yet.
      // Background refreshes keep the existing detail displayed to prevent conversation unmounts.
      if (!detailRef.current) {
        setLoading(true);
      }
      setError(null);

      try {
        const tokenToUse = overrideToken !== undefined ? overrideToken : sessionToken;
        const data = await getReporterReportDetail(tokenToUse);

        // Discard response if superseded or component has unmounted
        if (!isMountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        // Exact report identity guard:
        // If this view is currently displaying an active report, verify that backend data
        // matches the active report. If backend ambient cookie returns another report B,
        // clear displayed confidential detail immediately and prompt for explicit navigation.
        if (currentActiveId && data.report.id !== currentActiveId) {
          detailRef.current = null;
          setDetail(null);
          setSessionMismatch({
            targetReportId: currentActiveId,
            newReportId: data.report.id,
          });
          return;
        }

        activeReportIdRef.current = data.report.id;
        detailRef.current = data;
        setDetail(data);
        setSessionMismatch(null);
      } catch (err: unknown) {
        if (!isMountedRef.current || requestId !== requestIdRef.current) {
          return;
        }
        const isUnauthorized =
          (err instanceof ReportApiError && err.statusCode === 401) ||
          (err as { statusCode?: number })?.statusCode === 401 ||
          (err instanceof Error && /401|unauthorized|sesi.*berakhir|sesi.*tidak valid|sesi laporan/i.test(err.message));

        const msg = err instanceof Error ? err.message : 'Sesi laporan tidak valid atau kedaluwarsa';
        if (isUnauthorized) {
          detailRef.current = null;
          setDetail(null);
          setSessionMismatch(null);
          activeReportIdRef.current = null;
          setError(msg);
        } else if (!detailRef.current) {
          setError(msg);
        }
      } finally {
        if (isMountedRef.current && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [sessionToken]
  );

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleLogout = () => {
    downloadAbortControllerRef.current?.abort();
    clearLocalSession();
    setShowLogoutModal(true);
  };

  const handleExplicitNavigateToNewReport = () => {
    downloadAbortControllerRef.current?.abort();
    if (!sessionMismatch) return;
    const newId = sessionMismatch.newReportId;
    const pending = sessionMismatch.pendingSession;
    setSessionMismatch(null);
    activeReportIdRef.current = newId;

    if (pending && pending.report_id === newId) {
      setSession(pending);
      loadDetail(newId, pending.session_token);
    } else {
      loadDetail(newId);
    }
  };

  if (sessionMismatch) {
    return (
      <div
        role="region"
        aria-label="Pemberitahuan Peralihan Sesi Laporan"
        className="bg-white rounded-2xl shadow-sm border border-gold-400 p-8 text-center space-y-5 max-w-xl mx-auto"
      >
        <div className="w-14 h-14 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h2
            ref={mismatchHeadingRef}
            tabIndex={-1}
            className="text-lg font-bold text-slate-900 focus:outline-none"
          >
            Sesi Berpindah ke Laporan Lain
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Kode akses rahasia yang baru saja dimasukkan valid untuk laporan lain (ID: <strong className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">{sessionMismatch.newReportId}</strong>), bukan laporan yang sedang Anda lihat sebelumnya (ID: <strong className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">{sessionMismatch.targetReportId}</strong>).
          </p>
        </div>

        <div className="bg-gold-50 border border-gold-400 rounded-xl p-4 text-[11px] text-ink-900 text-left space-y-1.5">
          <div className="font-bold flex items-center space-x-1.5 text-ink-900">
            <AlertCircle className="w-4 h-4 text-gold-700 flex-shrink-0" aria-hidden="true" />
            <span>Perlindungan Privasi & Batasan Sesi:</span>
          </div>
          <p className="leading-relaxed">
            Demi menjaga kerahasiaan laporan, seluruh data detail laporan sebelumnya telah dibersihkan dari layar ini. Sesi lokal telah diperbarui ke laporan baru tersebut, namun detail laporan baru sengaja tidak dimuat otomatis.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <button
            type="button"
            onClick={handleExplicitNavigateToNewReport}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <span>Buka Laporan Terkait ({sessionMismatch.newReportId})</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <Link
            href="/lapor/cek-laporan"
            onClick={() => setSessionMismatch(null)}
            className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Kembali ke Cek Laporan
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !detail) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-base font-bold text-slate-800">Memuat Data Laporan...</h2>
        <p className="text-xs text-slate-500 mt-1">Mengautentikasi sesi laporan Anda pada penyimpanan demo lokal.</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Sesi Laporan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {error || 'Sesi akses Anda telah kedaluwarsa atau belum diautentikasi.'}
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
          <Link
            href="/lapor/cek-laporan"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            Masukkan Kode Akses di Halaman Cek Laporan
          </Link>
          <Link
            href="/lapor/pemulihan"
            className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Pemulihan Kode via Email
          </Link>
        </div>
      </div>
    );
  }

  const { report, messages, events } = detail;
  const statusConfig = STATUS_LABELS[report.status] || {
    label: report.status,
    description: '',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
  };
  const priorityConfig = report.priority ? PRIORITY_LABELS[report.priority] : null;

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
            <span>Nomor Referensi:</span>
            <span className="font-mono text-slate-900 text-sm font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 select-all">
              {report.reference_number}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{report.title}</h1>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => loadDetail()}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Muat Ulang Data Laporan"
            aria-label="Muat Ulang Data Laporan"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            ref={logoutTriggerRef}
            type="button"
            onClick={handleLogout}
            className="min-h-[44px] inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Tutup Sesi di Perangkat</span>
          </button>
        </div>
      </div>

      {/* Status & Priority Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Status Laporan
          </span>
          <div className="mt-2 flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.badge}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            {statusConfig.description}
          </p>
        </div>

        {/* Priority Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Prioritas Penanganan Tim
          </span>
          <div className="mt-2 flex items-center space-x-2">
            {priorityConfig ? (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${priorityConfig.badge}`}
              >
                {priorityConfig.label}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                Menunggu Penilaian Tim
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Ditetapkan oleh tim mahasiswa pengelola setelah menilai dampak laporan.
          </p>
        </div>

        {/* Reporter Impact Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Dampak Menurut Pelapor
          </span>
          <div className="mt-2">
            <span className="font-semibold text-slate-800 text-sm">{report.reporter_impact}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Masukan urgensi yang Anda berikan saat pertama kali mengisi formulir.
          </p>
        </div>
      </div>

      {/* Main Report Information Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center space-x-2">
          <Info className="w-4 h-4 text-brand-600" aria-hidden="true" />
          <span>Informasi Detail Laporan</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-500 block">Kategori Laporan:</span>
            <span className="font-medium text-slate-900 mt-0.5 block">
              {report.category_name || report.category_id}
            </span>
          </div>

          <div>
            <span className="font-semibold text-slate-500 block">Email Pelapor (Terverifikasi):</span>
            <span className="font-medium text-slate-900 mt-0.5 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>{report.reporter_email}</span>
            </span>
          </div>

          <div>
            <span className="font-semibold text-slate-500 block">Waktu Pengajuan:</span>
            <span className="font-medium text-slate-700 mt-0.5 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>{formatDateTime(report.created_at)}</span>
            </span>
          </div>

          {report.resolved_at && (
            <div>
              <span className="font-semibold text-slate-500 block">Waktu Penyelesaian:</span>
              <span className="font-medium text-brand-700 mt-0.5 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-700" aria-hidden="true" />
                <span>{formatDateTime(report.resolved_at)}</span>
              </span>
            </div>
          )}
        </div>

        {report.resolution_reason && (
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-xs text-brand-900">
            <span className="font-bold block mb-0.5">Catatan / Alasan Penyelesaian:</span>
            <p className="leading-relaxed">{report.resolution_reason}</p>
          </div>
        )}

        {report.resolution_next_steps && (
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-xs text-brand-900">
            <span className="font-bold block mb-0.5">Langkah Tindak Lanjut:</span>
            <p className="leading-relaxed">{report.resolution_next_steps}</p>
          </div>
        )}

        <div>
          <span className="font-semibold text-slate-700 text-xs block mb-1">
            Uraian Deskripsi Laporan:
          </span>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
            {report.description}
          </div>
        </div>

        {/* Lampiran Berkas Section */}
        {detail.attachments && detail.attachments.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 text-xs flex items-center space-x-1.5">
                <Paperclip className="w-4 h-4 text-brand-600" aria-hidden="true" />
                <span>Berkas Lampiran ({detail.attachments.length})</span>
              </span>
            </div>

            {downloadError && (
              <div
                role="alert"
                className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start space-x-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p>{downloadError}</p>
              </div>
            )}

            <ul aria-label="Daftar berkas lampiran laporan" className="space-y-2">
              {detail.attachments.map((att) => {
                const displayName = att.original_filename || att.filename;
                const sizeBytes = att.file_size_bytes || att.size_bytes || 0;
                const isDownloading = downloadingId === att.id;

                return (
                  <li
                    key={att.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs gap-2"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <Paperclip className="w-4 h-4 text-brand-700 flex-shrink-0" aria-hidden="true" />
                      <div className="truncate">
                        <span className="font-medium text-slate-900 block truncate">{displayName}</span>
                        <span className="text-[11px] text-slate-500">
                          {formatFileSize(sizeBytes)} &bull; {att.content_type || att.mime_type || 'Berkas'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadAttachment(att)}
                      disabled={Boolean(downloadingId)}
                      aria-label={`Unduh berkas ${displayName}`}
                      className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Download className="w-4 h-4 text-brand-700" aria-hidden="true" />
                      <span>{isDownloading ? 'Mengunduh...' : 'Unduh'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Events / Audit Timeline */}
      {events && events.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <History className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <h2 className="text-base font-bold text-slate-900">Kronologi & Riwayat Aktivitas</h2>
          </div>

          <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2">
            {events.map((ev) => (
              <div key={ev.id} className="relative group">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-white shadow-sm" />
                <div className="text-xs">
                  <div className="flex items-center space-x-2 text-slate-500">
                    <span className="font-semibold text-slate-800">
                      {ev.event_type.replace(/_/g, ' ')}
                    </span>
                    <span>•</span>
                    <span>{formatDateTime(ev.created_at)}</span>
                  </div>
                  {ev.new_status && (
                    <p className="mt-0.5 text-slate-600">
                      Status diubah menjadi <strong>{STATUS_LABELS[ev.new_status]?.label || ev.new_status}</strong>
                    </p>
                  )}
                  {ev.new_priority && (
                    <p className="mt-0.5 text-slate-600">
                      Prioritas ditetapkan ke <strong>{ev.new_priority}</strong>
                    </p>
                  )}
                  {ev.reason && (
                    <p className="mt-1 text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-200">
                      Catatan: &ldquo;{ev.reason}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Conversation Section */}
      <ReportConversation
        key={report.id}
        reportId={report.id}
        status={report.status}
        initialMessages={messages}
        onMessageSent={() => loadDetail(report.id)}
        onSessionMismatch={(mismatch) => {
          detailRef.current = null;
          setDetail(null);
          setSessionMismatch(mismatch);
        }}
      />

      {/* Truthful Logout Explanation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogoutModal(false);
              logoutTriggerRef.current?.focus();
            }
          }}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-desc"
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>

            <div className="text-center">
              <h2 id="logout-modal-title" className="text-lg font-bold text-slate-900">
                Sesi Lokal Dibersihkan
              </h2>
              <p id="logout-modal-desc" className="text-xs text-slate-600 mt-2 leading-relaxed">
                Token otorisasi dan kredensial di memori browser Anda telah dihapus secara aman.
              </p>
            </div>

            <div className="bg-gold-50 border border-gold-400 rounded-lg p-3 text-[11px] text-ink-900 space-y-1">
              <span className="font-semibold block text-ink-900">
                Pemberitahuan Prototype Demo:
              </span>
              <p className="leading-relaxed">
                Sesi otorisasi pada prototipe ini dikelola secara lokal pada peramban. Token sesi telah dihapus dari memori. Sesi demo juga dapat diatur ulang sewaktu-waktu melalui tombol reset pada panel kontrol demo.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <Link
                ref={modalLinkRef}
                href="/lapor/cek-laporan"
                onClick={() => {
                  setShowLogoutModal(false);
                  logoutTriggerRef.current?.focus();
                }}
                className="w-full text-center px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Kembali ke Halaman Cek Laporan
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
