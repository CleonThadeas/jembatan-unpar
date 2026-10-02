'use client';

import React, { useState } from 'react';
import { useReporterSession } from '@/context/ReporterSessionContext';
import { SubmitReportResponse } from '@/types/report';
import { submitReport } from '@/lib/api-client';
import { newIdempotencyKey } from '@/lib/idempotency';
import { CheckCircle, AlertCircle, ArrowLeft, Send, Paperclip } from 'lucide-react';
import Link from 'next/link';

interface StepReviewSubmitProps {
  onBack: () => void;
  onSuccess: (result: SubmitReportResponse) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StepReviewSubmit({ onBack, onSuccess }: StepReviewSubmitProps) {
  const { draft, verifiedEmail, verificationTicket, attachments } = useReporterSession();

  const [statementChecked, setStatementChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // One key per mounted review step so a retry after a network error replays
  // the same submission instead of creating a duplicate report.
  const [idempotencyKey] = useState(newIdempotencyKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !verificationTicket ||
      !verifiedEmail ||
      verifiedEmail.trim().toLowerCase() !== draft.email.trim().toLowerCase()
    ) {
      setSubmitError('Tiket verifikasi email tidak sesuai dengan alamat email draf saat ini. Silakan verifikasi email kembali.');
      return;
    }

    if (!statementChecked) {
      setSubmitError('Anda wajib menyetujui pernyataan kebenaran laporan sebelum mengirim.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const resp = await submitReport(
        {
          email: verifiedEmail,
          category_id: draft.category_id,
          title: draft.title,
          description: draft.description,
          reporter_impact: draft.reporter_impact,
          verification_ticket: verificationTicket,
        },
        idempotencyKey,
        attachments
      );

      onSuccess(resp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim laporan';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs font-semibold text-brand-700 mb-2">
          <span>Langkah 3 dari 3: Tinjauan &amp; Pengiriman</span>
          <span className="text-seal-green font-semibold flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Email Terverifikasi</span>
          </span>
        </div>
        <h2 tabIndex={-1} className="font-display text-lg sm:text-xl font-bold text-brand-900 focus:outline-none text-balance">Tinjau Laporan Anda</h2>
        <p className="text-xs text-slate-500 mt-1">
          Periksa informasi sebelum mengirim. Simpan kode akses yang akan ditampilkan satu kali setelah laporan diterima.
        </p>
      </div>

      {/* Review Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 sm:p-5 space-y-4 text-sm [overflow-wrap:anywhere]">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Email Pelapor (Terverifikasi)
          </span>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{verifiedEmail}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-brand-50 border border-brand-200 text-brand-800">
              Terverifikasi
            </span>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Judul Laporan
          </span>
          <p className="mt-1 font-semibold text-slate-900">{draft.title}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Dampak Pelapor
            </span>
            <p className="mt-1 font-medium text-slate-800">{draft.reporter_impact}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Kategori Laporan
            </span>
            <p className="mt-1 font-medium text-slate-900">
              {draft.category_name || draft.category_id}
            </p>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Deskripsi Laporan
          </span>
          <div className="mt-1 p-3 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
            {draft.description}
          </div>
        </div>

        {/* Lampiran Berkas */}
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Lampiran Berkas ({attachments.length})
          </span>
          {attachments.length === 0 ? (
            <p className="mt-1 text-xs text-slate-500 italic">Tidak ada berkas lampiran</p>
          ) : (
            <ul aria-label="Daftar berkas lampiran yang akan dikirim" className="mt-1.5 space-y-1.5">
              {attachments.map((file, idx) => (
                <li
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" aria-hidden="true" />
                    <span className="text-slate-800 font-medium truncate">{file.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 flex-shrink-0 ml-2">
                    {formatFileSize(file.size)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link href="/lapor/tentang#privasi" className="min-h-12 inline-flex items-center text-sm font-medium text-brand-700 hover:underline">
          Privasi dan batasan layanan
        </Link>
      </div>

      {submitError && (
        <div role="alert" className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">Gagal Menyimpan Laporan</p>
            <p className="mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex items-start space-x-3 p-3 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50/50 transition">
          <input
            type="checkbox"
            checked={statementChecked}
            onChange={(e) => setStatementChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            required
          />
          <span className="text-xs text-slate-700 leading-relaxed">
            Saya menyatakan bahwa laporan ini diajukan dengan informasi yang benar, beriktikad baik, dan tidak memuat fitnah. Saya memahami bahwa laporan akan ditinjau oleh tim mahasiswa pengelola secara rahasia.
          </span>
        </label>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 min-h-[48px] min-w-[48px] px-4 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Kembali Ubah Draf</span>
          </button>

          <button
            type="submit"
            disabled={submitting || !statementChecked}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 min-h-[48px] px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>{submitting ? 'Menyimpan Laporan...' : 'Kirim Laporan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
