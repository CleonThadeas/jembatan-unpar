import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ReporterSessionProvider } from '@/context/ReporterSessionContext';
import * as apiClient from '@/lib/api-client';
import LaporLayout from '../layout';
import LaporPage from '../page';
import CekLaporanPage from '../cek-laporan/page';
import PemulihanPage from '../pemulihan/page';
import TentangPage from '../tentang/page';

vi.mock('next/navigation', () => ({
  usePathname: () => '/lapor',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock ReportWizard to simplify page rendering
vi.mock('@/components/report/ReportWizard', () => ({
  ReportWizard: () => <div data-testid="mock-report-wizard">Mock Report Wizard</div>,
}));

describe('/lapor Route Suite', () => {
  it('LaporLayout does NOT render a <main> tag and does NOT render ReportSubNav', () => {
    const { container } = render(
      <LaporLayout>
        <div data-testid="test-child">Child Content</div>
      </LaporLayout>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    // Must not introduce duplicate <main> tag since root layout already provides <main id="main-content">
    expect(container.querySelector('main')).toBeNull();
    // ReportSubNav should be removed from LaporLayout
    expect(screen.queryByRole('navigation', { name: /Navigasi Layanan Pelaporan/i })).toBeNull();
  });

  it('LaporPage renders left-aligned green Buat Laporan heading, guide link, and immediate ReportWizard without hero feature boxes or blockers banner', () => {
    render(
      <ReporterSessionProvider>
        <LaporPage />
      </ReporterSessionProvider>
    );

    const heading = screen.getByRole('heading', { level: 1, name: /Buat Laporan/i });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toMatch(/font-display/);
    expect(heading.className).toMatch(/text-brand-/);

    // Guide link must be present
    const guideLink = screen.getByRole('link', { name: /panduan/i });
    expect(guideLink).toBeInTheDocument();
    expect(guideLink).toHaveAttribute('href', expect.stringContaining('/lapor/tentang'));

    // Wizard is immediate
    expect(screen.getByTestId('mock-report-wizard')).toBeInTheDocument();

    // Hero feature cards and blockers banner are removed
    expect(screen.queryByText(/Kerahasiaan Terjaga/i)).toBeNull();
    expect(screen.queryByText(/Verifikasi Email Aktif/i)).toBeNull();
    expect(screen.queryByText(/Batasan Teknis Operasional/i)).toBeNull();
  });

  it('Cek Status Laporan has a route-specific document title without moving the client form logic', async () => {
    const { default: CekLaporanLayout, metadata } = await import('../cek-laporan/layout');
    expect(metadata.title).toBe('Cek Status Laporan');
    render(<CekLaporanLayout><span>Status page content</span></CekLaporanLayout>);
    expect(screen.getByText('Status page content')).toBeInTheDocument();
  });

  it('CekLaporanPage renders Cek Status Laporan heading, compact form, guide link, and recovery link without verbose cookie or single-scope boxes', () => {
    render(
      <ReporterSessionProvider>
        <CekLaporanPage />
      </ReporterSessionProvider>
    );

    const heading = screen.getByRole('heading', { level: 1, name: /Cek Status Laporan/i });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toMatch(/font-display/);

    expect(screen.getByLabelText(/Kode Akses Rahasia/i)).toBeInTheDocument();

    const recoveryLink = screen.getByRole('link', { name: /Lupa Kode Akses\? Pulihkan di Sini/i });
    expect(recoveryLink).toHaveAttribute('href', '/lapor/pemulihan');

    const guideLink = screen.getByRole('link', { name: /panduan/i });
    expect(guideLink).toHaveAttribute('href', expect.stringContaining('/lapor/tentang'));

    // Verbose boxes must be removed
    expect(screen.queryByText(/cookie HttpOnly/i)).toBeNull();
    expect(screen.queryByText(/Kebijakan Pembatasan Akses Satu Laporan/i)).toBeNull();
  });

  it('CekLaporanPage provides aria-invalid="false" and connects access-code-hint initially', () => {
    render(
      <ReporterSessionProvider>
        <CekLaporanPage />
      </ReporterSessionProvider>
    );

    const input = screen.getByLabelText(/Kode Akses Rahasia/i);
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAttribute('aria-describedby', 'access-code-hint');
    expect(screen.getByText(/Tanda hubung/i)).toHaveAttribute('id', 'access-code-hint');
  });

  it('CekLaporanPage provides aria-invalid="true" and connects aria-describedby with role="alert" when validation fails', async () => {
    vi.spyOn(apiClient, 'checkAccessCode').mockRejectedValue(
      new Error('Kode akses tidak valid atau tidak ditemukan.')
    );

    render(
      <ReporterSessionProvider>
        <CekLaporanPage />
      </ReporterSessionProvider>
    );

    const input = screen.getByLabelText(/Kode Akses Rahasia/i);
    fireEvent.change(input, { target: { value: 'WRONG-CODE-12345' } });
    fireEvent.click(screen.getByRole('button', { name: /Buka Laporan/i }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('id', 'access-code-error');
      expect(
        screen.getByText(/Kode akses tidak valid atau tidak ditemukan\./i)
      ).toBeInTheDocument();
    });

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toContain('access-code-error');
  });

  it('CekLaporanPage prevents repeated form submission while access verification is pending', async () => {
    let rejectRequest: ((reason: Error) => void) | undefined;
    const checkSpy = vi.spyOn(apiClient, 'checkAccessCode').mockImplementation(() =>
      new Promise((_, reject) => { rejectRequest = reject; })
    );
    render(
      <ReporterSessionProvider>
        <CekLaporanPage />
      </ReporterSessionProvider>
    );

    const input = screen.getByLabelText(/Kode Akses Rahasia/i);
    fireEvent.change(input, { target: { value: 'PENDING-CODE' } });
    const form = screen.getByRole('button', { name: /Buka Laporan/i }).closest('form');
    expect(form).not.toBeNull();
    if (!form) throw new Error('Access form missing');
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(checkSpy).toHaveBeenCalledTimes(1);
    expect(input).toBeDisabled();
    await act(async () => rejectRequest?.(new Error('Layanan sementara tidak tersedia.')));
    expect(input).not.toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('Layanan sementara tidak tersedia.');
  });

  it('CekLaporanPage displays role="alert" and lockout explanation when account is rate-limited/locked', async () => {
    vi.spyOn(apiClient, 'checkAccessCode').mockRejectedValue(
      new Error('Akses terkunci sementara karena melebihi percobaan maksimum.')
    );

    render(
      <ReporterSessionProvider>
        <CekLaporanPage />
      </ReporterSessionProvider>
    );

    const input = screen.getByLabelText(/Kode Akses Rahasia/i);
    fireEvent.change(input, { target: { value: 'LOCKED-CODE-99999' } });
    fireEvent.click(screen.getByRole('button', { name: /Buka Laporan/i }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('id', 'access-code-error');
      expect(screen.getByText(/Kode ini terkunci selama 15 menit/i)).toBeInTheDocument();
    });

    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('CekLaporanPage uses WCAG AA compliant text-slate-600 for format hint and access-code-hint', () => {
    render(
      <ReporterSessionProvider>
        <CekLaporanPage />
      </ReporterSessionProvider>
    );

    const formatHint = screen.getByText(/Format: XXXXX-XXXXX-XXXXX/i);
    expect(formatHint).toHaveClass('text-slate-600');
    expect(formatHint).not.toHaveClass('text-slate-400');

    const accessCodeHint = screen.getByText(/Tanda hubung/i);
    expect(accessCodeHint).toHaveClass('text-slate-600');
    expect(accessCodeHint).not.toHaveClass('text-slate-400');
  });

  it('CekLaporanPage provides a show/hide toggle for the password-type access code input with accessible label, aria-pressed, and 44px hit area', () => {
    render(
      <ReporterSessionProvider>
        <CekLaporanPage />
      </ReporterSessionProvider>
    );

    const input = screen.getByLabelText(/Kode Akses Rahasia/i);
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autoComplete', 'off');

    const toggleBtn = screen.getByRole('button', { name: /Tampilkan kode akses/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('type', 'button');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    // Hit area check: min 44px
    expect(toggleBtn.className).toMatch(/min-w-\[44px\]|w-11/);
    expect(toggleBtn.className).toMatch(/min-h-\[44px\]|h-11/);

    // Click toggle to reveal code
    fireEvent.click(toggleBtn);

    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('autoComplete', 'off');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    expect(toggleBtn).toHaveAttribute('aria-label', 'Sembunyikan kode akses');

    // Click toggle again to hide code
    fireEvent.click(toggleBtn);

    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autoComplete', 'off');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(toggleBtn).toHaveAttribute('aria-label', 'Tampilkan kode akses');
  });

  it('PemulihanPage renders ReportRecoveryForm with Pemulihan Kode heading and guide link', () => {
    render(
      <ReporterSessionProvider>
        <PemulihanPage />
      </ReporterSessionProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Pemulihan Kode/i })).toBeInTheDocument();
    const guideLink = screen.getByRole('link', { name: /panduan/i });
    expect(guideLink).toBeInTheDocument();
    expect(guideLink).toHaveAttribute('href', expect.stringContaining('/lapor/tentang'));
  });

  it('TentangPage renders Panduan dan Batasan heading with anchored sections for buat-laporan, cek-status, pemulihan, privasi, kode-akses, and batasan', () => {
    const { container } = render(
      <ReporterSessionProvider>
        <TentangPage />
      </ReporterSessionProvider>
    );

    const heading = screen.getByRole('heading', { level: 1, name: /Panduan dan Batasan/i });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toMatch(/font-display/);

    // Required anchored sections
    expect(container.querySelector('#buat-laporan')).toBeInTheDocument();
    expect(container.querySelector('#cek-status')).toBeInTheDocument();
    expect(container.querySelector('#pemulihan')).toBeInTheDocument();
    expect(container.querySelector('#privasi')).toBeInTheDocument();
    expect(container.querySelector('#kode-akses')).toBeInTheDocument();
    expect(container.querySelector('#batasan')).toBeInTheDocument();

    // Consolidated explanations: limits 3 files, 10 MB, JPG PNG PDF, truthful blockers, privacy limits
    expect(screen.getByText(/3 file/i)).toBeInTheDocument();
    expect(screen.getByText(/10\s?MB/i)).toBeInTheDocument();
    expect(screen.getByText(/JPG, PNG/i)).toBeInTheDocument();
    expect(screen.getByText(/tidak menjamin anonimitas mutlak/i)).toBeInTheDocument();

    const ctaButton = screen.getByRole('link', { name: /Mulai Pengajuan Laporan/i });
    expect(ctaButton).toHaveAttribute('href', '/lapor');
  });
});
