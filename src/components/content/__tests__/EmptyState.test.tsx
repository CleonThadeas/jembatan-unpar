import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState Component', () => {
  it('renders default friendly title and description without circular wrapper or reset button', () => {
    const { container } = render(<EmptyState />);

    expect(screen.getByText('Belum Ada Informasi yang Sesuai')).toBeInTheDocument();
    expect(
      screen.getByText('Coba gunakan kata kunci lain atau ubah filter pencarian Anda.')
    ).toBeInTheDocument();

    // No reset button / links
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // Icon is calm without circular shape wrapper (e.g. rounded-full bg-slate-100)
    expect(container.querySelector('.rounded-full')).toBeNull();
  });

  it('renders custom title and description when provided', () => {
    render(
      <EmptyState
        title="Belum Ada Informasi Beasiswa"
        description="Belum ada informasi untuk saat ini. Nantikan pembaruan berikutnya."
      />
    );

    expect(screen.getByText('Belum Ada Informasi Beasiswa')).toBeInTheDocument();
    expect(
      screen.getByText('Belum ada informasi untuk saat ini. Nantikan pembaruan berikutnya.')
    ).toBeInTheDocument();
  });
});
