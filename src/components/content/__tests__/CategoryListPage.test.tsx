import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { CategoryListPage } from '../CategoryListPage';
import type { PaginationMeta, Content } from '@/types/content';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/beasiswa',
  useSearchParams: () => new URLSearchParams(),
}));

describe('CategoryListPage Component', () => {
  const emptyPagination: PaginationMeta = {
    page: 1,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  };

  const sampleContents: Content[] = [
    {
      id: 'c-1',
      type: 'BEASISWA',
      title: 'Beasiswa Indonesia Maju',
      slug: 'beasiswa-indonesia-maju',
      summary: 'Program beasiswa degree untuk jenjang S1.',
      body: 'Deskripsi lengkap beasiswa.',
      status: 'PUBLISHED',
      organizer: 'Puspresnas',
      published_at: '2026-09-01T08:00:00Z',
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-09-01T08:00:00Z',
      view_count: 12,
    },
  ];

  it('renders ErrorState with retry link retaining filters, sort, and availability when error occurs', () => {
    render(
      <CategoryListPage
        type="BEASISWA"
        contents={[]}
        pagination={emptyPagination}
        tags={[]}
        currentQuery="riset"
        currentTag="prestasi"
        currentSort="views_desc"
        currentAvailability="aktif"
        error="Layanan informasi sedang tidak dapat dijangkau. Silakan coba beberapa saat lagi."
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/Gagal Memuat Daftar Beasiswa/i);
    expect(alert).toHaveTextContent(/Layanan informasi sedang tidak dapat dijangkau/i);

    // Must NOT render fake empty state
    expect(screen.queryByText(/Belum Ada Informasi/i)).not.toBeInTheDocument();

    // Must render retry link retaining query, tag, sort, and availability
    const retryLink = screen.getByRole('link', { name: /coba lagi/i });
    expect(retryLink).toBeInTheDocument();
    expect(retryLink).toHaveAttribute('href', '/beasiswa?q=riset&tag=prestasi&sort=views_desc&availability=aktif');
  });

  it('renders EmptyState when there is no error and no contents', () => {
    render(
      <CategoryListPage
        type="BEASISWA"
        contents={[]}
        pagination={emptyPagination}
        tags={[]}
        currentQuery=""
        currentTag=""
        currentSort="published_at_desc"
        currentAvailability=""
        error={null}
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Belum Ada Informasi Beasiswa')).toBeInTheDocument();
    expect(
      screen.getByText('Belum ada informasi untuk saat ini. Nantikan pembaruan berikutnya.')
    ).toBeInTheDocument();
  });

  it('renders EmptyState with filter-specific guidance when filters are active', () => {
    render(
      <CategoryListPage
        type="BEASISWA"
        contents={[]}
        pagination={emptyPagination}
        tags={[]}
        currentQuery="robotika"
        currentTag=""
        currentSort="published_at_desc"
        currentAvailability="aktif"
        error={null}
      />
    );

    expect(screen.getByText('Belum Ada Informasi yang Sesuai')).toBeInTheDocument();
    expect(
      screen.getByText('Coba gunakan kata kunci lain atau ubah filter pencarian Anda.')
    ).toBeInTheDocument();
  });

  it('renders active filter chip in FilterBar when initialTag is provided', () => {
    render(
      <CategoryListPage
        type="BEASISWA"
        contents={[]}
        pagination={emptyPagination}
        tags={[{ id: 't1', name: 'Prestasi', slug: 'prestasi' }]}
        currentQuery=""
        currentTag="prestasi"
        currentSort="published_at_desc"
        currentAvailability="aktif"
        error="Koneksi ke server gagal. Coba lagi nanti."
      />
    );

    expect(screen.getByText('#Prestasi')).toBeInTheDocument();
    expect(screen.getByText('Status: Aktif')).toBeInTheDocument();
  });

  it('renders friendly result count text and content grid when contents exist', () => {
    const singleItemPagination: PaginationMeta = {
      page: 1,
      total_items: 1,
      total_pages: 1,
      has_next: false,
      has_prev: false,
    };

    render(
      <CategoryListPage
        type="BEASISWA"
        contents={sampleContents}
        pagination={singleItemPagination}
        tags={[]}
        currentQuery="degree"
        currentAvailability="aktif"
      />
    );

    const resultCount = screen.getByText(/Menampilkan/i).closest('p');
    expect(resultCount).toBeInTheDocument();
    expect(within(resultCount!).getByText('1')).toBeInTheDocument();
    expect(resultCount).toHaveTextContent(/yang masih aktif/i);
    expect(resultCount).toHaveTextContent(/degree/i);
    expect(screen.getByText('Beasiswa Indonesia Maju')).toBeInTheDocument();
  });
});
