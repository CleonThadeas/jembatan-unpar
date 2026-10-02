import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RouteProgress } from '../RouteProgress';

let currentPathname = '/';
let currentSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
  useSearchParams: () => currentSearchParams,
}));

describe('RouteProgress Component', () => {
  beforeEach(() => {
    currentPathname = '/';
    currentSearchParams = new URLSearchParams();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is idle and does not render on initial load', () => {
    render(<RouteProgress />);
    expect(screen.queryByTestId('route-progress')).not.toBeInTheDocument();
  });

  it('starts on internal same-origin link click', () => {
    render(
      <div>
        <RouteProgress />
        <a href="/beasiswa" onClick={(e) => e.preventDefault()}>
          Beasiswa
        </a>
      </div>
    );

    const link = screen.getByText('Beasiswa');
    fireEvent.click(link);

    expect(screen.getByTestId('route-progress')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  it('ignores external link clicks', () => {
    render(
      <div>
        <RouteProgress />
        <a href="https://example.com/external">Eksternal</a>
      </div>
    );

    const link = screen.getByText('Eksternal');
    fireEvent.click(link);

    expect(screen.queryByTestId('route-progress')).not.toBeInTheDocument();
  });

  it('ignores clicks with modifier keys (ctrl, meta, shift, alt)', () => {
    render(
      <div>
        <RouteProgress />
        <a href="/event">Event</a>
      </div>
    );

    const link = screen.getByText('Event');

    fireEvent.click(link, { ctrlKey: true });
    expect(screen.queryByTestId('route-progress')).not.toBeInTheDocument();

    fireEvent.click(link, { metaKey: true });
    expect(screen.queryByTestId('route-progress')).not.toBeInTheDocument();

    fireEvent.click(link, { shiftKey: true });
    expect(screen.queryByTestId('route-progress')).not.toBeInTheDocument();

    fireEvent.click(link, { altKey: true });
    expect(screen.queryByTestId('route-progress')).not.toBeInTheDocument();
  });

  it('ignores clicks on links with target="_blank"', () => {
    render(
      <div>
        <RouteProgress />
        <a href="/promosi" target="_blank" rel="noreferrer">
          Promosi Baru
        </a>
      </div>
    );

    const link = screen.getByText('Promosi Baru');
    fireEvent.click(link);

    expect(screen.queryByTestId('route-progress')).not.toBeInTheDocument();
  });

  it('ignores clicks on hash-only, mailto, and download links', () => {
    render(
      <div>
        <RouteProgress />
        <a href="#section-1">Hash Link</a>
        <a href="mailto:test@unpar.ac.id">Email Link</a>
        <a href="/files/doc.pdf" download>
          Download Link
        </a>
      </div>
    );

    fireEvent.click(screen.getByText('Hash Link'));
    expect(screen.queryByTestId('route-progress')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Email Link'));
    expect(screen.queryByTestId('route-progress')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Download Link'));
    expect(screen.queryByTestId('route-progress')).not.toBeInTheDocument();
  });

  it('stays visible while navigation is pending (route has not changed yet)', () => {
    render(
      <div>
        <RouteProgress />
        <a href="/beasiswa" onClick={(e) => e.preventDefault()}>
          Beasiswa
        </a>
      </div>
    );

    fireEvent.click(screen.getByText('Beasiswa'));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('route-progress')).toBeInTheDocument();
  });

  it('auto-completes after the safety timeout when navigation never resolves', () => {
    render(
      <div>
        <RouteProgress />
        <a href="/beasiswa" onClick={(e) => e.preventDefault()}>
          Beasiswa
        </a>
      </div>
    );

    fireEvent.click(screen.getByText('Beasiswa'));

    act(() => {
      vi.advanceTimersByTime(10500);
    });

    expect(screen.queryByTestId('route-progress')).not.toBeInTheDocument();
  });

  it('completes and fades out after path navigation occurs', () => {
    const { rerender } = render(
      <div>
        <RouteProgress />
        <a href="/beasiswa">Beasiswa</a>
      </div>
    );

    // Trigger internal click
    fireEvent.click(screen.getByText('Beasiswa'));
    expect(screen.getByTestId('route-progress')).toBeInTheDocument();

    // Simulate route change
    currentPathname = '/beasiswa';
    rerender(
      <div>
        <RouteProgress />
        <a href="/beasiswa">Beasiswa</a>
      </div>
    );

    // Fast-forward completion and fade-out timers
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.queryByTestId('route-progress')).not.toBeInTheDocument();
  });
});
