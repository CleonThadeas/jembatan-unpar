import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ReportRecoveryForm } from '@/components/report/ReportRecoveryForm';
import { ReporterSessionProvider } from '@/context/ReporterSessionContext';
import * as apiClient from '@/lib/api-client';
import { ReportApiError } from '@/lib/api-client';
import * as nextNavigation from 'next/navigation';

vi.mock('next/link', () => ({
  default: ({ children, href, prefetch, ...rest }: any) => (
    <a href={typeof href === 'string' ? href : href?.pathname} {...rest}>
      {children}
    </a>
  ),
}));

describe('ReportRecoveryForm Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders request recovery tab by default with Pemulihan Kode heading and min-h-48 readable inputs', () => {
    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Pemulihan Kode/i })).toBeInTheDocument();
    const emailInput = screen.getByLabelText(/Alamat Email Pelapor Terdaftar/i);
    const refInput = screen.getByLabelText(/Nomor Referensi Laporan/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.className).toMatch(/min-h-\[48px\]/);
    expect(refInput).toBeInTheDocument();
    expect(refInput.className).toMatch(/min-h-\[48px\]/);
    expect(screen.getByRole('button', { name: /Kirim Kode Pemulihan/i })).toBeInTheDocument();
  });

  it('renders collapsed OTP TTL short hint instead of bulky banner in confirm tab', () => {
    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    const confirmTabButton = screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i });
    fireEvent.click(confirmTabButton);

    // Collapsed TTL into short hint
    expect(screen.getByText(/10 menit/i)).toBeInTheDocument();
    expect(screen.queryByText(/Masa Berlaku Kode OTP: 10 Menit/i)).toBeNull();

    // Confirm tab inputs must also have min-h-[48px]
    const otpInput = screen.getByLabelText(/Kode OTP Pemulihan/i);
    expect(otpInput.className).toMatch(/min-h-\[48px\]/);
  });

  it('switches to confirm tab when clicking tab header', () => {
    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    const confirmTabButton = screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i });
    fireEvent.click(confirmTabButton);

    expect(screen.getByLabelText(/Kode OTP Pemulihan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i })).toBeInTheDocument();
  });

  it('submits recovery request and displays generic safe message', async () => {
    vi.spyOn(apiClient, 'requestCodeRecovery').mockResolvedValue({
      message: 'Token pemulihan telah dikirim jika data terdaftar.',
    });

    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    fireEvent.change(screen.getByLabelText(/Alamat Email Pelapor Terdaftar/i), {
      target: { value: 'mhs@univ.ac.id' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi Laporan/i), {
      target: { value: 'REP-20260925-00001' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode Pemulihan/i }));

    await waitFor(() => {
      expect(screen.getByText('Token pemulihan telah dikirim jika data terdaftar.')).toBeInTheDocument();
    });

    expect(apiClient.requestCodeRecovery).toHaveBeenCalledWith('mhs@univ.ac.id', 'REP-20260925-00001');
  });

  it('shows a generic confirmation when the recovery response has no message', async () => {
    vi.spyOn(apiClient, 'requestCodeRecovery').mockResolvedValue({ message: '' });

    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    fireEvent.change(screen.getByLabelText(/Alamat Email Pelapor Terdaftar/i), {
      target: { value: 'mhs@univ.ac.id' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi Laporan/i), {
      target: { value: 'REP-20260925-00001' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode Pemulihan/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Jika kombinasi email dan nomor referensi terdaftar, instruksi pemulihan telah dikirim ke email Anda.'
    );
  });

  it('never renders a secret even when an unexpected server field contains one', async () => {
    vi.spyOn(apiClient, 'confirmCodeRecovery').mockResolvedValue({
      message: 'Kode akses baru sedang diproses untuk dikirim ke email Anda',
      new_access_code: 'NEW-SECRET-CODE-XYZ',
    } as Awaited<ReturnType<typeof apiClient.confirmCodeRecovery>>);

    render(<ReporterSessionProvider><ReportRecoveryForm /></ReporterSessionProvider>);
    fireEvent.click(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i }));
    fireEvent.change(screen.getByLabelText(/Alamat Email \*/i), { target: { value: 'mhs@univ.ac.id' } });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi \*/i), { target: { value: 'REP-20260925-00001' } });
    fireEvent.change(screen.getByLabelText(/Kode OTP Pemulihan/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }));

    expect(await screen.findByText('Kode Akses Baru Sedang Dikirim ke Email Anda')).toBeInTheDocument();
    expect(screen.queryByText('NEW-SECRET-CODE-XYZ')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Salin|Langsung Buka Detail Laporan/i })).not.toBeInTheDocument();
  });

  it('does not claim the email was already delivered when the server message is empty', async () => {
    // The backend only queues the email in the outbox; delivery happens later.
    vi.spyOn(apiClient, 'confirmCodeRecovery').mockResolvedValue({ message: '' });
    render(<ReporterSessionProvider><ReportRecoveryForm /></ReporterSessionProvider>);
    fireEvent.click(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i }));
    fireEvent.change(screen.getByLabelText(/Alamat Email \*/i), { target: { value: 'mhs@univ.ac.id' } });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi \*/i), { target: { value: 'REP-20260925-00001' } });
    fireEvent.change(screen.getByLabelText(/Kode OTP Pemulihan/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }));

    const heading = await screen.findByRole('heading', { name: /Kode Akses Baru Sedang Dikirim/i });
    const panel = heading.closest('div.space-y-5');
    expect(panel).not.toBeNull();
    expect(panel?.textContent ?? '').not.toMatch(/telah dikirim|sudah dikirim|dikirimkan secara langsung/i);
    expect(screen.getByText(/sedang diproses untuk dikirim/i)).toBeInTheDocument();
  });

  it('blocks duplicate recovery requests while loading and during cooldown', async () => {
    let finishRequest: ((value: { message: string }) => void) | undefined;
    const requestSpy = vi.spyOn(apiClient, 'requestCodeRecovery').mockImplementation(() =>
      new Promise((resolve) => { finishRequest = resolve; })
    );
    render(<ReporterSessionProvider><ReportRecoveryForm /></ReporterSessionProvider>);
    fireEvent.change(screen.getByLabelText(/Alamat Email Pelapor Terdaftar/i), { target: { value: 'mhs@univ.ac.id' } });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi Laporan/i), { target: { value: 'REP-20260925-00001' } });
    const form = screen.getByRole('button', { name: /Kirim Kode Pemulihan/i }).closest('form');
    expect(form).not.toBeNull();
    if (!form) return;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(requestSpy).toHaveBeenCalledTimes(1);
    await act(async () => finishRequest?.({ message: 'Permintaan diterima.' }));
    fireEvent.submit(form);
    expect(requestSpy).toHaveBeenCalledTimes(1);
  });

  it('blocks duplicate OTP confirmation while the first request is pending', async () => {
    let finishConfirmation: ((value: { message: string }) => void) | undefined;
    const confirmSpy = vi.spyOn(apiClient, 'confirmCodeRecovery').mockImplementation(() =>
      new Promise((resolve) => { finishConfirmation = resolve; })
    );
    render(<ReporterSessionProvider><ReportRecoveryForm /></ReporterSessionProvider>);
    fireEvent.click(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i }));
    fireEvent.change(screen.getByLabelText(/Alamat Email \*/i), { target: { value: 'mhs@univ.ac.id' } });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi \*/i), { target: { value: 'REP-20260925-00001' } });
    fireEvent.change(screen.getByLabelText(/Kode OTP Pemulihan/i), { target: { value: '123456' } });
    const form = screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }).closest('form');
    expect(form).not.toBeNull();
    if (!form) return;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    await act(async () => finishConfirmation?.({ message: 'Kode akses dikirim.' }));
  });

  it('moves focus to the success heading after confirming recovery', async () => {
    vi.spyOn(apiClient, 'confirmCodeRecovery').mockResolvedValue({ message: 'Kode akses dikirim.' });
    render(<ReporterSessionProvider><ReportRecoveryForm /></ReporterSessionProvider>);
    fireEvent.click(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i }));
    fireEvent.change(screen.getByLabelText(/Alamat Email \*/i), { target: { value: 'mhs@univ.ac.id' } });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi \*/i), { target: { value: 'REP-20260925-00001' } });
    fireEvent.change(screen.getByLabelText(/Kode OTP Pemulihan/i), { target: { value: '123456' } });
    const submit = screen.getByRole('button', { name: /Konfirmasi Kode OTP/i });
    submit.focus();
    fireEvent.click(submit);
    expect(await screen.findByRole('heading', { name: /Kode Akses Baru Sedang Dikirim/i })).toHaveFocus();
  });

  it('renders tabs with proper WAI-ARIA tablist, tab, and tabpanel semantics', () => {
    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    const tabList = screen.getByRole('tablist', { name: /Metode Pemulihan Kode Akses/i });
    expect(tabList).toBeInTheDocument();

    const requestTab = screen.getByRole('tab', { name: /1\. Ajukan Permintaan Pemulihan/i });
    const confirmTab = screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i });

    expect(requestTab).toHaveAttribute('aria-selected', 'true');
    expect(requestTab).toHaveAttribute('tabIndex', '0');
    expect(requestTab).toHaveAttribute('aria-controls', 'panel-request');

    expect(confirmTab).toHaveAttribute('aria-selected', 'false');
    expect(confirmTab).toHaveAttribute('tabIndex', '-1');
    expect(confirmTab).toHaveAttribute('aria-controls', 'panel-confirm');

    const requestPanel = screen.getByRole('tabpanel', { name: /1\. Ajukan Permintaan Pemulihan/i });
    expect(requestPanel).toBeInTheDocument();
    expect(requestPanel).toHaveAttribute('id', 'panel-request');
  });

  it('supports keyboard navigation across recovery tabs (ArrowRight, ArrowLeft, Home, End)', () => {
    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    const requestTab = screen.getByRole('tab', { name: /1\. Ajukan Permintaan Pemulihan/i });
    const confirmTab = screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i });

    requestTab.focus();

    // ArrowRight switches to confirm tab
    fireEvent.keyDown(requestTab, { key: 'ArrowRight' });
    expect(confirmTab).toHaveAttribute('aria-selected', 'true');
    expect(requestTab).toHaveAttribute('aria-selected', 'false');

    // ArrowLeft switches back to request tab
    fireEvent.keyDown(confirmTab, { key: 'ArrowLeft' });
    expect(requestTab).toHaveAttribute('aria-selected', 'true');

    // End switches to confirm tab
    fireEvent.keyDown(requestTab, { key: 'End' });
    expect(confirmTab).toHaveAttribute('aria-selected', 'true');

    // Home switches to request tab
    fireEvent.keyDown(confirmTab, { key: 'Home' });
    expect(requestTab).toHaveAttribute('aria-selected', 'true');
  });

  it('associates form inputs with aria-invalid and aria-describedby pointing to role="alert"', async () => {
    vi.spyOn(apiClient, 'requestCodeRecovery').mockRejectedValue(
      new Error('Format email atau nomor referensi salah')
    );

    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    const emailInput = screen.getByLabelText(/Alamat Email Pelapor Terdaftar/i);
    const refInput = screen.getByLabelText(/Nomor Referensi Laporan/i);

    expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    expect(refInput).toHaveAttribute('aria-invalid', 'false');

    fireEvent.change(emailInput, { target: { value: 'invalid-format@univ.ac.id' } });
    fireEvent.change(refInput, { target: { value: 'REP-001' } });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode Pemulihan/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/Format email atau nomor referensi salah/i)
      ).toBeInTheDocument();
    });

    expect(emailInput).toHaveAttribute('aria-describedby', 'request-error-msg');
    expect(refInput).toHaveAttribute('aria-describedby', 'request-error-msg');
  });

  it('replaces URL with clean path without forwarding __NA in state when initialized with ?token=', async () => {
    const originalHistoryState = {
      __NA: true,
      __PRIVATE_NEXTJS_INTERNALS_TREE: ['root', 'lapor', 'pemulihan'],
      url: '/lapor/pemulihan?token=123456',
    };

    // Simulate Next.js having established routing state in window.history
    Object.defineProperty(window.history, 'state', {
      configurable: true,
      value: originalHistoryState,
      writable: true,
    });

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams('token=123456') as ReturnType<typeof nextNavigation.useSearchParams>
    );
    vi.spyOn(apiClient, 'confirmCodeRecovery').mockResolvedValue({
      message: 'Kode akses baru sedang diproses untuk dikirim ke email Anda',
    });

    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    expect(replaceStateSpy).toHaveBeenCalled();
    const [savedState, , savedUrl] = replaceStateSpy.mock.calls[0];

    // Must NOT forward a state containing __NA so Next's replaceState patch can re-inject state and sync router
    expect(savedState == null || savedState.__NA === undefined).toBe(true);

    // Strips token from the URL
    expect(savedUrl).not.toContain('123456');
    expect(savedUrl).not.toContain('token=');

    // Confirm tab is activated and token input is populated with captured token
    expect(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByLabelText(/Kode OTP Pemulihan/i)).toHaveValue('123456');

    // Token from the link does not bypass the required identity fields.
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }));
    expect(apiClient.confirmCodeRecovery).not.toHaveBeenCalled();
    expect(screen.getByText('Alamat email wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Nomor referensi wajib diisi.')).toBeInTheDocument();
  });

  it('captures token once and does not reset when searchParams updates to token-less', async () => {
    let currentParams = new URLSearchParams('token=654321');
    const searchParamsMock = vi.spyOn(nextNavigation, 'useSearchParams').mockImplementation(
      () => currentParams as ReturnType<typeof nextNavigation.useSearchParams>
    );
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    vi.spyOn(apiClient, 'confirmCodeRecovery').mockResolvedValue({
      message: 'Kode akses baru sedang diproses untuk dikirim ke email Anda',
    });

    const { rerender } = render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    expect(screen.getByLabelText(/Kode OTP Pemulihan/i)).toHaveValue('654321');
    expect(replaceStateSpy).toHaveBeenCalledTimes(1);

    // Now searchParams updates to empty (as happens after router syncs to clean URL)
    currentParams = new URLSearchParams('');
    searchParamsMock.mockReturnValue(currentParams as ReturnType<typeof nextNavigation.useSearchParams>);
    rerender(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    // Token must remain captured
    expect(screen.getByLabelText(/Kode OTP Pemulihan/i)).toHaveValue('654321');
    // replaceState should not be called again
    expect(replaceStateSpy).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText(/Alamat Email \*/i), { target: { value: 'mhs@univ.ac.id' } });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi \*/i), { target: { value: 'REP-20260925-00002' } });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }));
    await waitFor(() => {
      expect(apiClient.confirmCodeRecovery).toHaveBeenCalledWith({
        email: 'mhs@univ.ac.id', reference_number: 'REP-20260925-00002', code: '654321',
      });
    });
  });

  it('renders requestResult success container with role="status"', async () => {
    vi.spyOn(apiClient, 'requestCodeRecovery').mockResolvedValue({
      message: 'Instruksi pemulihan telah dikirim ke email Anda.',
    });

    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    fireEvent.change(screen.getByLabelText(/Alamat Email Pelapor Terdaftar/i), {
      target: { value: 'mhs@univ.ac.id' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi Laporan/i), {
      target: { value: 'REP-20260925-00001' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode Pemulihan/i }));

    await waitFor(() => {
      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveTextContent('Instruksi pemulihan telah dikirim ke email Anda.');
    });
  });

  it('moves focus to the recovery token input when clicking "Lanjut ke Langkah 2"', async () => {
    vi.spyOn(apiClient, 'requestCodeRecovery').mockResolvedValue({
      message: 'Instruksi pemulihan telah dikirim.',
    });

    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    fireEvent.change(screen.getByLabelText(/Alamat Email Pelapor Terdaftar/i), {
      target: { value: 'mhs@univ.ac.id' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi Laporan/i), {
      target: { value: 'REP-20260925-00001' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Kode Pemulihan/i }));

    const proceedBtn = await screen.findByRole('button', {
      name: /Lanjut ke Langkah 2: Masukkan Kode OTP/i,
    });
    fireEvent.click(proceedBtn);

    // Confirm tab is now active
    const confirmTab = screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i });
    expect(confirmTab).toHaveAttribute('aria-selected', 'true');

    // Focus has moved to #recovery-token input
    const tokenInput = screen.getByLabelText(/Kode OTP Pemulihan/i);
    expect(tokenInput).toHaveFocus();
  });

  it('ensures tabpanel elements provide a visible focus ring for keyboard accessibility', () => {
    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    const requestPanel = screen.getByRole('tabpanel', { name: /1\. Ajukan Permintaan Pemulihan/i });
    expect(requestPanel).toHaveAttribute('tabIndex', '0');

    // Must have a visible focus indicator class (e.g., focus:ring-2 or focus-visible:ring-2), not just focus:outline-none
    const requestClasses = requestPanel.className;
    expect(requestClasses).toMatch(/focus(-visible)?:ring-2/);
    expect(requestClasses).toMatch(/focus(-visible)?:ring-brand-500/);

    // Switch to confirm tab
    fireEvent.click(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i }));
    const confirmPanel = screen.getByRole('tabpanel', { name: /2\. Masukkan Kode OTP/i });
    expect(confirmPanel).toHaveAttribute('tabIndex', '0');
    const confirmClasses = confirmPanel.className;
    expect(confirmClasses).toMatch(/focus(-visible)?:ring-2/);
    expect(confirmClasses).toMatch(/focus(-visible)?:ring-brand-500/);
  });

  it('associates confirmation token input with aria-invalid and aria-describedby pointing to role="alert"', async () => {
    vi.spyOn(apiClient, 'confirmCodeRecovery').mockRejectedValue(
      new Error('Token pemulihan tidak valid atau telah kedaluwarsa')
    );

    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    fireEvent.click(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i }));

    const tokenInput = screen.getByLabelText(/Kode OTP Pemulihan/i);
    expect(tokenInput).toHaveAttribute('aria-invalid', 'false');

    fireEvent.change(screen.getByLabelText(/Alamat Email \*/i), { target: { value: 'mhs@univ.ac.id' } });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi \*/i), { target: { value: 'REP-20260925-00001' } });
    fireEvent.change(tokenInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/Token pemulihan tidak valid atau telah kedaluwarsa/i)
      ).toBeInTheDocument();
    });

    expect(tokenInput).toHaveAttribute('aria-invalid', 'true');
    expect(tokenInput).toHaveAttribute('aria-describedby', 'confirm-error-msg recovery-token-hint');
  });

  it('displays privacy-preserving confirmation card when backend returns only generic message (no new_access_code in HTTP response)', async () => {
    const pushMock = vi.fn();
    vi.spyOn(nextNavigation, 'useRouter').mockReturnValue({
      push: pushMock,
    } as unknown as ReturnType<typeof nextNavigation.useRouter>);

    vi.spyOn(apiClient, 'confirmCodeRecovery').mockResolvedValue({
      message: 'Kode akses baru telah dikirimkan ke email terdaftar Anda.',
    });

    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    fireEvent.click(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i }));
    fireEvent.change(screen.getByLabelText(/Alamat Email \*/i), { target: { value: 'mhs@univ.ac.id' } });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi \*/i), { target: { value: 'REP-20260925-00001' } });
    fireEvent.change(screen.getByLabelText(/Kode OTP Pemulihan/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }));

    await waitFor(() => {
      expect(screen.getByText('Kode Akses Baru Sedang Dikirim ke Email Anda')).toBeInTheDocument();
    });

    // Ensures secret code is NEVER rendered on screen in the privacy-preserving flow
    expect(screen.queryByText(/KODE AKSES RAHASIA BARU ANDA/i)).not.toBeInTheDocument();
    expect(screen.getByText(/tidak ditampilkan di layar/i)).toBeInTheDocument();

    const checkStatusBtn = screen.getByRole('button', { name: /Menuju Halaman Cek Status Laporan/i });
    fireEvent.click(checkStatusBtn);
    expect(pushMock).toHaveBeenCalledWith('/lapor/cek-laporan');
  });

  it('requires both identity fields and associates their errors with the inputs', () => {
    vi.spyOn(apiClient, 'confirmCodeRecovery');
    render(<ReporterSessionProvider><ReportRecoveryForm /></ReporterSessionProvider>);
    fireEvent.click(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i }));
    const email = screen.getByLabelText(/Alamat Email \*/i);
    const reference = screen.getByLabelText(/Nomor Referensi \*/i);
    expect(email).toBeRequired();
    expect(reference).toBeRequired();
    expect(email).toHaveAttribute('aria-invalid', 'false');
    expect(reference).toHaveAttribute('aria-invalid', 'false');
    fireEvent.change(screen.getByLabelText(/Kode OTP Pemulihan/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }));
    expect(apiClient.confirmCodeRecovery).not.toHaveBeenCalled();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAttribute('aria-describedby', 'confirm-email-error');
    expect(reference).toHaveAttribute('aria-invalid', 'true');
    expect(reference).toHaveAttribute('aria-describedby', 'confirm-ref-error');
    expect(screen.getByText('Alamat email wajib diisi.')).toHaveAttribute('id', 'confirm-email-error');
    expect(screen.getByText('Nomor referensi wajib diisi.')).toHaveAttribute('id', 'confirm-ref-error');
  });

  it('rejects a malformed email before confirming recovery', () => {
    vi.spyOn(apiClient, 'confirmCodeRecovery');
    render(<ReporterSessionProvider><ReportRecoveryForm /></ReporterSessionProvider>);
    fireEvent.click(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i }));
    const email = screen.getByLabelText(/Alamat Email \*/i);
    fireEvent.change(email, { target: { value: 'email-salah' } });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi \*/i), { target: { value: 'REP-001' } });
    fireEvent.change(screen.getByLabelText(/Kode OTP Pemulihan/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }));
    expect(apiClient.confirmCodeRecovery).not.toHaveBeenCalled();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Format alamat email tidak valid.')).toHaveAttribute('id', 'confirm-email-error');
  });

  it('accepts only a 6-digit recovery OTP and strips non-digits', async () => {
    vi.spyOn(apiClient, 'confirmCodeRecovery').mockResolvedValue({ message: 'Kode terkirim.' });
    render(<ReporterSessionProvider><ReportRecoveryForm /></ReporterSessionProvider>);
    fireEvent.click(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i }));
    fireEvent.change(screen.getByLabelText(/Alamat Email \*/i), { target: { value: 'mhs@univ.ac.id' } });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi \*/i), { target: { value: 'REP-001' } });
    const otp = screen.getByLabelText(/Kode OTP Pemulihan/i);
    fireEvent.change(otp, { target: { value: '1a2b3' } });
    expect(otp).toHaveValue('123');
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }));
    expect(apiClient.confirmCodeRecovery).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Masukkan kode OTP 6 digit dari email.');
    fireEvent.change(otp, { target: { value: '1a2b3c4d5e6f7' } });
    expect(otp).toHaveValue('123456');
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }));
    await waitFor(() => expect(apiClient.confirmCodeRecovery).toHaveBeenCalledWith({
      email: 'mhs@univ.ac.id', reference_number: 'REP-001', code: '123456',
    }));
  });

  it('submits { email, reference_number, code } payload when email and ref are filled in Tab 1', async () => {
    vi.spyOn(apiClient, 'confirmCodeRecovery').mockResolvedValue({
      message: 'Kode baru telah dikirim ke email.',
    });

    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    // Fill in Tab 1
    fireEvent.change(screen.getByLabelText(/Alamat Email Pelapor Terdaftar/i), {
      target: { value: 'mhs.privacy@univ.ac.id' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi Laporan/i), {
      target: { value: 'REP-20260928-PRIV1' },
    });

    // Switch to Tab 2
    fireEvent.click(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i }));

    fireEvent.change(screen.getByLabelText(/Kode OTP Pemulihan/i), {
      target: { value: '654321' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }));

    await waitFor(() => {
      expect(apiClient.confirmCodeRecovery).toHaveBeenCalledWith({
        email: 'mhs.privacy@univ.ac.id',
        reference_number: 'REP-20260928-PRIV1',
        code: '654321',
      });
    });
  });

  it('shows generic INVALID_OTP error without an attempt count', async () => {
    vi.spyOn(apiClient, 'confirmCodeRecovery').mockRejectedValue(
      new ReportApiError('INVALID_OTP', 'Kode OTP tidak valid.', 400)
    );

    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    fireEvent.click(screen.getByRole('tab', { name: /2\. Masukkan Kode OTP/i }));
    fireEvent.change(screen.getByLabelText(/Alamat Email \*/i), { target: { value: 'mhs@univ.ac.id' } });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi \*/i), { target: { value: 'REP-20260925-00001' } });
    fireEvent.change(screen.getByLabelText(/Kode OTP Pemulihan/i), {
      target: { value: '000000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Kode OTP tidak valid atau kedaluwarsa/i);
      expect(screen.getByRole('alert')).not.toHaveTextContent(/Sisa percobaan/i);
    });
  });

  it('recalculates recovery cooldown from elapsed time after a background tab pause', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-30T10:00:00Z'));
    vi.spyOn(apiClient, 'requestCodeRecovery').mockResolvedValue({ message: 'Permintaan diterima.' });
    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    fireEvent.change(screen.getByLabelText(/Alamat Email Pelapor Terdaftar/i), {
      target: { value: 'mhs@univ.ac.id' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi Laporan/i), {
      target: { value: 'REP-20260925-00001' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Kirim Kode Pemulihan/i }));
    });

    expect(screen.getByRole('button', { name: /60d/i })).toBeDisabled();
    expect(screen.queryByText('Tunggu 60 detik sebelum dapat meminta kode baru.')).not.toBeInTheDocument();

    vi.setSystemTime(new Date('2026-09-30T10:01:10Z'));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(screen.getByRole('button', { name: /Kirim Kode Pemulihan/i })).not.toBeDisabled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('maps RESEND_COOLDOWN error and triggers cooldown timer in request tab', async () => {
    vi.useFakeTimers();

    vi.spyOn(apiClient, 'requestCodeRecovery').mockRejectedValue(
      new ReportApiError('RESEND_COOLDOWN', 'Tunggu sebelum meminta kode baru.', 429, undefined, {
        retry_after_seconds: 50,
      })
    );

    render(
      <ReporterSessionProvider>
        <ReportRecoveryForm />
      </ReporterSessionProvider>
    );

    fireEvent.change(screen.getByLabelText(/Alamat Email Pelapor Terdaftar/i), {
      target: { value: 'mhs@univ.ac.id' },
    });
    fireEvent.change(screen.getByLabelText(/Nomor Referensi Laporan/i), {
      target: { value: 'REP-20260925-00001' },
    });

    const submitBtn = screen.getByRole('button', { name: /Kirim Kode Pemulihan/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/50 detik/i);
    expect(screen.getByRole('button', { name: /50d/i })).toBeDisabled();

    // Advance 50 seconds
    act(() => {
      vi.advanceTimersByTime(50000);
    });

    expect(screen.getByRole('button', { name: /Kirim Kode Pemulihan/i })).not.toBeDisabled();
  });
});
