import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { StepEmailVerification } from '@/components/report/StepEmailVerification';
import { ReporterSessionProvider } from '@/context/ReporterSessionContext';
import * as apiClient from '@/lib/api-client';
import { ReportApiError } from '@/lib/api-client';

const DRAFT = {
  category_id: 'cat-1',
  title: 'AC Rusak',
  description: 'AC di kelas mati.',
  reporter_impact: 'Sedang',
  email: 'mahasiswa@univ.ac.id',
};

function renderStep(props: { onNext?: () => void; onBack?: () => void } = {}) {
  return render(
    <ReporterSessionProvider initialDraft={DRAFT}>
      <StepEmailVerification onNext={props.onNext ?? vi.fn()} onBack={props.onBack ?? vi.fn()} />
    </ReporterSessionProvider>
  );
}

// The step sends the OTP on mount, so let that automatic request settle before asserting.
async function renderStepAndSettle(props: { onNext?: () => void; onBack?: () => void } = {}) {
  let utils: ReturnType<typeof renderStep> | undefined;
  await act(async () => {
    utils = renderStep(props);
  });
  return utils as ReturnType<typeof renderStep>;
}

describe('StepEmailVerification Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(apiClient, 'requestEmailVerification').mockResolvedValue({
      message: 'Kode OTP telah dikirim ke email Anda.',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders email verification step with draft email and 10-minute TTL guidance', async () => {
    await renderStepAndSettle();

    expect(screen.getByText('mahasiswa@univ.ac.id')).toBeInTheDocument();
    expect(screen.getAllByText(/10 menit/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/Kode OTP Email/i)).toBeInTheDocument();
  });

  it('sends the OTP automatically on arrival without a manual click', async () => {
    await renderStepAndSettle();

    expect(apiClient.requestEmailVerification).toHaveBeenCalledTimes(1);
    expect(apiClient.requestEmailVerification).toHaveBeenCalledWith('mahasiswa@univ.ac.id');
    expect(screen.getByRole('status')).toHaveTextContent('Kode OTP telah dikirim ke email Anda.');
  });

  it('sends only one OTP email under React StrictMode double mounting', async () => {
    await act(async () => {
      render(
        <React.StrictMode>
          <ReporterSessionProvider initialDraft={DRAFT}>
            <StepEmailVerification onNext={vi.fn()} onBack={vi.fn()} />
          </ReporterSessionProvider>
        </React.StrictMode>
      );
    });

    expect(apiClient.requestEmailVerification).toHaveBeenCalledTimes(1);
  });

  it('uses one consistent OTP label without exposing backend outbox instructions', async () => {
    await renderStepAndSettle();

    expect(screen.getByLabelText(/Kode OTP Email/i)).toHaveAttribute('autoComplete', 'one-time-code');
    expect(screen.queryByText(/email_outbox/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kirim Ulang/i })).toBeDisabled();
  });

  it('recalculates resend cooldown from wall clock after a background tab pause', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-30T10:00:00Z'));
    await renderStepAndSettle();

    vi.setSystemTime(new Date('2026-09-30T10:01:10Z'));
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(screen.getByRole('button', { name: /Kirim Ulang/i })).not.toBeDisabled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('starts a 60-second cooldown after the automatic send and allows a manual resend afterwards', async () => {
    vi.useFakeTimers();
    await renderStepAndSettle();

    expect(screen.getByRole('button', { name: /Kirim Ulang.*60/i })).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByRole('button', { name: /Kirim Ulang.*50/i })).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(50000);
    });

    const resendBtn = screen.getByRole('button', { name: /Kirim Ulang Kode/i });
    expect(resendBtn).not.toBeDisabled();
    expect(screen.getByText('Kode OTP dapat diminta kembali.')).toHaveAttribute('role', 'status');

    await act(async () => {
      fireEvent.click(resendBtn);
    });
    expect(apiClient.requestEmailVerification).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: /Kirim Ulang.*60/i })).toBeDisabled();
  });

  it('keeps draft navigation and resend unavailable while OTP confirmation is pending', async () => {
    let finishConfirmation: ((value: { verified_email: string; verification_ticket: string }) => void) | undefined;
    vi.spyOn(apiClient, 'confirmEmailVerification').mockImplementation(() =>
      new Promise((resolve) => { finishConfirmation = resolve; })
    );
    const onBack = vi.fn();
    const onNext = vi.fn();
    await renderStepAndSettle({ onNext, onBack });

    fireEvent.change(screen.getByLabelText(/Kode OTP Email/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i }));
    expect(screen.getByRole('button', { name: /Kembali ke Formulir Draf/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Kirim Ulang/i })).toBeDisabled();
    expect(screen.getByLabelText(/Kode OTP Email/i)).toBeDisabled();
    await act(async () => finishConfirmation?.({ verified_email: 'mahasiswa@univ.ac.id', verification_ticket: 'ticket-signed-xyz' }));
    expect(onBack).not.toHaveBeenCalled();
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('prevents leaving or confirming while the automatic OTP request is pending', async () => {
    let finishRequest: ((value: { message: string }) => void) | undefined;
    vi.spyOn(apiClient, 'requestEmailVerification').mockImplementation(() =>
      new Promise((resolve) => { finishRequest = resolve; })
    );
    const confirmSpy = vi.spyOn(apiClient, 'confirmEmailVerification');
    const onBack = vi.fn();
    const onNext = vi.fn();
    renderStep({ onNext, onBack });

    expect(screen.getByRole('button', { name: /Mengirim kode/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Kembali ke Formulir Draf/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i })).toBeDisabled();
    const form = screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i }).closest('form');
    expect(form).not.toBeNull();
    if (form) fireEvent.submit(form);
    expect(confirmSpy).not.toHaveBeenCalled();

    await act(async () => finishRequest?.({ message: 'Kode OTP telah dikirim.' }));
    expect(screen.getByRole('button', { name: /Kembali ke Formulir Draf/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i })).toBeDisabled();
    expect(onBack).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('submits confirmation with email and 6-digit OTP code', async () => {
    const onNextMock = vi.fn();
    vi.spyOn(apiClient, 'confirmEmailVerification').mockResolvedValue({
      verified_email: 'mahasiswa@univ.ac.id',
      verification_ticket: 'ticket-signed-xyz',
    });
    await renderStepAndSettle({ onNext: onNextMock });

    fireEvent.change(screen.getByLabelText(/Kode OTP Email/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i }));

    await waitFor(() => {
      expect(apiClient.confirmEmailVerification).toHaveBeenCalledWith({
        email: 'mahasiswa@univ.ac.id',
        code: '123456',
      });
      expect(onNextMock).toHaveBeenCalled();
    });
  });

  it('strips non-digits and refuses an incomplete email OTP', async () => {
    vi.spyOn(apiClient, 'confirmEmailVerification');
    await renderStepAndSettle();

    const input = screen.getByLabelText(/Kode OTP Email/i);
    expect(input).toHaveAttribute('inputMode', 'numeric');
    expect(input).toHaveAttribute('autoComplete', 'one-time-code');
    expect(input).toHaveAttribute('maxLength', '6');
    expect(input).toHaveAttribute('pattern', '[0-9]{6}');
    fireEvent.change(input, { target: { value: '1a2b3' } });
    expect(input).toHaveValue('123');
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i }));
    expect(apiClient.confirmEmailVerification).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Masukkan kode OTP 6 digit dari email.');
    fireEvent.change(input, { target: { value: '1a2b3c4d5e6f7' } });
    expect(input).toHaveValue('123456');
  });

  it('maps INVALID_OTP error and displays remaining attempts from meta', async () => {
    vi.spyOn(apiClient, 'confirmEmailVerification').mockRejectedValue(
      new ReportApiError('INVALID_OTP', 'Kode OTP tidak valid.', 400, undefined, {
        remaining_attempts: 2,
      })
    );
    await renderStepAndSettle();

    fireEvent.change(screen.getByLabelText(/Kode OTP Email/i), { target: { value: '999999' } });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Sisa percobaan: 2/i);
    });
  });

  it('maps OTP_EXPIRED error to user-friendly message', async () => {
    vi.spyOn(apiClient, 'confirmEmailVerification').mockRejectedValue(
      new ReportApiError('OTP_EXPIRED', 'Kode OTP telah kedaluwarsa.', 400)
    );
    await renderStepAndSettle();

    fireEvent.change(screen.getByLabelText(/Kode OTP Email/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/telah kedaluwarsa/i);
    });
  });

  it('maps OTP_ATTEMPTS_EXCEEDED error to user-friendly message', async () => {
    vi.spyOn(apiClient, 'confirmEmailVerification').mockRejectedValue(
      new ReportApiError('OTP_ATTEMPTS_EXCEEDED', 'Batas percobaan terlampaui.', 400)
    );
    await renderStepAndSettle();

    fireEvent.change(screen.getByLabelText(/Kode OTP Email/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Batas percobaan.*terlampaui/i);
    });
  });

  it('treats RESEND_COOLDOWN on the automatic send as "previous code still valid", not an error', async () => {
    vi.useFakeTimers();
    vi.spyOn(apiClient, 'requestEmailVerification').mockRejectedValue(
      new ReportApiError('RESEND_COOLDOWN', 'Tunggu sebelum meminta kode baru.', 429, undefined, {
        retry_after_seconds: 45,
      })
    );
    await renderStepAndSettle();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/masih berlaku/i);
    expect(screen.getByRole('button', { name: /Kirim Ulang.*45/i })).toBeDisabled();

    act(() => {
      vi.advanceTimersByTime(45000);
    });
    expect(screen.getByRole('button', { name: /Kirim Ulang Kode/i })).not.toBeDisabled();
  });

  it('shows the cooldown wait time when a manual resend hits RESEND_COOLDOWN', async () => {
    vi.useFakeTimers();
    await renderStepAndSettle();
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    vi.spyOn(apiClient, 'requestEmailVerification').mockRejectedValue(
      new ReportApiError('RESEND_COOLDOWN', 'Tunggu sebelum meminta kode baru.', 429, undefined, {
        retry_after_seconds: 30,
      })
    );
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Kirim Ulang Kode/i }));
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/30 detik/i);
    expect(screen.getByRole('button', { name: /Kirim Ulang.*30/i })).toBeDisabled();
  });

  it('surfaces a send failure from the automatic request so the reporter can retry', async () => {
    vi.spyOn(apiClient, 'requestEmailVerification').mockRejectedValue(
      new ReportApiError('INTERNAL_ERROR', 'Layanan email sedang bermasalah.', 500)
    );
    await renderStepAndSettle();

    expect(screen.getByRole('alert')).toHaveTextContent('Layanan email sedang bermasalah.');
    expect(screen.getByRole('button', { name: /Kirim Kode Lagi/i })).not.toBeDisabled();
  });

  it('does not request a new OTP on remount when email is already verified with an active ticket', async () => {
    const onNextMock = vi.fn();
    render(
      <ReporterSessionProvider
        initialDraft={DRAFT}
        initialVerifiedEmail="mahasiswa@univ.ac.id"
        initialVerificationTicket="active-ticket-xyz"
      >
        <StepEmailVerification onNext={onNextMock} onBack={vi.fn()} />
      </ReporterSessionProvider>
    );

    // apiClient.requestEmailVerification must NOT have been called
    expect(apiClient.requestEmailVerification).not.toHaveBeenCalled();

    // Verified banner is displayed
    expect(screen.getByText(/Alamat Email Telah Terverifikasi/i)).toBeInTheDocument();
    expect(
      screen.getByText(/sudah terverifikasi\. Lanjutkan tanpa meminta OTP baru\./i)
    ).toBeInTheDocument();

    // Verified reporters have one next action and no redundant OTP entry or resend.
    expect(screen.queryByRole('textbox', { name: /Kode OTP Email/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Kirim.*Kode/i })).not.toBeInTheDocument();
    const proceedButtons = screen.getAllByRole('button', { name: /Lanjut ke Tinjauan Laporan/i });
    expect(proceedButtons).toHaveLength(1);
    expect(proceedButtons[0]).toHaveClass('min-h-[48px]');
    fireEvent.click(proceedButtons[0]);
    expect(onNextMock).toHaveBeenCalledTimes(1);
  });

  it('supports case-insensitive email match between verifiedEmail and draft.email without sending OTP', async () => {
    render(
      <ReporterSessionProvider
        initialDraft={{ ...DRAFT, email: 'MAHASISWA@UNIV.AC.ID' }}
        initialVerifiedEmail="mahasiswa@univ.ac.id"
        initialVerificationTicket="ticket-case-match"
      >
        <StepEmailVerification onNext={vi.fn()} onBack={vi.fn()} />
      </ReporterSessionProvider>
    );

    // Case-insensitive match preserves verification and does not request new OTP
    expect(apiClient.requestEmailVerification).not.toHaveBeenCalled();
    expect(screen.getByText(/Alamat Email Telah Terverifikasi/i)).toBeInTheDocument();
  });

  it('enforces 48px hit target on back button, resend button, and proceed button', async () => {
    await renderStepAndSettle();

    const backBtn = screen.getByRole('button', { name: /Kembali ke Formulir Draf/i });
    expect(backBtn).toHaveClass('min-h-[48px]');

    const resendBtn = screen.getByRole('button', { name: /Kirim Ulang/i });
    expect(resendBtn).toHaveClass('min-h-[48px]');

    const confirmBtn = screen.getByRole('button', { name: /Konfirmasi Kode OTP & Tinjau Laporan/i });
    expect(confirmBtn).toHaveClass('min-h-[48px]');
  });
});
