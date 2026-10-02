import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StepSuccessSecret } from '@/components/report/StepSuccessSecret';
import { ReporterSessionProvider } from '@/context/ReporterSessionContext';
import * as apiClient from '@/lib/api-client';

describe('StepSuccessSecret Component', () => {
  const mockResult = {
    report_id: 'rep-test-123',
    reference_number: 'REP-20260928-ABCD1',
    access_code: 'KODE-RAHASIA-XYZ-12345',
    created_at: '2026-09-28T10:00:00Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders success screen with reference number, access code, and security warning', () => {
    render(
      <ReporterSessionProvider>
        <StepSuccessSecret result={mockResult} onReset={vi.fn()} />
      </ReporterSessionProvider>
    );

    expect(screen.getByText('Laporan Berhasil Diterima')).toBeInTheDocument();
    expect(screen.getByText('REP-20260928-ABCD1')).toBeInTheDocument();
    expect(screen.getByText('KODE-RAHASIA-XYZ-12345')).toBeInTheDocument();
    expect(screen.getByText(/KODE AKSES RAHASIA \(DITAMPILKAN SATU KALI\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Peringatan Keamanan Kredensial Penting/i)).toBeInTheDocument();
  });

  it('copies secret access code to clipboard with polite screen reader feedback', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(
      <ReporterSessionProvider>
        <StepSuccessSecret result={mockResult} onReset={vi.fn()} />
      </ReporterSessionProvider>
    );

    const copyBtn = screen.getByRole('button', { name: /Salin Kode Rahasia/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('KODE-RAHASIA-XYZ-12345');
    await waitFor(() => {
      expect(screen.getByText('Kode Tersalin!')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/berhasil disalin/i);
    });
  });

  it('generates and downloads credential backup text file (.txt)', () => {
    const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/test-blob');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    let clickedDownloadAnchor: HTMLAnchorElement | null = null;
    const originalAppendChild = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLAnchorElement) {
        clickedDownloadAnchor = node;
      }
      return originalAppendChild(node);
    });

    render(
      <ReporterSessionProvider>
        <StepSuccessSecret result={mockResult} onReset={vi.fn()} />
      </ReporterSessionProvider>
    );

    const downloadBtn = screen.getByRole('button', { name: /Unduh Kredensial \(\.txt\)/i });
    fireEvent.click(downloadBtn);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickedDownloadAnchor).not.toBeNull();
    const anchor = clickedDownloadAnchor as HTMLAnchorElement | null;
    expect(anchor?.download).toBe('kredensial-laporan-REP-20260928-ABCD1.txt');
    expect(anchor?.href).toBe('blob:http://localhost/test-blob');
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:http://localhost/test-blob');
  });

  it('enforces mandatory acknowledgement checkbox before allowing direct report access', () => {
    render(
      <ReporterSessionProvider>
        <StepSuccessSecret result={mockResult} onReset={vi.fn()} />
      </ReporterSessionProvider>
    );

    const directAccessBtn = screen.getByRole('button', { name: /Langsung Pantau Laporan Ini/i });
    expect(directAccessBtn).toBeDisabled();

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(directAccessBtn).not.toBeDisabled();
  });

  it('attaches beforeunload listener when unacknowledged and removes it when acknowledged', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    render(
      <ReporterSessionProvider>
        <StepSuccessSecret result={mockResult} onReset={vi.fn()} />
      </ReporterSessionProvider>
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

    const beforeunloadHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'beforeunload'
    )?.[1] as ((e: BeforeUnloadEvent) => void) | undefined;
    expect(beforeunloadHandler).toBeDefined();

    // Trigger beforeunload handler
    const event = new Event('beforeunload') as BeforeUnloadEvent;
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    beforeunloadHandler?.(event);
    expect(preventDefaultSpy).toHaveBeenCalled();

    // Check the box
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // After acknowledgment, the beforeunload listener should be removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('opens direct report session when acknowledged and direct access button is clicked', async () => {
    vi.spyOn(apiClient, 'checkAccessCode').mockResolvedValue({
      session_token: 'session-token-xyz',
      report_id: 'rep-test-123',
      expires_at: '2026-09-28T12:00:00Z',
    });

    render(
      <ReporterSessionProvider>
        <StepSuccessSecret result={mockResult} onReset={vi.fn()} />
      </ReporterSessionProvider>
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const directAccessBtn = screen.getByRole('button', { name: /Langsung Pantau Laporan Ini/i });
    fireEvent.click(directAccessBtn);

    await waitFor(() => {
      expect(apiClient.checkAccessCode).toHaveBeenCalledWith('KODE-RAHASIA-XYZ-12345');
    });
  });

  it('calls onReset when clicking "Buat Laporan Baru Lainnya"', () => {
    const onResetMock = vi.fn();
    render(
      <ReporterSessionProvider>
        <StepSuccessSecret result={mockResult} onReset={onResetMock} />
      </ReporterSessionProvider>
    );

    const resetBtn = screen.getByRole('button', { name: /Buat Laporan Baru Lainnya/i });
    fireEvent.click(resetBtn);
    expect(onResetMock).toHaveBeenCalled();
  });

  it('renders replay security guidance without secret card or beforeunload lock when access_code is empty or whitespace', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    const replayResult = {
      report_id: 'rep-replay-456',
      reference_number: 'REP-20260928-REPLAY1',
      access_code: '   ',
      created_at: '2026-09-28T10:30:00Z',
    };

    render(
      <ReporterSessionProvider>
        <StepSuccessSecret result={replayResult} onReset={vi.fn()} />
      </ReporterSessionProvider>
    );

    // Heading reflects replayed submission
    expect(screen.getByText('Laporan Telah Tercatat Sebelumnya')).toBeInTheDocument();
    expect(
      screen.getByText(/Pengiriman ulang berhasil dideteksi/i)
    ).toBeInTheDocument();

    // Reference number is displayed
    expect(screen.getByText('REP-20260928-REPLAY1')).toBeInTheDocument();

    // Secret access card and download/copy buttons are NOT rendered
    expect(
      screen.queryByText(/KODE AKSES RAHASIA \(DITAMPILKAN SATU KALI\)/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Salin Kode Rahasia/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Unduh Kredensial/i })
    ).not.toBeInTheDocument();

    // Replay security guidance is presented with status role
    const replayNotice = screen.getByRole('status');
    expect(replayNotice).toBeInTheDocument();
    expect(
      screen.getByText(/Kode Akses Tidak Ditampilkan Ulang \(Kebijakan Keamanan\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Kode Akses Rahasia hanya dibuat dan ditampilkan satu kali/i)
    ).toBeInTheDocument();

    // Guidance links to recovery and status check with >= 48px hit targets
    const recoveryLink = screen.getByRole('link', { name: /Buka Pemulihan Kode Akses/i });
    expect(recoveryLink).toHaveAttribute('href', '/lapor/pemulihan');
    expect(recoveryLink).toHaveClass('min-h-[48px]');

    const checkStatusLink = screen.getByRole('link', { name: /Cek Status Laporan/i });
    expect(checkStatusLink).toHaveAttribute('href', '/lapor/cek-laporan');
    expect(checkStatusLink).toHaveClass('min-h-[48px]');

    // beforeunload listener must NOT be attached when access_code is empty
    expect(addEventListenerSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
});
