import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ContentDetailPage } from '../ContentDetailPage';
import { Content } from '@/types/content';

describe('ContentDetailPage Component', () => {
  const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
  const pastDate = new Date(Date.now() - 86400000 * 30).toISOString();

  const baseContent: Content = {
    id: 'content-1',
    type: 'BEASISWA',
    title: 'Beasiswa Unggulan Merdeka',
    slug: 'beasiswa-unggulan-merdeka',
    summary: 'Bantuan biaya pendidikan penuh untuk mahasiswa berprestasi.',
    body: 'Paragraf pertama deskripsi beasiswa. Paragraf kedua berisi syarat detail.',
    status: 'PUBLISHED',
    organizer: 'Kementerian Pendidikan dan Kebudayaan',
    registration_deadline: futureDate,
    registration_url: 'https://beasiswa.kemdikbud.go.id',
    requirements: 'IPK minimal 3.50 dan TOEFL 500',
    published_at: '2026-09-15T08:00:00Z',
    created_at: '2026-09-10T08:00:00Z',
    updated_at: '2026-09-15T08:00:00Z',
    view_count: 256,
    hero_image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644',
    hero_image_alt: 'Mahasiswa belajar di perpustakaan',
    tags: [
      { id: 'tag-1', name: 'Pendidikan', slug: 'pendidikan' },
      { id: 'tag-2', name: 'Prestasi', slug: 'prestasi' },
    ],
  };

  it('renders breadcrumb navigation using semantic ordered list <ol> and <li> elements', () => {
    render(<ContentDetailPage content={baseContent} />);

    const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(breadcrumbNav).toBeInTheDocument();

    const ol = within(breadcrumbNav).getByRole('list');
    expect(ol.tagName.toLowerCase()).toBe('ol');

    const listItems = within(ol).getAllByRole('listitem');
    expect(listItems).toHaveLength(3);

    expect(within(listItems[0]).getByRole('link', { name: 'Beranda' })).toHaveAttribute('href', '/');
    expect(within(listItems[1]).getByRole('link', { name: 'Beasiswa' })).toHaveAttribute('href', '/beasiswa');

    const currentPage = within(listItems[2]).getByText('Beasiswa Unggulan Merdeka');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('renders editorial header with category badge, tags, title, organizer, publication date, and view count', () => {
    render(<ContentDetailPage content={baseContent} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Beasiswa Unggulan Merdeka' })).toBeInTheDocument();
    expect(screen.getAllByText('Kementerian Pendidikan dan Kebudayaan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Diterbitkan: 15 September 2026/i)).toBeInTheDocument();
    expect(screen.getByText('256 dilihat')).toBeInTheDocument();

    expect(screen.getByText('Pendidikan')).toBeInTheDocument();
    expect(screen.getByText('Prestasi')).toBeInTheDocument();
  });

  it('renders hero image when hero_image_url is valid and uses hero_image_alt', () => {
    render(<ContentDetailPage content={baseContent} />);

    const img = screen.getByAltText('Mahasiswa belajar di perpustakaan');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644');
  });

  it('falls back to title for image alt text when hero_image_alt is not provided', () => {
    const noAltContent: Content = {
      ...baseContent,
      hero_image_alt: undefined,
    };

    render(<ContentDetailPage content={noAltContent} />);

    const img = screen.getByAltText('Beasiswa Unggulan Merdeka');
    expect(img).toBeInTheDocument();
  });

  it('omits hero image container when hero_image_url is missing or unsafe', () => {
    const unsafeContent: Content = {
      ...baseContent,
      hero_image_url: 'javascript:alert(1)',
    };

    render(<ContentDetailPage content={unsafeContent} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders summary lead quotation when summary is present', () => {
    render(<ContentDetailPage content={baseContent} />);

    expect(screen.getByText(/Bantuan biaya pendidikan penuh untuk mahasiswa berprestasi/i)).toBeInTheDocument();
  });

  it('omits summary quotation block when summary is not provided', () => {
    const noSummaryContent: Content = {
      ...baseContent,
      summary: '',
    };

    render(<ContentDetailPage content={noSummaryContent} />);

    expect(screen.queryByText(/Bantuan biaya pendidikan penuh/i)).not.toBeInTheDocument();
  });

  it('renders category-specific DetailFields inside Informasi Khusus section', () => {
    render(<ContentDetailPage content={baseContent} />);

    const section = screen.getByRole('region', { name: 'Informasi Khusus' });
    expect(section).toBeInTheDocument();
    expect(within(section).getByText('Batas Waktu Pendaftaran')).toBeInTheDocument();
    expect(within(section).getByText('Persyaratan & Kriteria')).toBeInTheDocument();
  });

  it('renders full description body inside Deskripsi Lengkap section', () => {
    render(<ContentDetailPage content={baseContent} />);

    const section = screen.getByRole('region', { name: 'Deskripsi Lengkap' });
    expect(section).toBeInTheDocument();
    expect(within(section).getByRole('heading', { level: 2, name: 'Deskripsi Lengkap' })).toBeInTheDocument();
    expect(within(section).getByText(/Paragraf pertama deskripsi beasiswa/i)).toBeInTheDocument();
  });

  it('renders exactly one back navigation link at top with brand hover styling (no bottom duplicate)', () => {
    render(<ContentDetailPage content={baseContent} />);

    const backLinks = screen.getAllByRole('link', { name: /Kembali ke Daftar Beasiswa/i });
    expect(backLinks).toHaveLength(1);
    expect(backLinks[0]).toHaveAttribute('href', '/beasiswa');
    expect(backLinks[0]).toHaveClass('hover:text-brand-900');
  });

  it('gracefully falls back to BEASISWA category when content type is unrecognized', () => {
    const unrecognizedContent = {
      ...baseContent,
      type: 'UNKNOWN_TYPE' as any,
    };

    render(<ContentDetailPage content={unrecognizedContent} />);

    expect(screen.getAllByText('Beasiswa').length).toBeGreaterThanOrEqual(1);
    const backLinks = screen.getAllByRole('link', { name: /Kembali ke Daftar Beasiswa/i });
    expect(backLinks).toHaveLength(1);
  });

  it('applies WCAG AA compliant text contrast and touch target heights to navigation and metadata', () => {
    render(<ContentDetailPage content={baseContent} />);

    const breadcrumbNav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(breadcrumbNav.className).toContain('text-slate-600');
    expect(breadcrumbNav.className).not.toContain('text-slate-500');

    const backLinks = screen.getAllByRole('link', { name: /Kembali ke Daftar Beasiswa/i });
    expect(backLinks[0].className).toContain('min-h-[44px]');
  });

  it('renders tags with "#" prefix and links to category list with tag query parameter', () => {
    render(<ContentDetailPage content={baseContent} />);

    const tagLink1 = screen.getByRole('link', { name: /#?Pendidikan/i });
    expect(tagLink1).toHaveAttribute('href', '/beasiswa?tag=pendidikan');
    expect(tagLink1).toHaveTextContent('#Pendidikan');

    const tagLink2 = screen.getByRole('link', { name: /#?Prestasi/i });
    expect(tagLink2).toHaveAttribute('href', '/beasiswa?tag=prestasi');
    expect(tagLink2).toHaveTextContent('#Prestasi');
  });

  it('applies varied variant styling classes across different tags', () => {
    render(<ContentDetailPage content={baseContent} />);

    const tagLink1 = screen.getByRole('link', { name: /#?Pendidikan/i });
    const tagLink2 = screen.getByRole('link', { name: /#?Prestasi/i });

    expect(tagLink1.className).not.toEqual(tagLink2.className);
    expect(tagLink1.className).toContain('bg-brand-50');
    expect(tagLink2.className).toContain('bg-gold-50');
  });

  it('renders Aktif status badge when content is active', () => {
    render(<ContentDetailPage content={baseContent} />);

    expect(screen.getByText('Aktif')).toBeInTheDocument();
  });

  it('shows friendly expiry notice banner and marks registration CTA as closed when content is expired', () => {
    const expiredContent: Content = {
      ...baseContent,
      registration_deadline: pastDate,
    };

    render(<ContentDetailPage content={expiredContent} />);

    const notice = screen.getByRole('status', { name: /Pemberitahuan Konten Berakhir/i });
    expect(notice).toBeInTheDocument();
    expect(notice).toHaveTextContent('Pendaftaran beasiswa ini sudah berakhir');

    // Status badge shows Berakhir
    expect(screen.getByText('Berakhir')).toBeInTheDocument();

    // Registration link is replaced with disabled indicator
    expect(screen.queryByRole('link', { name: /Daftar \/ Akses Portal Beasiswa/i })).not.toBeInTheDocument();
    expect(screen.getByText('Pendaftaran Telah Ditutup')).toBeInTheDocument();
  });

  it('shows active registration CTA and omits expiry notice banner when content is active', () => {
    render(<ContentDetailPage content={baseContent} />);

    expect(screen.queryByRole('status', { name: /Pemberitahuan Konten Berakhir/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Daftar \/ Akses Portal Beasiswa/i })).toBeInTheDocument();
  });

  it('renders adapted expiry notice for EVENT content', () => {
    const expiredEvent: Content = {
      ...baseContent,
      type: 'EVENT',
      event_start_at: pastDate,
      event_end_at: pastDate,
    };

    render(<ContentDetailPage content={expiredEvent} />);

    const notice = screen.getByRole('status', { name: /Pemberitahuan Konten Berakhir/i });
    expect(notice).toHaveTextContent('Acara ini sudah berakhir');
    expect(screen.getByText('Pendaftaran Telah Ditutup')).toBeInTheDocument();
  });
});
