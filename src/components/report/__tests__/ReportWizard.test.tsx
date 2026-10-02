import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { ReportWizard } from '@/components/report/ReportWizard';
import { ReporterSessionProvider } from '@/context/ReporterSessionContext';
import * as apiClient from '@/lib/api-client';

describe('ReportWizard Component (portal-guest)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockCategories = [
    { id: 'cat-uuid-1', name: 'Akademik & Perkuliahan', slug: 'akademik' },
    { id: 'cat-uuid-2', name: 'Sarana & Prasarana', slug: 'fasilitas' },
  ];

  it('keeps form guidance brief and links detailed privacy guidance without hiding attachment limits', async () => {
    vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);

    render(
      <ReporterSessionProvider>
        <ReportWizard />
      </ReporterSessionProvider>
    );

    await screen.findByRole('option', { name: 'Akademik & Perkuliahan' });
    expect(screen.getByRole('link', { name: /Privasi laporan/i })).toHaveAttribute('href', '/lapor/tentang#privasi');
    expect(screen.getByText(/Maksimal 3 berkas.*10 MB/i)).toBeInTheDocument();
    expect(screen.queryByText(/Draf Tersimpan di Memori/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Gunakan email aktif untuk menerima kode verifikasi/i)).toBeInTheDocument();
  });

  it('renders Step 1 by default and shows honest error if category API fails', async () => {
    vi.spyOn(apiClient, 'fetchPublicCategories').mockRejectedValue(
      new Error('Connection refused to backend')
    );

    render(
      <ReporterSessionProvider>
        <ReportWizard />
      </ReporterSessionProvider>
    );

    expect(screen.getByText(/Langkah 1 dari 3: Pengisian Formulir/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Kategori Belum Tersedia/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Gagal memuat pilihan kategori laporan/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Coba Lagi Muat Kategori/i })
      ).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', {
      name: /Kirim & Verifikasi Email/i,
    });
    expect(nextButton).toBeDisabled();
  });

  it('completes the full 4-step wizard workflow preserving draft in memory', async () => {
    vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);
    vi.spyOn(apiClient, 'requestEmailVerification').mockResolvedValue({
      message: 'Token verifikasi terkirim',
    });
    vi.spyOn(apiClient, 'confirmEmailVerification').mockResolvedValue({
      verified_email: 'mahasiswa@univ.ac.id',
      verification_ticket: 'ticket-signed-xyz',
    });
    vi.spyOn(apiClient, 'submitReport').mockResolvedValue({
      report_id: 'rep-final-1',
      reference_number: 'REP-20260925-ABCD1',
      access_code: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
      created_at: '2026-09-25T10:00:00Z',
    });

    render(
      <ReporterSessionProvider>
        <ReportWizard />
      </ReporterSessionProvider>
    );

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('Akademik & Perkuliahan')).toBeInTheDocument();
    });

    // STEP 1: Fill form
    const titleInput = screen.getByPlaceholderText(/Contoh: Kerusakan fasilitas proyektor/i);
    const descInput = screen.getByPlaceholderText(/Tuliskan kronologi, lokasi spesifik/i);
    const emailInput = screen.getByPlaceholderText('nama.mahasiswa@univ.ac.id');

    fireEvent.change(titleInput, { target: { value: 'AC di Lab Komputer 2 Mati Total' } });
    fireEvent.change(descInput, {
      target: { value: 'Sejak kemarin siang AC tidak dingin dan mengeluarkan dengungan.' },
    });
    fireEvent.change(emailInput, { target: { value: 'mahasiswa@univ.ac.id' } });

    const nextToEmailBtn = screen.getByRole('button', {
      name: /Kirim & Verifikasi Email/i,
    });
    fireEvent.click(nextToEmailBtn);

    // STEP 2: Verify Email
    await waitFor(() => {
      expect(screen.getByText(/Langkah 2 dari 3: Verifikasi Alamat Email/i)).toBeInTheDocument();
    });

    expect(screen.getByText('mahasiswa@univ.ac.id')).toBeInTheDocument();

    // The OTP is sent automatically on arrival; no manual click needed.
    await waitFor(() => {
      expect(screen.getByText(/Token verifikasi terkirim/i)).toBeInTheDocument();
    });

    const tokenInput = screen.getByLabelText(/Kode OTP Email/i);
    const confirmTokenBtn = screen.getByRole('button', {
      name: /Konfirmasi Kode OTP & Tinjau Laporan/i,
    });

    fireEvent.change(tokenInput, { target: { value: '123456' } });
    fireEvent.click(confirmTokenBtn);

    // STEP 3: Review and Submit
    await waitFor(() => {
      expect(screen.getByText(/Tinjau Laporan Anda/i)).toBeInTheDocument();
    });

    expect(screen.getByText('AC di Lab Komputer 2 Mati Total')).toBeInTheDocument();
    expect(screen.getByText('Email Terverifikasi')).toBeInTheDocument();
    expect(screen.queryByText(/Laporan dilindungi kunci idempoten/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Privasi dan batasan layanan/i })).toHaveAttribute('href', '/lapor/tentang#privasi');

    const agreementCheckbox = screen.getByRole('checkbox');
    fireEvent.click(agreementCheckbox);

    const submitBtn = screen.getByRole('button', { name: /Kirim Laporan/i });
    fireEvent.click(submitBtn);

    // STEP 4: Success with One-Time Secret Access Code
    await waitFor(() => {
      expect(screen.getByText(/Laporan Berhasil Diterima/i)).toBeInTheDocument();
    });

    expect(screen.getByText('REP-20260925-ABCD1')).toBeInTheDocument();
    expect(screen.getByText('XXXXX-XXXXX-XXXXX-XXXXX-XXXXX')).toBeInTheDocument();
    expect(
      screen.getByText(/KODE AKSES RAHASIA \(DITAMPILKAN SATU KALI\)/i)
    ).toBeInTheDocument();
  });

  it('renders title counter with WCAG AA compliant text-slate-600 contrast and accessible error alerts', async () => {
    vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);

    render(
      <ReporterSessionProvider>
        <ReportWizard />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Akademik & Perkuliahan')).toBeInTheDocument();
    });

    const counter = screen.getByText('0/200 karakter');
    expect(counter).toHaveClass('text-slate-600');
    expect(counter).not.toHaveClass('text-slate-400');

    // Trigger validation error on empty submit
    const nextBtn = screen.getByRole('button', { name: /Kirim & Verifikasi Email/i });
    fireEvent.click(nextBtn);

    const errorAlerts = screen.getAllByRole('alert');
    expect(errorAlerts.length).toBeGreaterThan(0);
    expect(screen.getByText(/Judul (laporan|pengaduan) wajib diisi/i)).toBeInTheDocument();
  });

  it('invalidates email verification ticket if reporter goes back and modifies email', async () => {
    vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);
    vi.spyOn(apiClient, 'requestEmailVerification').mockResolvedValue({
      message: 'Token verifikasi terkirim',
    });
    vi.spyOn(apiClient, 'confirmEmailVerification').mockResolvedValue({
      verified_email: 'first@univ.ac.id',
      verification_ticket: 'ticket-signed-1',
    });

    render(
      <ReporterSessionProvider>
        <ReportWizard />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Akademik & Perkuliahan')).toBeInTheDocument();
    });

    // Fill Step 1 with first email
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Kerusakan fasilitas proyektor/i), {
      target: { value: 'Proyektor Rusak di Gedung B' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Tuliskan kronologi, lokasi spesifik/i), {
      target: { value: 'Proyektor mati saat kuliah umum tadi pagi.' },
    });
    fireEvent.change(screen.getByPlaceholderText('nama.mahasiswa@univ.ac.id'), {
      target: { value: 'first@univ.ac.id' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim & Verifikasi Email/i }));

    // In Step 2: request and confirm token
    await waitFor(() => {
      expect(screen.getByText('first@univ.ac.id')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(apiClient.requestEmailVerification).toHaveBeenLastCalledWith('first@univ.ac.id');
    });
    fireEvent.change(screen.getByLabelText(/Kode OTP Email/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i }));

    // Now in Step 3 (Review): go back directly to Step 1
    await waitFor(() => {
      expect(screen.getByText(/Tinjau Laporan Anda/i)).toBeInTheDocument();
    });
    const backBtn = screen.getByRole('button', { name: /Kembali Ubah Draf/i });
    fireEvent.click(backBtn);

    // Navigates directly to Step 1 (not Step 2)
    await waitFor(() => {
      expect(screen.getByText(/Langkah 1 dari 3: Pengisian Formulir/i)).toBeInTheDocument();
    });

    // In Step 1: change email to different address
    const emailField = screen.getByPlaceholderText('nama.mahasiswa@univ.ac.id');
    fireEvent.change(emailField, { target: { value: 'tampered@univ.ac.id' } });

    // Proceed to Step 2: verify button must require re-verification
    fireEvent.click(screen.getByRole('button', { name: /Kirim & Verifikasi Email/i }));
    await waitFor(() => {
      expect(screen.getByText('tampered@univ.ac.id')).toBeInTheDocument();
    });
    // A new OTP is requested automatically for the changed address.
    await waitFor(() => {
      expect(apiClient.requestEmailVerification).toHaveBeenLastCalledWith('tampered@univ.ac.id');
    });
  });

  it('StepEmailVerification provides accessible aria-invalid, aria-describedby and role="alert" on errors', async () => {
    vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);
    vi.spyOn(apiClient, 'requestEmailVerification').mockRejectedValue(
      new Error('Layanan verifikasi email sedang mengalami gangguan')
    );
    vi.spyOn(apiClient, 'confirmEmailVerification').mockRejectedValue(
      new Error('Token verifikasi tidak valid atau kedaluwarsa')
    );

    render(
      <ReporterSessionProvider>
        <ReportWizard />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Akademik & Perkuliahan')).toBeInTheDocument();
    });

    // Fill minimal Step 1
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Kerusakan fasilitas proyektor/i), {
      target: { value: 'Wifi di Perpustakaan Putus' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Tuliskan kronologi, lokasi spesifik/i), {
      target: { value: 'Koneksi terputus terus menerus sejak pagi.' },
    });
    fireEvent.change(screen.getByPlaceholderText('nama.mahasiswa@univ.ac.id'), {
      target: { value: 'mahasiswa.wifi@univ.ac.id' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim & Verifikasi Email/i }));

    await waitFor(() => {
      expect(screen.getByText(/Langkah 2 dari 3/i)).toBeInTheDocument();
    });

    const tokenInput = screen.getByLabelText(/Kode OTP Email/i);
    expect(tokenInput).toHaveAttribute('aria-invalid', 'false');
    expect(tokenInput).toHaveAttribute('aria-describedby', 'token-hint');

    // The automatic OTP request on arrival fails and is announced as an alert
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const requestAlert = alerts.find((el) =>
        el.textContent?.includes('Layanan verifikasi email sedang mengalami gangguan')
      );
      expect(requestAlert).toBeInTheDocument();
    });

    // Trigger confirmation token failure
    fireEvent.change(tokenInput, { target: { value: '000000' } });
    const confirmBtn = screen.getByRole('button', {
      name: /Konfirmasi Kode OTP & Tinjau Laporan/i,
    });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      const confirmAlert = screen.getByText(/Token verifikasi tidak valid atau kedaluwarsa/i);
      expect(confirmAlert).toBeInTheDocument();
      expect(confirmAlert.closest('[role="alert"]')).toBeInTheDocument();
    });

    expect(tokenInput).toHaveAttribute('aria-invalid', 'true');
    expect(tokenInput.getAttribute('aria-describedby')).toContain('token-error');
  });

  it('moves focus to the new step heading on step change and announces submit/access errors as alerts', async () => {
    vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);
    vi.spyOn(apiClient, 'requestEmailVerification').mockResolvedValue({
      message: 'Token verifikasi terkirim',
    });
    vi.spyOn(apiClient, 'confirmEmailVerification').mockResolvedValue({
      verified_email: 'fokus@univ.ac.id',
      verification_ticket: 'ticket-fokus',
    });
    vi.spyOn(apiClient, 'submitReport')
      .mockRejectedValueOnce(new Error('Server sedang sibuk, coba lagi'))
      .mockResolvedValueOnce({
        report_id: 'rep-fokus-1',
        reference_number: 'REP-20260927-FOKUS',
        access_code: 'AAAAA-BBBBB-CCCCC-DDDDD-EEEEE',
        created_at: '2026-09-27T10:00:00Z',
      });
    vi.spyOn(apiClient, 'checkAccessCode').mockRejectedValue(
      new Error('Sesi laporan tidak dapat dibuka')
    );

    render(
      <ReporterSessionProvider>
        <ReportWizard />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Akademik & Perkuliahan')).toBeInTheDocument();
    });
    // Initial mount must not steal focus.
    expect(document.activeElement).toBe(document.body);

    fireEvent.change(screen.getByPlaceholderText(/Contoh: Kerusakan fasilitas proyektor/i), {
      target: { value: 'Kursi Kelas Patah' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Tuliskan kronologi, lokasi spesifik/i), {
      target: { value: 'Beberapa kursi di ruang C3 patah dan membahayakan.' },
    });
    fireEvent.change(screen.getByPlaceholderText('nama.mahasiswa@univ.ac.id'), {
      target: { value: 'fokus@univ.ac.id' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim & Verifikasi Email/i }));

    const step2Heading = await screen.findByRole('heading', {
      name: /Verifikasi Kepemilikan Email/i,
    });
    await waitFor(() => expect(document.activeElement).toBe(step2Heading));

    await screen.findByText(/Token verifikasi terkirim/i);
    fireEvent.change(screen.getByLabelText(/Kode OTP Email/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i }));

    const step3Heading = await screen.findByRole('heading', { name: /Tinjau Laporan Anda/i });
    await waitFor(() => expect(document.activeElement).toBe(step3Heading));

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Kirim Laporan/i }));

    await waitFor(() => {
      const submitAlert = screen
        .getAllByRole('alert')
        .find((el) => el.textContent?.includes('Server sedang sibuk, coba lagi'));
      expect(submitAlert).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Kirim Laporan/i }));

    const step4Heading = await screen.findByRole('heading', {
      name: /Laporan Berhasil Diterima/i,
    });
    await waitFor(() => expect(document.activeElement).toBe(step4Heading));

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Langsung Pantau Laporan Ini/i }));

    await waitFor(() => {
      const accessAlert = screen
        .getAllByRole('alert')
        .find((el) => el.textContent?.includes('Sesi laporan tidak dapat dibuka'));
      expect(accessAlert).toBeInTheDocument();
    });
  });

  it('renders StepEmailVerification requestMessage in a container with role="status"', async () => {
    vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);
    vi.spyOn(apiClient, 'requestEmailVerification').mockResolvedValue({
      message: 'Token verifikasi berhasil dikirim ke alamat email Anda.',
    });

    render(
      <ReporterSessionProvider>
        <ReportWizard />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Akademik & Perkuliahan')).toBeInTheDocument();
    });

    // Fill minimal Step 1
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Kerusakan fasilitas proyektor/i), {
      target: { value: 'Lampu Kelas Mati' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Tuliskan kronologi, lokasi spesifik/i), {
      target: { value: 'Lampu kelas padam sejak kuliah pagi.' },
    });
    fireEvent.change(screen.getByPlaceholderText('nama.mahasiswa@univ.ac.id'), {
      target: { value: 'mahasiswa.lampu@univ.ac.id' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim & Verifikasi Email/i }));

    await waitFor(() => {
      expect(screen.getByText(/Langkah 2 dari 3/i)).toBeInTheDocument();
    });

    // The OTP request fires automatically on arrival
    await waitFor(() => {
      const statusEl = screen.getByText('Token verifikasi berhasil dikirim ke alamat email Anda.').closest('[role="status"]');
      expect(statusEl).toBeInTheDocument();
      expect(statusEl).toHaveTextContent('Token verifikasi berhasil dikirim ke alamat email Anda.');
    });
  });

  it('exposes accessible progressbar with step attributes for steps 1-3', async () => {
    vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);

    render(
      <ReporterSessionProvider>
        <ReportWizard />
      </ReporterSessionProvider>
    );

    await screen.findByRole('option', { name: 'Akademik & Perkuliahan' });

    const progressBar = screen.getByRole('progressbar', { name: /Kemajuan formulir laporan/i });
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    expect(progressBar).toHaveAttribute('aria-valuemin', '1');
    expect(progressBar).toHaveAttribute('aria-valuemax', '3');
    expect(progressBar).toHaveAttribute('aria-valuetext', 'Langkah 1 dari 3');
  });

  it('navigates directly from Step 3 Review back to Step 1 Form Input and does not resend OTP if email unchanged', async () => {
    vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);
    vi.spyOn(apiClient, 'requestEmailVerification').mockResolvedValue({
      message: 'Token verifikasi terkirim',
    });
    vi.spyOn(apiClient, 'confirmEmailVerification').mockResolvedValue({
      verified_email: 'pelapor.tetap@univ.ac.id',
      verification_ticket: 'ticket-signed-valid',
    });

    render(
      <ReporterSessionProvider>
        <ReportWizard />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Akademik & Perkuliahan')).toBeInTheDocument();
    });

    // Step 1: Fill form
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Kerusakan fasilitas proyektor/i), {
      target: { value: 'Kursi Kuliah Rusak' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Tuliskan kronologi, lokasi spesifik/i), {
      target: { value: 'Kursi patah di ruang 201' },
    });
    fireEvent.change(screen.getByPlaceholderText('nama.mahasiswa@univ.ac.id'), {
      target: { value: 'pelapor.tetap@univ.ac.id' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim & Verifikasi Email/i }));

    // Step 2: Confirm OTP
    await waitFor(() => {
      expect(screen.getByText(/Langkah 2 dari 3/i)).toBeInTheDocument();
    });
    expect(apiClient.requestEmailVerification).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText(/Kode OTP Email/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i }));

    // Step 3: Review step
    await waitFor(() => {
      expect(screen.getByText(/Tinjau Laporan Anda/i)).toBeInTheDocument();
    });

    // Click "Kembali Ubah Draf" on Step 3
    const backBtn = screen.getByRole('button', { name: /Kembali Ubah Draf/i });
    fireEvent.click(backBtn);

    // Verify it navigates directly to Step 1
    await waitFor(() => {
      expect(screen.getByText(/Langkah 1 dari 3: Pengisian Formulir/i)).toBeInTheDocument();
    });

    // Modify title only, keep email with case variation
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Kerusakan fasilitas proyektor/i), {
      target: { value: 'Kursi Kuliah Rusak Parah Sekali' },
    });
    fireEvent.change(screen.getByPlaceholderText('nama.mahasiswa@univ.ac.id'), {
      target: { value: 'PELAPOR.TETAP@UNIV.AC.ID' },
    });

    // Advance to Step 2 again
    fireEvent.click(screen.getByRole('button', { name: /Kirim & Verifikasi Email/i }));

    await waitFor(() => {
      expect(screen.getByText(/Langkah 2 dari 3/i)).toBeInTheDocument();
    });

    // Must NOT send a new OTP because email is verified and ticket is still valid
    expect(apiClient.requestEmailVerification).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Alamat Email Telah Terverifikasi/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Lanjut ke Tinjauan Laporan/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('resets internal step and submissionResult to Step 1 on demo-database-reset event and BroadcastChannel message', async () => {
    vi.spyOn(apiClient, 'fetchPublicCategories').mockResolvedValue(mockCategories);
    vi.spyOn(apiClient, 'requestEmailVerification').mockResolvedValue({
      message: 'Token verifikasi terkirim',
    });

    // Mock BroadcastChannel for cross-instance messaging
    const channelInstances: any[] = [];
    const OriginalBroadcastChannel = globalThis.BroadcastChannel;
    class MockBroadcastChannel {
      name: string;
      onmessage: ((ev: any) => void) | null = null;
      constructor(name: string) {
        this.name = name;
        channelInstances.push(this);
      }
      postMessage(data: any) {
        for (const inst of channelInstances) {
          inst.onmessage?.({ data });
        }
      }
      close = vi.fn();
    }
    globalThis.BroadcastChannel = MockBroadcastChannel as any;

    try {
      render(
        <ReporterSessionProvider>
          <ReportWizard />
        </ReporterSessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Akademik & Perkuliahan')).toBeInTheDocument();
      });

      // Advance to Step 2
      fireEvent.change(screen.getByPlaceholderText(/Contoh: Kerusakan fasilitas proyektor/i), {
        target: { value: 'Kursi Kuliah Rusak' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Tuliskan kronologi, lokasi spesifik/i), {
        target: { value: 'Kursi patah di ruang 201' },
      });
      fireEvent.change(screen.getByPlaceholderText('nama.mahasiswa@univ.ac.id'), {
        target: { value: 'pelapor@univ.ac.id' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Kirim & Verifikasi Email/i }));

      await waitFor(() => {
        expect(screen.getByText(/Langkah 2 dari 3: Verifikasi Alamat Email/i)).toBeInTheDocument();
      });

      // 1. Reset via window event demo-database-reset wrapped in act
      act(() => {
        window.dispatchEvent(new Event('demo-database-reset'));
      });

      await waitFor(() => {
        expect(screen.getByText(/Langkah 1 dari 3: Pengisian Formulir/i)).toBeInTheDocument();
      });

      // Advance to Step 2 again by re-filling form (draft was reset)
      fireEvent.change(screen.getByPlaceholderText(/Contoh: Kerusakan fasilitas proyektor/i), {
        target: { value: 'Kursi Kuliah Rusak Lagi' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Tuliskan kronologi, lokasi spesifik/i), {
        target: { value: 'Kursi patah di ruang 201' },
      });
      fireEvent.change(screen.getByPlaceholderText('nama.mahasiswa@univ.ac.id'), {
        target: { value: 'pelapor@univ.ac.id' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Kirim & Verifikasi Email/i }));
      await waitFor(() => {
        expect(screen.getByText(/Langkah 2 dari 3: Verifikasi Alamat Email/i)).toBeInTheDocument();
      });

      // 2. Reset via BroadcastChannel message wrapped in act
      act(() => {
        const sender = new MockBroadcastChannel('portal-guest-prototype-reset');
        sender.postMessage({ type: 'reset' });
      });

      await waitFor(() => {
        expect(screen.getByText(/Langkah 1 dari 3: Pengisian Formulir/i)).toBeInTheDocument();
      });
    } finally {
      globalThis.BroadcastChannel = OriginalBroadcastChannel;
    }
  });
});
