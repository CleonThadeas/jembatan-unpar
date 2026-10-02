'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PublicCategory,
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE_BYTES,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  ALLOWED_ATTACHMENT_EXTENSIONS,
} from '@/types/report';
import { fetchPublicCategories } from '@/lib/api-client';
import { REPORTER_IMPACT_OPTIONS } from '@/lib/constants';
import { useReporterSession } from '@/context/ReporterSessionContext';
import { AlertCircle, RefreshCw, Paperclip, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface StepFormInputProps {
  onNext: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StepFormInput({ onNext }: StepFormInputProps) {
  const { draft, updateDraft, attachments, addAttachments, removeAttachment } = useReporterSession();

  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const data = await fetchPublicCategories();
      if (!Array.isArray(data) || data.length === 0) {
        setCategoriesError('Daftar kategori laporan belum tersedia saat ini. Silakan coba beberapa saat lagi.');
        setCategories([]);
      } else {
        setCategories(data);
        if (!draft.category_id && data.length > 0) {
          updateDraft({ category_id: data[0].id, category_name: data[0].name });
        } else if (draft.category_id && !draft.category_name) {
          const found = data.find((c) => c.id === draft.category_id);
          if (found) {
            updateDraft({ category_name: found.name });
          }
        }
      }
    } catch {
      setCategoriesError(
        'Gagal memuat pilihan kategori laporan. Silakan periksa koneksi internet Anda atau klik tombol "Coba Lagi Muat Kategori".'
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load categories once per mount. loadCategories reads draft.category_id only to
  // preselect a default; re-running it on draft changes would refetch on every keystroke.
  // Retries go through the explicit "Coba Lagi" button instead.
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError(null);
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (attachments.length + selectedFiles.length > MAX_ATTACHMENT_COUNT) {
      setAttachmentError(`Maksimal ${MAX_ATTACHMENT_COUNT} berkas lampiran yang dapat diunggah.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    for (const file of selectedFiles) {
      if (file.size === 0) {
        setAttachmentError(`Berkas "${file.name}" kosong (0 byte) dan tidak dapat diunggah.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        setAttachmentError(`Ukuran berkas "${file.name}" melebihi batas 10 MB.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
      const isValidExt = ALLOWED_ATTACHMENT_EXTENSIONS.includes(
        ext as (typeof ALLOWED_ATTACHMENT_EXTENSIONS)[number]
      );
      const isValidMime = file.type
        ? ALLOWED_ATTACHMENT_MIME_TYPES.includes(
            file.type as (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number]
          )
        : isValidExt;

      if (!isValidExt || !isValidMime) {
        setAttachmentError(
          `Format berkas "${file.name}" tidak didukung. Hanya JPEG, PNG, dan PDF yang diperbolehkan.`
        );
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    addAttachments(selectedFiles);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!draft.title.trim()) {
      errors.title = 'Judul laporan wajib diisi.';
    } else if (draft.title.trim().length < 5) {
      errors.title = 'Judul laporan minimal 5 karakter.';
    } else if (draft.title.trim().length > 200) {
      errors.title = 'Judul laporan maksimal 200 karakter.';
    }

    if (!draft.category_id) {
      errors.category_id = 'Pilih kategori laporan yang valid dari server.';
    }

    if (!draft.reporter_impact.trim()) {
      errors.reporter_impact = 'Pilih tingkat dampak laporan.';
    }

    if (!draft.description.trim()) {
      errors.description = 'Deskripsi laporan wajib diisi secara rinci.';
    } else if (draft.description.trim().length < 10) {
      errors.description = 'Deskripsi laporan minimal 10 karakter.';
    } else if (draft.description.trim().length > 5000) {
      errors.description = 'Deskripsi laporan maksimal 5000 karakter.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!draft.email.trim()) {
      errors.email = 'Alamat email wajib diisi untuk verifikasi.';
    } else if (!emailRegex.test(draft.email.trim())) {
      errors.email = 'Format alamat email tidak valid.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Step Indicator Header */}
      <div className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold text-brand-700 mb-2">Langkah 1 dari 3: Pengisian Formulir</p>
        <h2 tabIndex={-1} className="font-display text-lg sm:text-xl font-bold text-brand-900 focus:outline-none text-balance">Ceritakan Kondisi yang Anda Alami</h2>
        <Link href="/lapor/tentang#privasi" className="inline-flex items-center min-h-12 text-sm font-medium text-brand-700 hover:underline">
          Privasi laporan
        </Link>
      </div>

      {/* Judul Laporan */}
      <div>
        <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1 mb-1.5">
          <label htmlFor="title" className="block text-sm font-semibold text-slate-800">
            Judul Laporan <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs text-slate-600">{draft.title.length}/200 karakter</span>
        </div>
        <input
          type="text"
          id="title"
          maxLength={200}
          value={draft.title}
          onChange={(e) => updateDraft({ title: e.target.value })}
          placeholder="Contoh: Kerusakan fasilitas proyektor di Ruang Kuliah Bersama 301"
          className={`w-full min-h-12 px-3.5 py-3 rounded-md border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition ${
            validationErrors.title
              ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
              : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
          }`}
          aria-invalid={Boolean(validationErrors.title)}
          aria-describedby={validationErrors.title ? 'title-error' : undefined}
          required
        />
        {validationErrors.title && (
          <p id="title-error" role="alert" className="mt-1 text-xs text-rose-600 font-medium">
            {validationErrors.title}
          </p>
        )}
      </div>

      {/* Kategori Laporan (Real DB / API) */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-semibold text-slate-800 mb-1.5">
          Kategori Laporan <span className="text-rose-500">*</span>
        </label>

        {categoriesLoading ? (
          <div className="flex items-center space-x-2 text-xs text-slate-600 py-2.5 px-3 bg-slate-50 rounded-lg border border-slate-200">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-600" aria-hidden="true" />
            <span>Memuat kategori laporan...</span>
          </div>
        ) : categoriesError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold text-rose-900">Kategori Belum Tersedia</p>
                <p className="mt-0.5 leading-relaxed">{categoriesError}</p>
                <button
                  type="button"
                  onClick={loadCategories}
                  className="mt-2 min-h-12 inline-flex items-center space-x-1 px-3 py-2 bg-white border border-rose-300 rounded text-rose-700 font-medium hover:bg-rose-100 transition"
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" />
                  <span>Coba Lagi Muat Kategori</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <select
            id="category_id"
            value={draft.category_id}
            onChange={(e) => {
              const selected = categories.find((c) => c.id === e.target.value);
              updateDraft({
                category_id: e.target.value,
                category_name: selected?.name || '',
              });
            }}
            className={`w-full min-h-12 px-3.5 py-3 rounded-md border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition ${
              validationErrors.category_id
                ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
            }`}
            aria-invalid={Boolean(validationErrors.category_id)}
            aria-describedby={validationErrors.category_id ? 'category-error' : undefined}
            required
          >
            <option value="" disabled>
              -- Pilih Kategori Laporan --
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
        {validationErrors.category_id && (
          <p id="category-error" role="alert" className="mt-1 text-xs text-rose-600 font-medium">
            {validationErrors.category_id}
          </p>
        )}
      </div>

      {/* Dampak / Urgensi menurut pelapor */}
      <div>
        <label htmlFor="reporter_impact" className="block text-sm font-semibold text-slate-800 mb-1">
          Dampak / Urgensi Menurut Anda <span className="text-rose-500">*</span>
        </label>
        <p className="text-xs text-slate-600 mb-1.5">
          Pilih dampak yang Anda rasakan; prioritas penanganan dinilai oleh tim pengelola.
        </p>
        <select
          id="reporter_impact"
          value={draft.reporter_impact}
          onChange={(e) => updateDraft({ reporter_impact: e.target.value })}
          className="w-full min-h-12 px-3.5 py-3 rounded-md border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
          required
        >
          {REPORTER_IMPACT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Deskripsi Laporan */}
      <div>
        <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1 mb-1.5">
          <label htmlFor="description" className="block text-sm font-semibold text-slate-800">
            Deskripsi Rinci Laporan <span className="text-rose-500">*</span>
          </label>
          <span className="text-xs text-slate-600">{draft.description.length}/5000 karakter</span>
        </div>
        <textarea
          id="description"
          rows={5}
          maxLength={5000}
          value={draft.description}
          onChange={(e) => updateDraft({ description: e.target.value })}
          placeholder="Tuliskan kronologi, lokasi spesifik, waktu kejadian, dan pihak-pihak terkait secara jelas dan objektif..."
          className={`w-full min-h-12 px-3.5 py-3 rounded-md border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition ${
            validationErrors.description
              ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
              : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
          }`}
          aria-invalid={Boolean(validationErrors.description)}
          aria-describedby={validationErrors.description ? 'desc-error' : undefined}
          required
        />
        {validationErrors.description && (
          <p id="desc-error" role="alert" className="mt-1 text-xs text-rose-600 font-medium">
            {validationErrors.description}
          </p>
        )}
      </div>

      {/* Lampiran Berkas */}
      <div>
        <label htmlFor="attachments" className="block text-sm font-semibold text-slate-800 mb-1">
          Lampiran Berkas <span className="text-xs font-normal text-slate-500">(Opsional)</span>
        </label>
        <p id="attachment-hint" className="text-xs text-slate-600 mb-2">
          Maksimal 3 berkas (JPEG, PNG, atau PDF), masing-masing maksimal 10 MB.
        </p>

        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            id="attachments"
            multiple
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
            aria-describedby={attachmentError ? 'attachment-error attachment-hint' : 'attachment-hint'}
            aria-invalid={Boolean(attachmentError)}
            className="block w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer min-h-[48px] file:min-h-[48px] transition"
          />

          {attachmentError && (
            <p id="attachment-error" role="alert" className="text-xs text-rose-600 font-medium">
              {attachmentError}
            </p>
          )}

          {attachments.length > 0 && (
            <ul aria-label="Daftar berkas lampiran" className="space-y-2">
              {attachments.map((file, idx) => (
                <li
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <Paperclip className="w-4 h-4 text-brand-700 flex-shrink-0" aria-hidden="true" />
                    <div className="truncate">
                      <span className="font-medium text-slate-900 block truncate">{file.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {formatFileSize(file.size)} &bull; {file.type || 'Berkas'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeAttachment(idx);
                      setAttachmentError(null);
                    }}
                    aria-label={`Hapus berkas ${file.name}`}
                    className="min-h-[48px] min-w-[48px] inline-flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Email Pelapor */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-800 mb-1">
          Alamat Email Mahasiswa / Pelapor <span className="text-rose-500">*</span>
        </label>
        <p className="text-xs text-slate-600 mb-1.5">
          Gunakan email aktif untuk menerima kode verifikasi.
        </p>
        <input
          type="email"
          id="email"
          value={draft.email}
          onChange={(e) => updateDraft({ email: e.target.value })}
          placeholder="nama.mahasiswa@univ.ac.id"
          className={`w-full min-h-12 px-3.5 py-3 rounded-md border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 transition ${
            validationErrors.email
              ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
              : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'
          }`}
          aria-invalid={Boolean(validationErrors.email)}
          aria-describedby={validationErrors.email ? 'email-error' : undefined}
          required
        />
        {validationErrors.email && (
          <p id="email-error" role="alert" className="mt-1 text-xs text-rose-600 font-medium">
            {validationErrors.email}
          </p>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={categoriesLoading || Boolean(categoriesError)}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-sm text-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Kirim &amp; Verifikasi Email &rarr;
        </button>
      </div>
    </form>
  );
}
