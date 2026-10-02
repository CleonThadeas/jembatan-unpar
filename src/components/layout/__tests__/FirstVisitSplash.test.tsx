import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { FirstVisitSplash } from '../FirstVisitSplash';

describe('FirstVisitSplash Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows splash on first visit when sessionStorage is empty and records seen key', () => {
    render(<FirstVisitSplash />);

    const splash = screen.getByTestId('first-visit-splash');
    expect(splash).toBeInTheDocument();
    expect(screen.getByText(/JEMBATAN/)).toBeInTheDocument();
    expect(screen.getByTestId('first-visit-splash-progress')).toBeInTheDocument();
    expect(window.sessionStorage.getItem('jembatan:splash-seen')).toBe('true');

    // After 3s the progress bar completes, fade-out starts, then it unmounts
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(splash).toHaveClass('opacity-0');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByTestId('first-visit-splash')).not.toBeInTheDocument();
  });

  it('still fades out and unmounts under React StrictMode double effects', () => {
    render(
      <React.StrictMode>
        <FirstVisitSplash />
      </React.StrictMode>
    );

    const splash = screen.getByTestId('first-visit-splash');

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(splash).toHaveClass('opacity-0');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByTestId('first-visit-splash')).not.toBeInTheDocument();
  });

  it('is not shown when the sessionStorage key is already set', () => {
    window.sessionStorage.setItem('jembatan:splash-seen', 'true');

    render(<FirstVisitSplash />);

    expect(screen.queryByTestId('first-visit-splash')).not.toBeInTheDocument();
  });

  it('survives and safely renders nothing when sessionStorage throws', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: sessionStorage access denied');
    });

    render(<FirstVisitSplash />);

    expect(screen.queryByTestId('first-visit-splash')).not.toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('does not render when user prefers reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<FirstVisitSplash />);

    expect(screen.queryByTestId('first-visit-splash')).not.toBeInTheDocument();
  });
});
