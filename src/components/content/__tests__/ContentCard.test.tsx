import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentCard } from '../ContentCard';
import { Content } from '@/types/content';

describe('ContentCard Component', () => {
  const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
  const pastDate = new Date(Date.now() - 86400000 * 30).toISOString();

  const sampleContent: Content = {
    id: 'sample-1',
    type: 'EVENT',
    title: 'Workshop Desain Grafis',
    slug: 'workshop-desain-grafis',
    summary: 'Pelatihan dasar desain untuk mahasiswa tingkat awal.',
    body: 'Deskripsi lengkap workshop.',
    status: 'PUBLISHED',
    organizer: 'Unit Kegiatan Mahasiswa Seni',
    location_or_url: 'Ruang Seminar B',
    event_start_at: futureDate,
    published_at: '2026-09-20T08:00:00Z',
    view_count: 42,
    created_at: '2026-09-20T08:00:00Z',
    updated_at: '2026-09-20T08:00:00Z',
    tags: [
      { id: 't-1', name: 'Desain', slug: 'desain' },
      { id: 't-2', name: 'Workshop', slug: 'workshop' },
    ],
  };

  it('renders content details, badges, and tags properly', () => {
    render(<ContentCard content={sampleContent} />);

    expect(screen.getByText('Workshop Desain Grafis')).toBeInTheDocument();
    expect(
      screen.getByText('Pelatihan dasar desain untuk mahasiswa tingkat awal.')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Unit Kegiatan Mahasiswa Seni').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Ruang Seminar B')).toBeInTheDocument();
    expect(screen.getByText(/#\s*Desain/)).toBeInTheDocument();
    expect(screen.getByText(/#\s*Workshop/)).toBeInTheDocument();
  });

  it('generates the correct href based on content type', () => {
    render(<ContentCard content={sampleContent} />);

    const titleLink = screen.getByRole('link', { name: 'Workshop Desain Grafis' });
    expect(titleLink).toHaveAttribute('href', '/event/workshop-desain-grafis');
  });

  it('renders correctly for beasiswa category link', () => {
    const beasiswaContent: Content = {
      ...sampleContent,
      type: 'BEASISWA',
      title: 'Beasiswa Prestasi 2026',
      slug: 'beasiswa-prestasi-2026',
    };

    render(<ContentCard content={beasiswaContent} />);
    const titleLink = screen.getByRole('link', { name: 'Beasiswa Prestasi 2026' });
    expect(titleLink).toHaveAttribute('href', '/beasiswa/beasiswa-prestasi-2026');
  });

  it('shows Berakhir badge and greys out card when content is expired', () => {
    const expiredContent: Content = {
      ...sampleContent,
      type: 'BEASISWA',
      title: 'Beasiswa Riset Ditutup',
      slug: 'beasiswa-riset-ditutup',
      registration_deadline: pastDate,
    };

    render(<ContentCard content={expiredContent} />);
    expect(screen.getByTestId('expired-badge')).toHaveTextContent('Berakhir');
    expect(screen.queryByTestId('active-badge')).not.toBeInTheDocument();

    const article = screen.getByRole('article');
    expect(article.className).toContain('opacity-85');
    const imageContainer = article.querySelector('.relative.aspect-\\[16\\/9\\]');
    expect(imageContainer?.className).toContain('grayscale');
  });

  it('does NOT show Berakhir badge for future active content', () => {
    const activeContent: Content = {
      ...sampleContent,
      type: 'BEASISWA',
      title: 'Beasiswa Riset Masih Buka',
      slug: 'beasiswa-riset-masih-buka',
      registration_deadline: futureDate,
    };

    render(<ContentCard content={activeContent} />);
    expect(screen.queryByTestId('expired-badge')).not.toBeInTheDocument();
    expect(screen.getByTestId('active-badge')).toHaveTextContent('Aktif');

    const article = screen.getByRole('article');
    expect(article.className).not.toContain('opacity-85');
  });

  it('includes animate-fade-up motion-reduce:animate-none on article', () => {
    render(<ContentCard content={sampleContent} />);
    const article = screen.getByRole('article');
    expect(article.className).toContain('animate-fade-up');
    expect(article.className).toContain('motion-reduce:animate-none');
  });

  it('provides visible focus indication on title link and avoids focus:outline-none', () => {
    render(<ContentCard content={sampleContent} />);
    const titleLink = screen.getByRole('link', { name: 'Workshop Desain Grafis' });
    expect(titleLink.className).not.toContain('focus:outline-none');
    expect(titleLink.className).toContain('focus-visible:outline');
  });
});
