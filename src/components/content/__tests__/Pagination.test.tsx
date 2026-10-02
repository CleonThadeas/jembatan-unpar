import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pagination } from '../Pagination';

describe('Pagination Component', () => {
  it('returns null if there is only 1 page and items <= per_page', () => {
    const { container } = render(
      <Pagination
        pagination={{
          page: 1,
          per_page: 10,
          total_items: 5,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        }}
        basePath="/beasiswa"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders page numbers, previous/next buttons and preserved query params including availability', () => {
    render(
      <Pagination
        pagination={{
          page: 2,
          per_page: 10,
          total_items: 35,
          total_pages: 4,
          has_next: true,
          has_prev: true,
        }}
        basePath="/beasiswa"
        queryParams={{ q: 'riset', tag: 'kompetisi', availability: 'aktif' }}
      />
    );

    expect(screen.getByText(/Menampilkan halaman/i)).toBeInTheDocument();
    expect(screen.getByText('2', { selector: 'span[aria-current="page"]' })).toBeInTheDocument();

    const prevLink = screen.getByRole('link', { name: /ke halaman sebelumnya/i });
    expect(prevLink).toHaveAttribute('href', '/beasiswa?q=riset&tag=kompetisi&availability=aktif&page=1');

    const nextLink = screen.getByRole('link', { name: /ke halaman berikutnya/i });
    expect(nextLink).toHaveAttribute('href', '/beasiswa?q=riset&tag=kompetisi&availability=aktif&page=3');

    const page3Link = screen.getByRole('link', { name: /ke halaman 3/i });
    expect(page3Link).toHaveAttribute('href', '/beasiswa?q=riset&tag=kompetisi&availability=aktif&page=3');
  });

  it('renders disabled states when no next or prev', () => {
    render(
      <Pagination
        pagination={{
          page: 1,
          per_page: 10,
          total_items: 20,
          total_pages: 2,
          has_next: true,
          has_prev: false,
        }}
        basePath="/event"
      />
    );

    const prevDisabled = screen.getByText('Sebelumnya', { selector: 'span *' });
    expect(prevDisabled.closest('span[aria-disabled="true"]')).toBeInTheDocument();

    const nextLink = screen.getByRole('link', { name: /ke halaman berikutnya/i });
    expect(nextLink).toBeInTheDocument();
  });

  it('provides accessible touch targets of at least 44px', () => {
    render(
      <Pagination
        pagination={{
          page: 2,
          per_page: 10,
          total_items: 50,
          total_pages: 5,
          has_next: true,
          has_prev: true,
        }}
        basePath="/beasiswa"
      />
    );

    const prevLink = screen.getByRole('link', { name: /ke halaman sebelumnya/i });
    expect(prevLink.className).toContain('min-h-[44px]');

    const page3Link = screen.getByRole('link', { name: /ke halaman 3/i });
    expect(page3Link.className).toContain('min-h-[44px]');
    expect(page3Link.className).toContain('min-w-[44px]');

    const currentPage = screen.getByText('2', { selector: 'span[aria-current="page"]' });
    expect(currentPage.className).toContain('min-h-[44px]');
    expect(currentPage.className).toContain('min-w-[44px]');
  });
});
