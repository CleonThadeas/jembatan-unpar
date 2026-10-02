import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('prototype disclosure', () => {
  it('always warns against real personal data and provides demo tools', async () => {
    const { DemoBanner } = await import('../DemoBanner');
    render(<DemoBanner />);
    expect(screen.getByText(/bukan layanan resmi/i)).toBeInTheDocument();
    expect(screen.getByText(/jangan masukkan data pribadi/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pusat demo/i })).toHaveAttribute('href', '/demo');
  });
});
