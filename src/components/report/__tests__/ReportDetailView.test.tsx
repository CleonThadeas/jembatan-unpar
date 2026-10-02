import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { ReportDetailView } from '@/components/report/ReportDetailView';
import { ReporterSessionProvider, useReporterSession } from '@/context/ReporterSessionContext';
import * as apiClient from '@/lib/api-client';
import { ReporterReportDetail } from '@/types/report';

describe('ReportDetailView Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockDetail: ReporterReportDetail = {
    report: {
      id: 'rep-001',
      reference_number: 'REP-20260925-12345',
      title: 'Lampu Jalan Dekat Rektorat Rusak',
      description: 'Lampu jalan penerangan dekat gedung rektorat padam sejak dua hari lalu.',
      status: 'DIPROSES',
      reporter_impact: 'SEDANG',
      reporter_email: 'pelapor@univ.ac.id',
      priority: 'P2',
      category_id: 'cat-infra',
      category_name: 'Infrastruktur Kampus',
      created_at: '2026-09-25T10:00:00Z',
      updated_at: '2026-09-25T10:00:00Z',
    },
    messages: [],
    events: [
      {
        id: 'ev-1',
        report_id: 'rep-001',
        actor_type: 'SYSTEM',
        event_type: 'STATUS_CHANGED',
        new_status: 'DIPROSES',
        reason: 'Sedang ditindaklanjuti oleh tim teknis',
        created_at: '2026-09-25T11:00:00Z',
      },
    ],
  };

  it('renders report details, reference number, status and priority', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(mockDetail);

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
      expect(screen.getByText('REP-20260925-12345')).toBeInTheDocument();
      expect(screen.getAllByText('Diproses').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('P2 - Rendah Menengah')).toBeInTheDocument();
    });

    expect(screen.getByText('Infrastruktur Kampus')).toBeInTheDocument();
    expect(screen.getByText('pelapor@univ.ac.id')).toBeInTheDocument();
    expect(screen.getByText(/Status diubah menjadi/i)).toHaveTextContent('Status diubah menjadi Diproses');
  });

  it('renders resolution_next_steps and category_id fallback when present', async () => {
    const resolvedDetail: ReporterReportDetail = {
      ...mockDetail,
      report: {
        ...mockDetail.report,
        status: 'SELESAI',
        category_name: undefined,
        category_id: 'cat-fallback-id',
        resolution_reason: 'Perbaikan telah diselesaikan teknisi lapangan.',
        resolution_next_steps: 'Harap laporkan kembali jika lampu kembali redup.',
      },
      events: [
        {
          id: 'ev-resolved',
          report_id: 'rep-001',
          actor_type: 'ADMIN',
          event_type: 'STATUS_CHANGED',
          new_status: 'SELESAI',
          reason: 'Pekerjaan selesai',
          created_at: '2026-09-26T09:00:00Z',
        },
      ],
    };
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(resolvedDetail);

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Selesai').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Langkah Tindak Lanjut:')).toBeInTheDocument();
      expect(
        screen.getByText('Harap laporkan kembali jika lampu kembali redup.')
      ).toBeInTheDocument();
      expect(screen.getByText('cat-fallback-id')).toBeInTheDocument();
      expect(screen.getByText('Perbaikan telah diselesaikan teknisi lapangan.')).toBeInTheDocument();
    });

    expect(screen.getByText(/Status diubah menjadi/i)).toHaveTextContent('Status diubah menjadi Selesai');
  });

  it('renders fallback links to /lapor/cek-laporan and /lapor/pemulihan when session is missing', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail').mockRejectedValue(
      new Error('Sesi laporan tidak valid')
    );

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sesi Laporan Tidak Ditemukan')).toBeInTheDocument();
    });

    const checkReportLink = screen.getByRole('link', {
      name: /Masukkan Kode Akses di Halaman Cek Laporan/i,
    });
    const recoveryLink = screen.getByRole('link', {
      name: /Pemulihan Kode via Email/i,
    });

    expect(checkReportLink).toHaveAttribute('href', '/lapor/cek-laporan');
    expect(recoveryLink).toHaveAttribute('href', '/lapor/pemulihan');
  });

  it('opens logout explanation modal with dialog semantics, aria-modal, and focus management', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(mockDetail);

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
    });

    const logoutTrigger = screen.getByRole('button', { name: /Tutup Sesi di Perangkat/i });
    logoutTrigger.focus();
    expect(document.activeElement).toBe(logoutTrigger);

    fireEvent.click(logoutTrigger);

    const dialog = screen.getByRole('dialog', { name: /Sesi Lokal Dibersihkan/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'logout-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'logout-modal-desc');

    const modalLink = screen.getByRole('link', { name: /Kembali ke Halaman Cek Laporan/i });
    expect(document.activeElement).toBe(modalLink);
  });

  it('closes logout modal on Escape key and restores focus to trigger button', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(mockDetail);

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
    });

    const logoutTrigger = screen.getByRole('button', { name: /Tutup Sesi di Perangkat/i });
    logoutTrigger.focus();

    fireEvent.click(logoutTrigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(logoutTrigger);
  });

  it('clears displayed confidential detail of report A and displays explicit navigation prompt when B access code is entered', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(mockDetail);
    vi.spyOn(apiClient, 'checkAccessCode').mockResolvedValue({
      report_id: 'rep-002',
      session_token: 'sess-002',
      csrf_token: 'csrf-002',
      expires_at: '2026-09-25T15:00:00Z',
    });

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
      expect(screen.getByText('REP-20260925-12345')).toBeInTheDocument();
    });

    // Enter access code for another report (rep-002) in the reauth form
    const codeInput = screen.getByLabelText(/Kode Akses Rahasia/i);
    const reauthButton = screen.getByRole('button', { name: /Aktifkan Formulir Balasan/i });

    fireEvent.change(codeInput, { target: { value: 'SECRET-FOR-REPORT-002' } });
    fireEvent.click(reauthButton);

    // Report A's confidential detail MUST be cleared from display
    await waitFor(() => {
      expect(screen.queryByText('Lampu Jalan Dekat Rektorat Rusak')).not.toBeInTheDocument();
      expect(screen.queryByText('REP-20260925-12345')).not.toBeInTheDocument();
      expect(screen.queryByText('pelapor@univ.ac.id')).not.toBeInTheDocument();
    });

    // Report B's detail must NOT be automatically shown
    expect(screen.queryByText('Detail Laporan Lain')).not.toBeInTheDocument();

    // Explicit navigation prompt must be displayed
    expect(screen.getByText(/Sesi Berpindah ke Laporan Lain/i)).toBeInTheDocument();
    const explicitNavButton = screen.getByRole('button', {
      name: /Buka Laporan Terkait \(rep-002\)/i,
    });
    expect(explicitNavButton).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Kembali ke Cek Laporan/i })
    ).toBeInTheDocument();

    // Now test that Report B is loaded ONLY upon explicit user click
    const mockDetailB: ReporterReportDetail = {
      ...mockDetail,
      report: {
        ...mockDetail.report,
        id: 'rep-002',
        reference_number: 'REP-20260925-99999',
        title: 'AC Ruang Kuliah Rusak',
      },
    };
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(mockDetailB);

    fireEvent.click(explicitNavButton);

    await waitFor(() => {
      expect(screen.getByText('AC Ruang Kuliah Rusak')).toBeInTheDocument();
      expect(screen.getByText('REP-20260925-99999')).toBeInTheDocument();
    });
  });

  it('clears displayed confidential detail and presents explicit navigation prompt if refresh detects ambient cookie belongs to another report B', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValueOnce(mockDetail);

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
    });

    // Simulate backend cookie having changed to rep-002 (e.g. in another tab or reauth)
    const mockDetailB: ReporterReportDetail = {
      ...mockDetail,
      report: {
        ...mockDetail.report,
        id: 'rep-002',
        reference_number: 'REP-20260925-99999',
        title: 'AC Ruang Kuliah Rusak',
      },
    };
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(mockDetailB);

    // User triggers refresh on Report A
    const refreshBtn = screen.getByRole('button', { name: /Muat Ulang Data Laporan/i });
    fireEvent.click(refreshBtn);

    // Display of Report A must be cleared, Report B must NOT be shown automatically
    await waitFor(() => {
      expect(screen.queryByText('Lampu Jalan Dekat Rektorat Rusak')).not.toBeInTheDocument();
      expect(screen.queryByText('AC Ruang Kuliah Rusak')).not.toBeInTheDocument();
      expect(screen.getByText(/Sesi Berpindah ke Laporan Lain/i)).toBeInTheDocument();
    });
  });

  it('discards older slow loadDetail response and does not overwrite newer report or trigger mismatch', async () => {
    function createDeferred<T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }

    const deferred1 = createDeferred<ReporterReportDetail>();
    const deferred2 = createDeferred<ReporterReportDetail>();

    const getDetailSpy = vi.spyOn(apiClient, 'getReporterReportDetail');
    // First load on mount resolves normally
    getDetailSpy.mockResolvedValueOnce(mockDetail);

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /Muat Ulang Data Laporan/i });

    // Next two calls will use deferred promises
    getDetailSpy.mockReturnValueOnce(deferred1.promise);
    // User clicks refresh (triggers request 1 - slow)
    fireEvent.click(refreshBtn);

    getDetailSpy.mockReturnValueOnce(deferred2.promise);
    // User clicks refresh again (triggers request 2 - fast)
    fireEvent.click(refreshBtn);

    // Request 2 resolves first with updated report
    const mockDetailFresh: ReporterReportDetail = {
      ...mockDetail,
      report: {
        ...mockDetail.report,
        title: 'Judul Terbaru Versi 2',
      },
    };

    deferred2.resolve(mockDetailFresh);

    await waitFor(() => {
      expect(screen.getByText('Judul Terbaru Versi 2')).toBeInTheDocument();
    });

    // Request 1 now resolves LATER with older title
    deferred1.resolve(mockDetail);

    // Verify older response was discarded: title remains 'Judul Terbaru Versi 2'
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText('Judul Terbaru Versi 2')).toBeInTheDocument();
    expect(screen.queryByText('Sesi Berpindah ke Laporan Lain')).not.toBeInTheDocument();
  });

  it('ignores in-flight loadDetail results after component unmounts', async () => {
    function createDeferred<T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }

    const deferred = createDeferred<ReporterReportDetail>();
    vi.spyOn(apiClient, 'getReporterReportDetail').mockReturnValueOnce(deferred.promise);

    const { unmount } = render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    // Unmount while request is in-flight
    unmount();

    // Resolving after unmount must not throw or update state
    deferred.resolve(mockDetail);
    await new Promise((r) => setTimeout(r, 50));
  });

  it('does not show full-screen spinner or unmount ReportConversation during background refresh/message send', async () => {
    let getDetailCallCount = 0;
    vi.spyOn(apiClient, 'getReporterReportDetail').mockImplementation(async () => {
      getDetailCallCount++;
      return mockDetail;
    });

    vi.spyOn(apiClient, 'postReporterMessage').mockResolvedValue({
      id: 'msg-sent',
      report_id: 'rep-001',
      sender_type: 'PELAPOR',
      visibility: 'PUBLIC_TO_REPORTER',
      message: 'Pertanyaan baru dari pelapor',
      created_at: '2026-09-25T12:00:00Z',
    });

    function InitializedDetailView() {
      const { setSession } = useReporterSession();
      React.useEffect(() => {
        setSession({
          report_id: 'rep-001',
          session_token: 'sess-001',
          csrf_token: 'csrf-001',
          expires_at: '2026-09-25T15:00:00Z',
        });
      }, [setSession]);

      return <ReportDetailView />;
    }

    render(
      <ReporterSessionProvider>
        <InitializedDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
      expect(screen.getByText(/Otorisasi Mutasi Aktif/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Tuliskan pesan tanggapan atau informasi tambahan/i);
    const sendButton = screen.getByRole('button', { name: /Kirim Balasan/i });

    fireEvent.change(textarea, { target: { value: 'Pertanyaan baru dari pelapor' } });
    fireEvent.click(sendButton);

    // Message sent, onMessageSent triggers loadDetail
    await waitFor(() => {
      expect(apiClient.postReporterMessage).toHaveBeenCalled();
      expect(getDetailCallCount).toBeGreaterThanOrEqual(2);
    });

    // During and after background refresh, full-screen loading spinner must NOT appear
    expect(screen.queryByText('Memuat Data Laporan...')).not.toBeInTheDocument();

    // ReportConversation and its input container must remain continuously mounted
    expect(screen.getByText(/Percakapan Terbuka dengan Tim Pengelola/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Tuliskan pesan tanggapan atau informasi tambahan/i)
    ).toBeInTheDocument();
  });

  it('activates pendingSession into context when user explicitly navigates to report B, enabling mutation without second code entry', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(mockDetail);
    vi.spyOn(apiClient, 'checkAccessCode').mockResolvedValue({
      report_id: 'rep-002',
      session_token: 'sess-002',
      csrf_token: 'csrf-002',
      expires_at: '2026-09-25T15:00:00Z',
    });

    let currentContextState: ReturnType<typeof useReporterSession> | undefined;
    function ContextWatcher() {
      currentContextState = useReporterSession();
      return null;
    }

    render(
      <ReporterSessionProvider>
        <ContextWatcher />
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
    });

    // Enter secret code for report rep-002 in reauth form
    const codeInput = screen.getByLabelText(/Kode Akses Rahasia/i);
    const reauthButton = screen.getByRole('button', { name: /Aktifkan Formulir Balasan/i });
    fireEvent.change(codeInput, { target: { value: 'SECRET-CODE-FOR-REPORT-002' } });
    fireEvent.click(reauthButton);

    // Mismatch banner displayed, Report A wiped, Report B NOT yet shown
    await waitFor(() => {
      expect(screen.getByText(/Sesi Berpindah ke Laporan Lain/i)).toBeInTheDocument();
    });

    // Context tokens must NOT be active yet for rep-002 before explicit click
    expect(currentContextState?.reportId).toBeNull();
    expect(currentContextState?.hasMutationCapability).toBe(false);

    // Prepare mock detail for rep-002
    const mockDetailB: ReporterReportDetail = {
      ...mockDetail,
      report: {
        ...mockDetail.report,
        id: 'rep-002',
        reference_number: 'REP-20260925-99999',
        title: 'AC Ruang Kuliah Rusak',
      },
    };
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(mockDetailB);

    // Explicit user click to navigate to new report
    const explicitNavButton = screen.getByRole('button', {
      name: /Buka Laporan Terkait \(rep-002\)/i,
    });
    fireEvent.click(explicitNavButton);

    // Now Report B is shown
    await waitFor(() => {
      expect(screen.getByText('AC Ruang Kuliah Rusak')).toBeInTheDocument();
    });

    // AND crucially, sessionToken & csrfToken are active in context for rep-002!
    expect(currentContextState?.reportId).toBe('rep-002');
    expect(currentContextState?.sessionToken).toBe('sess-002');
    expect(currentContextState?.csrfToken).toBe('csrf-002');
    expect(currentContextState?.hasMutationCapability).toBe(true);

    // Mutation form in ReportConversation for rep-002 should be immediately active (no second code entry!)
    expect(screen.getByText(/Otorisasi Mutasi Aktif/i)).toBeInTheDocument();
  });

  it('resets ReportConversation state when report id changes via key prop', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(mockDetail);

    function InitializedDetailView({ currentId }: { currentId: string }) {
      const { setSession } = useReporterSession();
      React.useEffect(() => {
        setSession({
          report_id: currentId,
          session_token: `sess-${currentId}`,
          csrf_token: `csrf-${currentId}`,
          expires_at: '2026-09-25T15:00:00Z',
        });
      }, [setSession, currentId]);

      return <ReportDetailView />;
    }

    const { rerender } = render(
      <ReporterSessionProvider>
        <InitializedDetailView currentId="rep-001" />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
      expect(screen.getByText(/Otorisasi Mutasi Aktif/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Tuliskan pesan tanggapan atau informasi tambahan/i);
    fireEvent.change(textarea, { target: { value: 'Pesan belum dikirim di rep-001' } });
    expect(textarea).toHaveValue('Pesan belum dikirim di rep-001');

    // Simulate switching to report rep-002
    const mockDetail2: ReporterReportDetail = {
      ...mockDetail,
      report: {
        ...mockDetail.report,
        id: 'rep-002',
        title: 'AC Rusak di R201',
      },
    };
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(mockDetail2);

    rerender(
      <ReporterSessionProvider>
        <InitializedDetailView currentId="rep-002" />
      </ReporterSessionProvider>
    );

    // Cross-report mismatch prompt appears because active report was rep-001
    await waitFor(() => {
      expect(screen.getByText(/Sesi Berpindah ke Laporan Lain/i)).toBeInTheDocument();
    });

    // Explicit user click navigates to rep-002
    const navBtn = screen.getByRole('button', { name: /Buka Laporan Terkait \(rep-002\)/i });
    fireEvent.click(navBtn);

    await waitFor(() => {
      expect(screen.getByText('AC Rusak di R201')).toBeInTheDocument();
    });

    // key={report.id} on ReportConversation remounts component with fresh initial state
    const freshTextarea = screen.getByPlaceholderText(/Tuliskan pesan tanggapan atau informasi tambahan/i);
    expect(freshTextarea).toHaveValue('');
  });

  it('moves focus to the session-switch heading when a cross-report mismatch replaces the detail', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValueOnce(mockDetail);

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
    });

    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue({
      ...mockDetail,
      report: { ...mockDetail.report, id: 'rep-002' },
    });
    const refreshBtn = screen.getByRole('button', { name: /Muat Ulang Data Laporan/i });
    refreshBtn.focus();
    fireEvent.click(refreshBtn);

    // The focused refresh button is unmounted with the detail; focus must not fall back to <body>.
    const heading = await screen.findByRole('heading', { name: /Sesi Berpindah ke Laporan Lain/i });
    await waitFor(() => {
      expect(document.activeElement).toBe(heading);
    });
    expect(heading).toHaveAttribute('tabindex', '-1');
  });

  it('renders attachments list with filename, formatted size, and content type', async () => {
    const detailWithAttachments: ReporterReportDetail = {
      ...mockDetail,
      attachments: [
        {
          id: 'att-001',
          filename: 'lampiran-1.jpg',
          original_filename: 'foto-kerusakan.jpg',
          file_size_bytes: 204800,
          size_bytes: 204800,
          content_type: 'image/jpeg',
          mime_type: 'image/jpeg',
          created_at: '2026-09-25T10:05:00Z',
        },
        {
          id: 'att-002',
          filename: 'dokumen.pdf',
          original_filename: 'bukti-kronologi.pdf',
          file_size_bytes: 1048576,
          size_bytes: 1048576,
          content_type: 'application/pdf',
          mime_type: 'application/pdf',
          created_at: '2026-09-25T10:06:00Z',
        },
      ],
    };
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(detailWithAttachments);

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Berkas Lampiran \(2\)/i)).toBeInTheDocument();
      expect(screen.getByText('foto-kerusakan.jpg')).toBeInTheDocument();
      expect(screen.getByText(/200.0 KB • image\/jpeg/i)).toBeInTheDocument();
      expect(screen.getByText('bukti-kronologi.pdf')).toBeInTheDocument();
      expect(screen.getByText(/1.0 MB • application\/pdf/i)).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByRole('button', { name: /Unduh berkas/i });
    expect(downloadButtons).toHaveLength(2);
  });

  it('downloads attachment using in-memory session header and revokes object URL', async () => {
    const detailWithAttachment: ReporterReportDetail = {
      ...mockDetail,
      attachments: [
        {
          id: 'att-001',
          filename: 'lampiran.pdf',
          original_filename: 'surat-pernyataan.pdf',
          file_size_bytes: 1024,
          size_bytes: 1024,
          content_type: 'application/pdf',
          mime_type: 'application/pdf',
          created_at: '2026-09-25T10:05:00Z',
        },
      ],
    };
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(detailWithAttachment);

    const mockBlob = new Blob(['sample-content'], { type: 'application/pdf' });
    const downloadSpy = vi.spyOn(apiClient, 'downloadReporterAttachment').mockResolvedValue({
      blob: mockBlob,
      filename: 'surat-pernyataan.pdf',
      contentType: 'application/pdf',
    });

    const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/mock-uuid');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;
    const anchorClickMock = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    function InitializedProvider() {
      const { setSession } = useReporterSession();
      React.useEffect(() => {
        setSession({
          report_id: 'rep-001',
          session_token: 'valid-session-token',
          csrf_token: 'valid-csrf',
          expires_at: '2026-09-25T15:00:00Z',
        });
      }, [setSession]);
      return <ReportDetailView />;
    }

    render(
      <ReporterSessionProvider>
        <InitializedProvider />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('surat-pernyataan.pdf')).toBeInTheDocument();
    });

    const downloadBtn = screen.getByRole('button', { name: /Unduh berkas surat-pernyataan.pdf/i });
    fireEvent.click(downloadBtn);

    await waitFor(
      () => {
        expect(downloadSpy).toHaveBeenCalledWith('att-001', 'valid-session-token', expect.any(AbortSignal));
        expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);
        expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:http://localhost/mock-uuid');
      },
      { timeout: 2500 }
    );
  });

  it('displays visible download error when download attachment fails', async () => {
    const detailWithAttachment: ReporterReportDetail = {
      ...mockDetail,
      attachments: [
        {
          id: 'att-fail',
          filename: 'corrupt.jpg',
          original_filename: 'corrupt.jpg',
          file_size_bytes: 500,
          size_bytes: 500,
          content_type: 'image/jpeg',
          mime_type: 'image/jpeg',
          created_at: '2026-09-25T10:05:00Z',
        },
      ],
    };
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(detailWithAttachment);
    vi.spyOn(apiClient, 'downloadReporterAttachment').mockRejectedValue(
      new Error('Berkas tidak ditemukan pada penyimpanan')
    );

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('corrupt.jpg')).toBeInTheDocument();
    });

    const downloadBtn = screen.getByRole('button', { name: /Unduh berkas corrupt.jpg/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(
        'Gagal mengunduh berkas "corrupt.jpg": Berkas tidak ditemukan pada penyimpanan'
      );
    });
  });

  it('disables all attachment buttons while a download is active and synchronously ignores duplicate clicks', async () => {
    const detailWithTwoAttachments: ReporterReportDetail = {
      ...mockDetail,
      attachments: [
        {
          id: 'att-1',
          filename: 'file1.pdf',
          original_filename: 'file1.pdf',
          file_size_bytes: 1024,
          size_bytes: 1024,
          content_type: 'application/pdf',
          mime_type: 'application/pdf',
          created_at: '2026-09-25T10:05:00Z',
        },
        {
          id: 'att-2',
          filename: 'file2.jpg',
          original_filename: 'file2.jpg',
          file_size_bytes: 2048,
          size_bytes: 2048,
          content_type: 'image/jpeg',
          mime_type: 'image/jpeg',
          created_at: '2026-09-25T10:06:00Z',
        },
      ],
    };
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(detailWithTwoAttachments);

    function createDeferred<T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }

    const downloadDeferred = createDeferred<{ blob: Blob; filename?: string; contentType?: string }>();
    const downloadSpy = vi.spyOn(apiClient, 'downloadReporterAttachment').mockReturnValue(downloadDeferred.promise);

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('file1.pdf')).toBeInTheDocument();
      expect(screen.getByText('file2.jpg')).toBeInTheDocument();
    });

    const btn1 = screen.getByRole('button', { name: /Unduh berkas file1.pdf/i });
    const btn2 = screen.getByRole('button', { name: /Unduh berkas file2.jpg/i });

    // Initial state: both enabled
    expect(btn1).toBeEnabled();
    expect(btn2).toBeEnabled();

    const anchorClickMock = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    // Click btn1 to start download
    fireEvent.click(btn1);

    // Synchronous duplicate click on btn1 and click on btn2 while in-flight
    fireEvent.click(btn1);
    fireEvent.click(btn2);

    // downloadSpy must only have been called ONCE for att-1
    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(downloadSpy).toHaveBeenCalledWith('att-1', null, expect.any(AbortSignal));

    // Both buttons must be disabled while downloading
    expect(btn1).toBeDisabled();
    expect(btn2).toBeDisabled();
    expect(btn1).toHaveTextContent('Mengunduh...');
    expect(btn2).toHaveTextContent('Unduh');

    // Resolve the deferred download
    await act(async () => {
      downloadDeferred.resolve({
        blob: new Blob(['content']),
        filename: 'file1.pdf',
      });
    });

    // Both buttons should become enabled again
    await waitFor(() => {
      expect(btn1).toBeEnabled();
      expect(btn2).toBeEnabled();
      expect(btn1).toHaveTextContent('Unduh');
    });
  });

  it('aborts fetch and suppresses anchor click when unmounting while download is in-flight', async () => {
    const detailWithAttachment: ReporterReportDetail = {
      ...mockDetail,
      attachments: [
        {
          id: 'att-unmount',
          filename: 'unmount.pdf',
          original_filename: 'unmount.pdf',
          file_size_bytes: 1024,
          size_bytes: 1024,
          content_type: 'application/pdf',
          mime_type: 'application/pdf',
          created_at: '2026-09-25T10:05:00Z',
        },
      ],
    };
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(detailWithAttachment);

    let capturedSignal: AbortSignal | undefined;
    function createDeferred<T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }

    const downloadDeferred = createDeferred<{ blob: Blob; filename?: string; contentType?: string }>();
    vi.spyOn(apiClient, 'downloadReporterAttachment').mockImplementation(async (_id, _token, signal) => {
      capturedSignal = signal;
      return downloadDeferred.promise;
    });

    const anchorClickMock = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const { unmount } = render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('unmount.pdf')).toBeInTheDocument();
    });

    const btn = screen.getByRole('button', { name: /Unduh berkas unmount.pdf/i });
    fireEvent.click(btn);

    expect(capturedSignal).toBeDefined();
    expect(capturedSignal?.aborted).toBe(false);

    // Unmount component while download is still in-flight
    unmount();

    // Signal must have been aborted
    expect(capturedSignal?.aborted).toBe(true);

    // Resolving download after unmount must NOT trigger anchor click
    downloadDeferred.resolve({
      blob: new Blob(['content']),
      filename: 'unmount.pdf',
    });
    await new Promise((r) => setTimeout(r, 50));

    expect(anchorClickMock).not.toHaveBeenCalled();
    anchorClickMock.mockRestore();
  });

  it('discards downloaded bytes and does not trigger anchor click if report identity switches during download', async () => {
    const detailReportA: ReporterReportDetail = {
      ...mockDetail,
      report: {
        ...mockDetail.report,
        id: 'rep-A',
      },
      attachments: [
        {
          id: 'att-A',
          filename: 'report-a-secret.pdf',
          original_filename: 'report-a-secret.pdf',
          file_size_bytes: 1024,
          size_bytes: 1024,
          content_type: 'application/pdf',
          mime_type: 'application/pdf',
          created_at: '2026-09-25T10:05:00Z',
        },
      ],
    };
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(detailReportA);

    function createDeferred<T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: unknown) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }

    const downloadDeferred = createDeferred<{ blob: Blob; filename?: string; contentType?: string }>();
    vi.spyOn(apiClient, 'downloadReporterAttachment').mockReturnValue(downloadDeferred.promise);
    const anchorClickMock = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    let setContextSession!: (session: any) => void;
    function SwitchingHarness() {
      const { setSession } = useReporterSession();
      setContextSession = setSession;
      return <ReportDetailView />;
    }

    render(
      <ReporterSessionProvider>
        <SwitchingHarness />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('report-a-secret.pdf')).toBeInTheDocument();
    });

    const btn = screen.getByRole('button', { name: /Unduh berkas report-a-secret.pdf/i });
    fireEvent.click(btn);

    // Context switches to another report B while download of report A is in-flight
    act(() => {
      setContextSession({
        report_id: 'rep-B',
        session_token: 'token-rep-b',
        csrf_token: 'csrf-b',
        expires_at: '2026-09-25T18:00:00Z',
      });
    });

    // Download for report A finishes LATER
    await act(async () => {
      downloadDeferred.resolve({
        blob: new Blob(['sensitive old report bytes']),
        filename: 'report-a-secret.pdf',
      });
    });

    // Anchor click must NOT be executed because report identity/session switched
    expect(anchorClickMock).not.toHaveBeenCalled();
    anchorClickMock.mockRestore();
  });

  it('clears detail and displays error when loadDetail encounters 401 even if detail was already loaded', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail')
      .mockResolvedValueOnce(mockDetail)
      .mockRejectedValueOnce(
        new apiClient.ReportApiError('UNAUTHORIZED', 'Sesi laporan tidak valid atau kedaluwarsa', 401)
      );

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
    });

    // User triggers refresh; backend returns 401
    const refreshBtn = screen.getByRole('button', { name: /Muat Ulang Data Laporan/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(screen.queryByText('Lampu Jalan Dekat Rektorat Rusak')).not.toBeInTheDocument();
      expect(screen.getByText('Sesi laporan tidak valid atau kedaluwarsa')).toBeInTheDocument();
    });
  });

  it('clears detail when demo-database-reset event is dispatched', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(mockDetail);

    render(
      <ReporterSessionProvider>
        <ReportDetailView />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
    });

    act(() => {
      window.dispatchEvent(new Event('demo-database-reset'));
    });

    await waitFor(() => {
      expect(screen.queryByText('Lampu Jalan Dekat Rektorat Rusak')).not.toBeInTheDocument();
      expect(screen.getByText('Sesi laporan telah diatur ulang atau kedaluwarsa')).toBeInTheDocument();
    });
  });

  it('clears detail when portal-guest-prototype-reset message is received across tabs', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail').mockResolvedValue(mockDetail);

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
          <ReportDetailView />
        </ReporterSessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
      });

      act(() => {
        const sender = new MockBroadcastChannel('portal-guest-prototype-reset');
        sender.postMessage({ timestamp: Date.now() });
      });

      await waitFor(() => {
        expect(screen.queryByText('Lampu Jalan Dekat Rektorat Rusak')).not.toBeInTheDocument();
        expect(screen.getByText('Sesi laporan telah diatur ulang atau kedaluwarsa')).toBeInTheDocument();
      });
    } finally {
      globalThis.BroadcastChannel = OriginalBroadcastChannel;
    }
  });

  it('clears detail when session drops to null', async () => {
    vi.spyOn(apiClient, 'getReporterReportDetail').mockImplementation(async (token) => {
      if (!token) {
        throw new apiClient.ReportApiError(
          'UNAUTHORIZED',
          'Sesi laporan tidak valid atau kedaluwarsa',
          401
        );
      }
      return mockDetail;
    });

    let setContextSession!: (session: any) => void;
    let dropSession!: () => void;
    function SessionDropHarness() {
      const { setSession, clearLocalSession } = useReporterSession();
      setContextSession = setSession;
      dropSession = clearLocalSession;
      return <ReportDetailView />;
    }

    render(
      <ReporterSessionProvider>
        <SessionDropHarness />
      </ReporterSessionProvider>
    );

    act(() => {
      setContextSession({
        report_id: 'rep-001',
        session_token: 'token-active-123',
        csrf_token: 'csrf-123',
        expires_at: '2026-10-02T18:00:00Z',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Lampu Jalan Dekat Rektorat Rusak')).toBeInTheDocument();
    });

    act(() => {
      dropSession();
    });

    await waitFor(() => {
      expect(screen.queryByText('Lampu Jalan Dekat Rektorat Rusak')).not.toBeInTheDocument();
      expect(screen.getByText('Sesi laporan tidak valid atau kedaluwarsa')).toBeInTheDocument();
    });
  });
});
