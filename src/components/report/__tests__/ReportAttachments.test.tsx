import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { StepFormInput } from '@/components/report/StepFormInput';
import { StepReviewSubmit } from '@/components/report/StepReviewSubmit';
import { ReporterSessionProvider, useReporterSession } from '@/context/ReporterSessionContext';
import { SubmitReportResponse } from '@/types/report';
import * as apiClient from '@/lib/api-client';

const mockCategories = [
  { id: 'cat-fac-1', name: 'Sarana & Prasarana', slug: 'sarana' },
  { id: 'cat-acad-2', name: 'Layanan Akademik', slug: 'akademik' },
];

function ReviewTestHarness({
  onBack = vi.fn(),
  onSuccess = vi.fn(),
}: {
  onBack?: () => void;
  onSuccess?: (res: SubmitReportResponse) => void;
}) {
  const { setVerification } = useReporterSession();
  useEffect(() => {
    setVerification('ticket-signed-valid', 'mahasiswa@kampus.ac.id');
  }, [setVerification]);

  return <StepReviewSubmit onBack={onBack} onSuccess={onSuccess} />;
}

describe('Report Attachments & Review Step Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('StepFormInput: File upload and client-side validation', () => {
    it('allows selecting valid attachment files and displays them with human sizes and removal buttons', async () => {
      vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);

      render(
        <ReporterSessionProvider>
          <StepFormInput onNext={vi.fn()} />
        </ReporterSessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Sarana & Prasarana')).toBeInTheDocument();
      });

      const fileInput = screen.getByLabelText(/Lampiran Berkas/i);
      expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,application/pdf');
      expect(fileInput).toHaveAttribute('multiple');

      const photo = new File(['mock-photo-content'], 'bukti-kondisi.jpg', { type: 'image/jpeg' });
      const doc = new File(['mock-pdf-content'], 'surat-pernyataan.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [photo, doc] } });

      await waitFor(() => {
        expect(screen.getByText('bukti-kondisi.jpg')).toBeInTheDocument();
        expect(screen.getByText('surat-pernyataan.pdf')).toBeInTheDocument();
      });

      // Removal buttons have descriptive aria-label with filename and touch target >= 48px
      const removePhotoBtn = screen.getByRole('button', { name: 'Hapus berkas bukti-kondisi.jpg' });
      expect(removePhotoBtn).toBeInTheDocument();
      expect(removePhotoBtn).toHaveClass('min-h-[48px]', 'min-w-[48px]');

      const removeDocBtn = screen.getByRole('button', { name: 'Hapus berkas surat-pernyataan.pdf' });
      expect(removeDocBtn).toBeInTheDocument();

      // Remove photo
      fireEvent.click(removePhotoBtn);

      await waitFor(() => {
        expect(screen.queryByText('bukti-kondisi.jpg')).not.toBeInTheDocument();
        expect(screen.getByText('surat-pernyataan.pdf')).toBeInTheDocument();
      });
    });

    it('rejects selecting more than 3 files and displays an accessible alert', async () => {
      vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);

      render(
        <ReporterSessionProvider>
          <StepFormInput onNext={vi.fn()} />
        </ReporterSessionProvider>
      );

      await screen.findByText('Sarana & Prasarana');

      const fileInput = screen.getByLabelText(/Lampiran Berkas/i);
      const files = [
        new File(['f1'], 'file1.png', { type: 'image/png' }),
        new File(['f2'], 'file2.png', { type: 'image/png' }),
        new File(['f3'], 'file3.png', { type: 'image/png' }),
        new File(['f4'], 'file4.png', { type: 'image/png' }),
      ];

      fireEvent.change(fileInput, { target: { files } });

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(/Maksimal 3 berkas lampiran yang dapat diunggah/i);
      expect(fileInput).toHaveAttribute('aria-invalid', 'true');
      expect(fileInput.getAttribute('aria-describedby')).toContain('attachment-error');
    });

    it('rejects 0-byte empty files and displays an accessible alert', async () => {
      vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);

      render(
        <ReporterSessionProvider>
          <StepFormInput onNext={vi.fn()} />
        </ReporterSessionProvider>
      );

      await screen.findByText('Sarana & Prasarana');

      const fileInput = screen.getByLabelText(/Lampiran Berkas/i);
      const zeroByteFile = new File([], 'empty-file.pdf', { type: 'application/pdf' });
      expect(zeroByteFile.size).toBe(0);

      fireEvent.change(fileInput, { target: { files: [zeroByteFile] } });

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(/kosong \(0 byte\) dan tidak dapat diunggah/i);
      expect(fileInput).toHaveAttribute('aria-invalid', 'true');
      expect(fileInput.getAttribute('aria-describedby')).toContain('attachment-error');
    });

    it('rejects files larger than 10 MB and displays an accessible alert', async () => {
      vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);

      render(
        <ReporterSessionProvider>
          <StepFormInput onNext={vi.fn()} />
        </ReporterSessionProvider>
      );

      await screen.findByText('Sarana & Prasarana');

      const fileInput = screen.getByLabelText(/Lampiran Berkas/i);
      // 10 MB + 1 byte = 10485761 bytes
      const bigFile = new File(['a'], 'oversized-photo.jpg', { type: 'image/jpeg' });
      Object.defineProperty(bigFile, 'size', { value: 10 * 1024 * 1024 + 1 });

      fireEvent.change(fileInput, { target: { files: [bigFile] } });

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(/melebihi batas 10 MB/i);
      expect(fileInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('rejects unsupported file formats by extension and MIME type', async () => {
      vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);

      render(
        <ReporterSessionProvider>
          <StepFormInput onNext={vi.fn()} />
        </ReporterSessionProvider>
      );

      await screen.findByText('Sarana & Prasarana');

      const fileInput = screen.getByLabelText(/Lampiran Berkas/i);
      const invalidFile = new File(['executable content'], 'malicious.exe', {
        type: 'application/x-msdownload',
      });

      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(
        /Format berkas "malicious.exe" tidak didukung. Hanya JPEG, PNG, dan PDF yang diperbolehkan/i
      );
      expect(fileInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('StepReviewSubmit: Category name, attachments display, and submitReport call', () => {
    it('shows selected category name instead of UUID and lists attachment files', async () => {
      const file1 = new File(['img-content'], 'foto-kerusakan.jpg', { type: 'image/jpeg' });
      const file2 = new File(['pdf-content'], 'laporan-kronologi.pdf', { type: 'application/pdf' });

      render(
        <ReporterSessionProvider
          initialDraft={{
            title: 'Lampu Koridor Gedung A Rusak',
            description: 'Lampu padam menyebabkan area sangat gelap saat malam.',
            reporter_impact: 'Tinggi',
            category_id: 'cat-fac-1',
            category_name: 'Sarana & Prasarana',
            email: 'mahasiswa@kampus.ac.id',
          }}
          initialAttachments={[file1, file2]}
        >
          <ReviewTestHarness />
        </ReporterSessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Tinjau Laporan Anda')).toBeInTheDocument();
      });

      // Category name shown, not the raw UUID
      expect(screen.getByText('Sarana & Prasarana')).toBeInTheDocument();
      expect(screen.queryByText('cat-fac-1')).not.toBeInTheDocument();

      // Attachments list shown with filenames
      expect(screen.getByText('foto-kerusakan.jpg')).toBeInTheDocument();
      expect(screen.getByText('laporan-kronologi.pdf')).toBeInTheDocument();
      expect(screen.getByText(/Lampiran Berkas \(2\)/i)).toBeInTheDocument();

      // Exactly 1 checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(1);

      // Only 1 button matching /Kembali/i
      const backButtons = screen.getAllByRole('button', { name: /Kembali/i });
      expect(backButtons).toHaveLength(1);
    });

    it('shows "Tidak ada berkas lampiran" when no attachments are present', async () => {
      render(
        <ReporterSessionProvider
          initialDraft={{
            title: 'Keluhan Layanan Perpustakaan',
            description: 'Peminjaman buku online sering gagal diproses.',
            reporter_impact: 'Rendah',
            category_id: 'cat-acad-2',
            category_name: 'Layanan Akademik',
            email: 'mahasiswa@kampus.ac.id',
          }}
          initialAttachments={[]}
        >
          <ReviewTestHarness />
        </ReporterSessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Tinjau Laporan Anda')).toBeInTheDocument();
      });

      expect(screen.getByText('Tidak ada berkas lampiran')).toBeInTheDocument();
      expect(screen.getByText(/Lampiran Berkas \(0\)/i)).toBeInTheDocument();
    });

    it('submits report with attachments passed to submitReport when Kirim Laporan is clicked', async () => {
      const file1 = new File(['evidence'], 'kerusakan.png', { type: 'image/png' });
      const submitSpy = vi.spyOn(apiClient, 'submitReport').mockResolvedValue({
        report_id: 'rep-sub-1',
        reference_number: 'LAP-2026-SUB1',
        access_code: 'ACCESS-CODE-SUB-12345',
        created_at: '2026-10-01T12:00:00Z',
      });

      const onSuccess = vi.fn();

      render(
        <ReporterSessionProvider
          initialDraft={{
            title: 'Wastafel Rusak di Lantai 2',
            description: 'Wastafel bocor dan membasahi lantai toilet.',
            reporter_impact: 'Sedang',
            category_id: 'cat-fac-1',
            category_name: 'Sarana & Prasarana',
            email: 'mahasiswa@kampus.ac.id',
          }}
          initialAttachments={[file1]}
        >
          <ReviewTestHarness onSuccess={onSuccess} />
        </ReporterSessionProvider>
      );

      await screen.findByText('Tinjau Laporan Anda');

      const submitBtn = screen.getByRole('button', { name: /Kirim Laporan$/i });
      expect(submitBtn).toBeDisabled();

      // Check statement checkbox
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(submitBtn).toBeEnabled();

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(submitSpy).toHaveBeenCalledTimes(1);
      });

      expect(submitSpy).toHaveBeenCalledWith(
        {
          email: 'mahasiswa@kampus.ac.id',
          category_id: 'cat-fac-1',
          title: 'Wastafel Rusak di Lantai 2',
          description: 'Wastafel bocor dan membasahi lantai toilet.',
          reporter_impact: 'Sedang',
          verification_ticket: 'ticket-signed-valid',
        },
        expect.any(String), // idempotency key
        [file1] // attachments
      );

      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          reference_number: 'LAP-2026-SUB1',
          access_code: 'ACCESS-CODE-SUB-12345',
        })
      );
    });
  });
});
