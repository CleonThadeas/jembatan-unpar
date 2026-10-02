import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TruthfulBlockersBanner } from '../TruthfulBlockersBanner';

describe('TruthfulBlockersBanner Component', () => {
  it('links the disclosure toggle to its panel via aria-controls and meets the 44px target size', () => {
    render(<TruthfulBlockersBanner />);

    const toggle = screen.getByRole('button', { name: /Ciutkan informasi batasan sistem/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute('aria-controls', 'blockers-content');
    expect(toggle).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    expect(document.getElementById('blockers-content')).toBeInTheDocument();
  });

  it('starts collapsed in compact mode and expands the controlled panel on toggle', () => {
    render(<TruthfulBlockersBanner compact />);

    const toggle = screen.getByRole('button', { name: /Buka informasi batasan sistem/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('blockers-content')).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('blockers-content')).toBeInTheDocument();
  });
});
