import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorState } from '../ErrorState';

describe('ErrorState Component', () => {
  it('renders default friendly error message without codes or circular wrapper', () => {
    const { container } = render(<ErrorState />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Layanan Sedang Mengalami Kendala')).toBeInTheDocument();
    expect(
      screen.getByText('Layanan informasi sedang tidak dapat dijangkau. Silakan coba beberapa saat lagi.')
    ).toBeInTheDocument();

    // No HTTP status codes or technical words
    expect(alert.textContent).not.toMatch(/\b(500|502|503|504|400|404|error|exception|stack)\b/i);

    // No circular shape wrapper around icon
    expect(container.querySelector('.rounded-full')).toBeNull();
  });

  it('renders retry link when retryHref is provided', () => {
    render(
      <ErrorState
        title="Gagal Memuat Data"
        message="Koneksi sedang lambat. Silakan coba lagi sebentar lagi."
        retryHref="/event?q=seminar"
      />
    );

    const retryLink = screen.getByRole('link', { name: /coba lagi/i });
    expect(retryLink).toBeInTheDocument();
    expect(retryLink).toHaveAttribute('href', '/event?q=seminar');
  });

  it('omits retry link when retryHref is not provided', () => {
    render(<ErrorState />);

    expect(screen.queryByRole('link', { name: /coba lagi/i })).not.toBeInTheDocument();
  });
});
