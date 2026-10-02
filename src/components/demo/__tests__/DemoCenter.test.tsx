import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const reset = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/api-client', () => ({
  getDemoOverview: vi.fn().mockResolvedValue({
    reports: [{ title: 'Laporan contoh', reference_number: 'DEMO-001', email: 'pelapor1@example.com', access_code: 'DEMO-CODE-001', status: 'BARU' }],
    inbox: [{ id: 'inbox1', email: 'pelapor1@example.com', subject: 'OTP demo', body: 'Kode: 123456', created_at: '2026-10-02T12:00:00Z' }],
    storageMode: 'indexeddb', storageWarning: null,
  }),
  resetDemoDatabase: (...args: unknown[]) => reset(...args),
}));

describe('demo tools', () => {
  it('shows synthetic report codes and local inbox without sending email', async () => {
    const { DemoCenter } = await import('../DemoCenter');
    render(<DemoCenter />);
    expect(await screen.findByText('DEMO-CODE-001')).toBeInTheDocument();
    expect(screen.getByText('Kode: 123456')).toBeInTheDocument();
    expect(screen.getByText(/tidak mengirim email/i)).toBeInTheDocument();
  });
  it('requires confirmation before resetting demo data', async () => {
    const { DemoCenter } = await import('../DemoCenter');
    render(<DemoCenter />);
    await screen.findByText('DEMO-CODE-001');
    fireEvent.click(screen.getByRole('button', { name: /^Reset data demo$/i }));
    expect(reset).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Batal/i }));
    expect(reset).not.toHaveBeenCalled();
  });
});
