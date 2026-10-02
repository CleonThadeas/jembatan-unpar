import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ReportConversation } from '@/components/report/ReportConversation';
import { ReporterSessionProvider, useReporterSession } from '@/context/ReporterSessionContext';
import * as apiClient from '@/lib/api-client';
import { ReportMessage } from '@/types/report';

describe('ReportConversation Component (portal-guest)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockMessages: ReportMessage[] = [
    {
      id: 'msg-1',
      report_id: 'rep-1',
      sender_type: 'PELAPOR',
      visibility: 'PUBLIC_TO_REPORTER',
      message: 'Permisi, apakah ada update untuk pengaduan ini?',
      created_at: '2026-09-25T08:00:00Z',
    },
    {
      id: 'msg-2',
      report_id: 'rep-1',
      sender_type: 'ADMIN',
      admin_name: 'Biro Kemahasiswaan',
      visibility: 'PUBLIC_TO_REPORTER',
      message: 'Halo, tim teknis sedang melakukan pengecekan ke lokasi.',
      created_at: '2026-09-25T09:00:00Z',
    },
  ];

  it('renders messages with correct sender indicators', () => {
    render(
      <ReporterSessionProvider>
        <ReportConversation
          reportId="rep-1"
          status="DIPROSES"
          initialMessages={mockMessages}
        />
      </ReporterSessionProvider>
    );

    expect(screen.getByText('Anda (Pelapor)')).toBeInTheDocument();
    expect(screen.getByText('Biro Kemahasiswaan')).toBeInTheDocument();
    expect(screen.getByText('Permisi, apakah ada update untuk pengaduan ini?')).toBeInTheDocument();
    expect(screen.getByText('Halo, tim teknis sedang melakukan pengecekan ke lokasi.')).toBeInTheDocument();
  });

  it('locks conversation and hides reply form when report status is SELESAI', () => {
    render(
      <ReporterSessionProvider>
        <ReportConversation
          reportId="rep-1"
          status="SELESAI"
          initialMessages={mockMessages}
        />
      </ReporterSessionProvider>
    );

    expect(screen.getByText(/Laporan ini telah berstatus/i)).toBeInTheDocument();
    expect(screen.getByText('SELESAI')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Tuliskan pesan tanggapan/i)).not.toBeInTheDocument();
  });

  it('prompts for secret access code when page reloads (!hasMutationCapability)', () => {
    render(
      <ReporterSessionProvider>
        <ReportConversation
          reportId="rep-1"
          status="DIPROSES"
          initialMessages={mockMessages}
        />
      </ReporterSessionProvider>
    );

    expect(
      screen.getByText(/Otorisasi Balasan Baru Diperlukan \(Keamanan Memori\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Masukkan Kode Akses Rahasia...')
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Tuliskan pesan tanggapan/i)).not.toBeInTheDocument();
  });

  it('restores mutation form after entering secret access code', async () => {
    vi.spyOn(apiClient, 'checkAccessCode').mockResolvedValue({
      report_id: 'rep-1',
      session_token: 'sess-restored',
      csrf_token: 'csrf-restored',
      expires_at: '2026-09-25T15:00:00Z',
    });

    render(
      <ReporterSessionProvider>
        <ReportConversation
          reportId="rep-1"
          status="DIPROSES"
          initialMessages={mockMessages}
        />
      </ReporterSessionProvider>
    );

    const codeInput = screen.getByPlaceholderText('Masukkan Kode Akses Rahasia...');
    const reauthButton = screen.getByRole('button', { name: /Aktifkan Formulir Balasan/i });

    fireEvent.change(codeInput, { target: { value: 'REP-SECRET-CODE' } });
    fireEvent.click(reauthButton);

    await waitFor(() => {
      expect(screen.getByText(/Otorisasi Mutasi Aktif/i)).toBeInTheDocument();
    });

    expect(
      screen.getByPlaceholderText(/Tuliskan pesan tanggapan atau informasi tambahan/i)
    ).toBeInTheDocument();
  });

  it('allows sending message when mutation capability is active', async () => {
    vi.spyOn(apiClient, 'postReporterMessage').mockResolvedValue({
      id: 'msg-3',
      report_id: 'rep-1',
      sender_type: 'PELAPOR',
      visibility: 'PUBLIC_TO_REPORTER',
      message: 'Terima kasih atas tanggapannya.',
      created_at: '2026-09-25T10:00:00Z',
    });

    function InitializedConversation() {
      const { setSession } = useReporterSession();
      React.useEffect(() => {
        setSession({
          report_id: 'rep-1',
          session_token: 'sess-active',
          csrf_token: 'csrf-active',
          expires_at: '2026-09-25T15:00:00Z',
        });
      }, [setSession]);

      return (
        <ReportConversation
          reportId="rep-1"
          status="DIPROSES"
          initialMessages={mockMessages}
        />
      );
    }

    render(
      <ReporterSessionProvider>
        <InitializedConversation />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Otorisasi Mutasi Aktif/i)).toBeInTheDocument();
    });

    const messageInput = screen.getByPlaceholderText(
      /Tuliskan pesan tanggapan atau informasi tambahan/i
    );
    const sendButton = screen.getByRole('button', { name: /Kirim Balasan/i });

    fireEvent.change(messageInput, { target: { value: 'Terima kasih atas tanggapannya.' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Terima kasih atas tanggapannya.')).toBeInTheDocument();
    });

    expect(apiClient.postReporterMessage).toHaveBeenCalledWith(
      'Terima kasih atas tanggapannya.',
      'csrf-active',
      'sess-active',
      expect.any(String)
    );
  });

  it('synchronizes stale messages when initialMessages prop updates', async () => {
    const { rerender } = render(
      <ReporterSessionProvider>
        <ReportConversation
          reportId="rep-1"
          status="DIPROSES"
          initialMessages={mockMessages}
        />
      </ReporterSessionProvider>
    );

    expect(screen.getByText('Permisi, apakah ada update untuk pengaduan ini?')).toBeInTheDocument();
    expect(screen.queryByText('Pesan sinkronisasi terbaru dari server')).not.toBeInTheDocument();

    const updatedMessages: ReportMessage[] = [
      ...mockMessages,
      {
        id: 'msg-fresh-3',
        report_id: 'rep-1',
        sender_type: 'ADMIN',
        admin_name: 'Biro Kemahasiswaan',
        visibility: 'PUBLIC_TO_REPORTER',
        message: 'Pesan sinkronisasi terbaru dari server',
        created_at: '2026-09-25T11:00:00Z',
      },
    ];

    rerender(
      <ReporterSessionProvider>
        <ReportConversation
          reportId="rep-1"
          status="DIPROSES"
          initialMessages={updatedMessages}
        />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Pesan sinkronisasi terbaru dari server')).toBeInTheDocument();
    });
  });

  it('rejects mutation and displays clear mismatch error when reauthenticating with code for another report', async () => {
    // User is viewing Report A (rep-A), but enters secret code for Report B (rep-B)
    vi.spyOn(apiClient, 'checkAccessCode').mockResolvedValue({
      report_id: 'rep-B',
      session_token: 'sess-report-B',
      csrf_token: 'csrf-report-B',
      expires_at: '2026-09-25T15:00:00Z',
    });

    render(
      <ReporterSessionProvider>
        <ReportConversation
          reportId="rep-A"
          status="DIPROSES"
          initialMessages={mockMessages}
        />
      </ReporterSessionProvider>
    );

    const codeInput = screen.getByLabelText(/Kode Akses Rahasia/i);
    const reauthButton = screen.getByRole('button', { name: /Aktifkan Formulir Balasan/i });

    fireEvent.change(codeInput, { target: { value: 'SECRET-CODE-FOR-REPORT-B' } });
    fireEvent.click(reauthButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/Kode akses rahasia valid untuk laporan lain \(rep-B\), bukan laporan ini \(rep-A\)/i)
      ).toBeInTheDocument();
    });

    // Mutation form must NOT be unlocked for rep-A
    expect(screen.queryByPlaceholderText(/Tuliskan pesan tanggapan atau informasi tambahan/i)).not.toBeInTheDocument();
    // Misleading switch/clear controls are removed to avoid leaving cookie state or misleading navigation
    expect(screen.queryByRole('button', { name: /Beralih ke Laporan/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Batalkan & Bersihkan Sesi/i })).not.toBeInTheDocument();
  });

  it('provides accessible reauth input with label, id, aria-invalid, and aria-describedby', async () => {
    vi.spyOn(apiClient, 'checkAccessCode').mockRejectedValue(new Error('Kode akses tidak valid'));

    render(
      <ReporterSessionProvider>
        <ReportConversation
          reportId="rep-1"
          status="DIPROSES"
          initialMessages={mockMessages}
        />
      </ReporterSessionProvider>
    );

    const input = screen.getByLabelText(/Kode Akses Rahasia/i);
    expect(input).toHaveAttribute('id', 'reauth-access-code');
    expect(input).toHaveAttribute('aria-invalid', 'false');

    const reauthButton = screen.getByRole('button', { name: /Aktifkan Formulir Balasan/i });
    fireEvent.change(input, { target: { value: 'WRONG-CODE' } });
    fireEvent.click(reauthButton);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'reauth-error-desc');
      const errorMsg = screen.getByRole('alert');
      expect(errorMsg).toHaveAttribute('id', 'reauth-error-desc');
    });
  });

  it('provides accessible conversation scroll region with role="region", tabIndex={0}, and accessible name', () => {
    render(
      <ReporterSessionProvider>
        <ReportConversation
          reportId="rep-1"
          status="DIPROSES"
          initialMessages={mockMessages}
        />
      </ReporterSessionProvider>
    );

    const region = screen.getByRole('region', { name: /Riwayat pesan percakapan/i });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('tabIndex', '0');
  });

  it('rejects message sending if active session reportId does not match current conversation reportId', async () => {
    function MismatchedSessionConversation() {
      const { setSession } = useReporterSession();
      React.useEffect(() => {
        setSession({
          report_id: 'rep-B',
          session_token: 'sess-B',
          csrf_token: 'csrf-B',
          expires_at: '2026-09-25T15:00:00Z',
        });
      }, [setSession]);

      return (
        <ReportConversation
          reportId="rep-A"
          status="DIPROSES"
          initialMessages={mockMessages}
        />
      );
    }

    render(
      <ReporterSessionProvider>
        <MismatchedSessionConversation />
      </ReporterSessionProvider>
    );

    // Because session in memory is for rep-B while component is rep-A, canMutate is false
    expect(screen.queryByPlaceholderText(/Tuliskan pesan tanggapan atau informasi tambahan/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Otorisasi Balasan Baru Diperlukan/i)).toBeInTheDocument();
  });

  it('guards postReporterMessage and discards result if reportId changes during network transit', async () => {
    let resolvePost: ((val: ReportMessage) => void) | null = null;
    vi.spyOn(apiClient, 'postReporterMessage').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        })
    );

    const onMessageSent = vi.fn();

    function ActiveSessionConversation({ currentReportId }: { currentReportId: string }) {
      const { setSession } = useReporterSession();

      React.useEffect(() => {
        setSession({
          report_id: 'rep-1',
          session_token: 'sess-1',
          csrf_token: 'csrf-1',
          expires_at: '2026-09-25T15:00:00Z',
        });
      }, [setSession]);

      return (
        <ReportConversation
          reportId={currentReportId}
          status="DIPROSES"
          initialMessages={mockMessages}
          onMessageSent={onMessageSent}
        />
      );
    }

    const { rerender } = render(
      <ReporterSessionProvider>
        <ActiveSessionConversation currentReportId="rep-1" />
      </ReporterSessionProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Otorisasi Mutasi Aktif/i)).toBeInTheDocument();
    });

    const messageInput = screen.getByPlaceholderText(
      /Tuliskan pesan tanggapan atau informasi tambahan/i
    );
    fireEvent.change(messageInput, { target: { value: 'Pesan untuk rep-1' } });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Balasan/i }));

    // While postReporterMessage is pending, reportId changes to rep-2
    rerender(
      <ReporterSessionProvider>
        <ActiveSessionConversation currentReportId="rep-2" />
      </ReporterSessionProvider>
    );

    // Resolve the in-flight network promise for rep-1
    resolvePost!({
      id: 'msg-async-1',
      report_id: 'rep-1',
      sender_type: 'PELAPOR',
      visibility: 'PUBLIC_TO_REPORTER',
      message: 'Pesan untuk rep-1',
      created_at: '2026-09-25T12:00:00Z',
    });

    await waitFor(() => {
      // onMessageSent should NOT have been invoked because reportId changed during transit
      expect(onMessageSent).not.toHaveBeenCalled();
      expect(screen.queryByText('Pesan untuk rep-1')).not.toBeInTheDocument();
    });
  });

  it('notifies onSessionMismatch and wipes local tokens when reauthenticating with another report code', async () => {
    vi.spyOn(apiClient, 'checkAccessCode').mockResolvedValue({
      report_id: 'rep-B',
      session_token: 'sess-report-B',
      csrf_token: 'csrf-report-B',
      expires_at: '2026-09-25T15:00:00Z',
    });

    const onSessionMismatch = vi.fn();

    render(
      <ReporterSessionProvider>
        <ReportConversation
          reportId="rep-A"
          status="DIPROSES"
          initialMessages={mockMessages}
          onSessionMismatch={onSessionMismatch}
        />
      </ReporterSessionProvider>
    );

    const codeInput = screen.getByLabelText(/Kode Akses Rahasia/i);
    const reauthButton = screen.getByRole('button', { name: /Aktifkan Formulir Balasan/i });

    fireEvent.change(codeInput, { target: { value: 'SECRET-CODE-FOR-REPORT-B' } });
    fireEvent.click(reauthButton);

    await waitFor(() => {
      expect(onSessionMismatch).toHaveBeenCalledWith({
        targetReportId: 'rep-A',
        newReportId: 'rep-B',
        pendingSession: expect.objectContaining({
          report_id: 'rep-B',
          session_token: 'sess-report-B',
          csrf_token: 'csrf-report-B',
        }),
      });
    });

    // Mutation form must NOT be unlocked
    expect(screen.queryByPlaceholderText(/Tuliskan pesan tanggapan atau informasi tambahan/i)).not.toBeInTheDocument();
  });

  it('silently ignores SupersededError during reauthentication without displaying error alert', async () => {
    class MockSupersededError extends Error {
      constructor() {
        super('Permintaan autentikasi telah digantikan oleh permintaan yang lebih baru');
        this.name = 'SupersededError';
      }
    }

    vi.spyOn(apiClient, 'checkAccessCode').mockRejectedValue(new MockSupersededError());

    render(
      <ReporterSessionProvider>
        <ReportConversation
          reportId="rep-1"
          status="DIPROSES"
          initialMessages={mockMessages}
        />
      </ReporterSessionProvider>
    );

    const codeInput = screen.getByLabelText(/Kode Akses Rahasia/i);
    const reauthButton = screen.getByRole('button', { name: /Aktifkan Formulir Balasan/i });

    fireEvent.change(codeInput, { target: { value: 'OLD-ACCESS-CODE' } });
    fireEvent.click(reauthButton);

    // Give time for promise rejection to settle
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('strictly requires non-null sessionReportId matching reportId for mutation capability', async () => {
    function NullReportIdSessionConversation() {
      const { setSession, clearLocalSession } = useReporterSession();

      React.useEffect(() => {
        // Simulate an invalid/corrupted session state where tokens exist but reportId was cleared
        setSession({
          report_id: 'rep-1',
          session_token: 'sess-1',
          csrf_token: 'csrf-1',
          expires_at: '2026-09-25T15:00:00Z',
        });
        clearLocalSession();
      }, [setSession, clearLocalSession]);

      return (
        <ReportConversation
          reportId="rep-1"
          status="DIPROSES"
          initialMessages={mockMessages}
        />
      );
    }

    render(
      <ReporterSessionProvider>
        <NullReportIdSessionConversation />
      </ReporterSessionProvider>
    );

    // Because sessionReportId is null, mutation must be completely blocked
    expect(screen.queryByPlaceholderText(/Tuliskan pesan tanggapan atau informasi tambahan/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Otorisasi Balasan Baru Diperlukan \(Keamanan Memori\)/i)).toBeInTheDocument();
  });

  // The submit button is disabled while verifying, so a SupersededError can only come from a
  // request started elsewhere; the form must not stay stuck in its loading state.
  it('re-enables the reauthentication form after a superseded request', async () => {
    class MockSupersededError extends Error {
      constructor() {
        super('Permintaan autentikasi telah digantikan oleh permintaan yang lebih baru');
        this.name = 'SupersededError';
      }
    }
    const checkSpy = vi.spyOn(apiClient, 'checkAccessCode').mockRejectedValue(new MockSupersededError());

    render(
      <ReporterSessionProvider>
        <ReportConversation reportId="rep-1" status="DIPROSES" initialMessages={mockMessages} />
      </ReporterSessionProvider>
    );

    fireEvent.change(screen.getByLabelText(/Kode Akses Rahasia/i), { target: { value: 'OLD-ACCESS-CODE' } });
    fireEvent.click(screen.getByRole('button', { name: /Aktifkan Formulir Balasan/i }));

    await waitFor(() => expect(checkSpy).toHaveBeenCalled());
    // Let the rejected promise and its finally block settle before asserting.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.queryByRole('button', { name: /Memverifikasi/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aktifkan Formulir Balasan/i })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('announces successful reauthentication and moves focus to the reply textarea', async () => {
    vi.spyOn(apiClient, 'checkAccessCode').mockResolvedValue({
      report_id: 'rep-1',
      session_token: 'sess-restored',
      csrf_token: 'csrf-restored',
      expires_at: '2026-09-25T15:00:00Z',
    });

    render(
      <ReporterSessionProvider>
        <ReportConversation reportId="rep-1" status="DIPROSES" initialMessages={mockMessages} />
      </ReporterSessionProvider>
    );

    fireEvent.change(screen.getByLabelText(/Kode Akses Rahasia/i), { target: { value: 'VALID-CODE' } });
    fireEvent.click(screen.getByRole('button', { name: /Aktifkan Formulir Balasan/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(/Sesi mutasi berhasil diaktifkan kembali/i);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Tuliskan pesan tanggapan/i)).toHaveFocus();
    });
  });

  it('links a send failure to the reply textarea via aria-invalid and aria-describedby', async () => {
    vi.spyOn(apiClient, 'postReporterMessage').mockRejectedValue(new Error('Gagal mengirim'));

    function ActiveSessionConversation() {
      const { setSession } = useReporterSession();
      React.useEffect(() => {
        setSession({
          report_id: 'rep-1',
          session_token: 'sess-active',
          csrf_token: 'csrf-active',
          expires_at: '2026-09-25T15:00:00Z',
        });
      }, [setSession]);
      return <ReportConversation reportId="rep-1" status="DIPROSES" initialMessages={mockMessages} />;
    }

    render(
      <ReporterSessionProvider>
        <ActiveSessionConversation />
      </ReporterSessionProvider>
    );

    const textarea = await screen.findByPlaceholderText(/Tuliskan pesan tanggapan/i);
    fireEvent.change(textarea, { target: { value: 'Informasi tambahan' } });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Balasan/i }));

    await waitFor(() => {
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby', 'reply-error-desc');
    });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('id', 'reply-error-desc');
    expect(alert).toHaveTextContent('Gagal mengirim');
  });
});
