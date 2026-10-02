import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetailFields } from '../DetailFields';
import { Content } from '@/types/content';

describe('DetailFields Component', () => {
  it('renders Beasiswa specific fields correctly per PRD §6', () => {
    const mockContent: Content = {
      id: 'b-1',
      type: 'BEASISWA',
      title: 'Beasiswa Unggulan',
      slug: 'beasiswa-unggulan',
      summary: 'Ringkasan beasiswa unggulan.',
      body: 'Isi artikel lengkap beasiswa.',
      status: 'PUBLISHED',
      organizer: 'Kementerian Pendidikan',
      registration_deadline: '2026-10-31T23:59:59Z',
      registration_url: 'https://beasiswa.kemdikbud.go.id',
      requirements: 'IPK minimal 3.25 dan surat rekomendasi.',
      view_count: 100,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    };

    render(<DetailFields content={mockContent} />);

    expect(screen.getByText('Penyelenggara')).toBeInTheDocument();
    expect(screen.getByText('Kementerian Pendidikan')).toBeInTheDocument();
    expect(screen.getByText('Batas Waktu Pendaftaran')).toBeInTheDocument();
    expect(screen.getByText('Persyaratan & Kriteria')).toBeInTheDocument();
    expect(screen.getByText('IPK minimal 3.25 dan surat rekomendasi.')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /daftar \/ akses portal beasiswa/i });
    expect(link).toHaveAttribute('href', 'https://beasiswa.kemdikbud.go.id');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders Event specific fields correctly per PRD §6', () => {
    const mockContent: Content = {
      id: 'e-1',
      type: 'EVENT',
      title: 'Seminar Nasional AI',
      slug: 'seminar-nasional-ai',
      summary: 'Ringkasan seminar AI.',
      body: 'Isi lengkap seminar AI.',
      status: 'PUBLISHED',
      organizer: 'BEM Fakultas Ilmu Komputer',
      event_start_at: '2026-10-15T09:00:00Z',
      event_end_at: '2026-10-15T15:00:00Z',
      location_or_url: 'Auditorium Utama & Zoom Online',
      registration_url: 'https://event.univ.ac.id/seminar-ai',
      view_count: 50,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    };

    render(<DetailFields content={mockContent} />);

    expect(screen.getByText('Penyelenggara')).toBeInTheDocument();
    expect(screen.getByText('BEM Fakultas Ilmu Komputer')).toBeInTheDocument();
    expect(screen.getByText('Jadwal Pelaksanaan')).toBeInTheDocument();
    expect(screen.getByText('Lokasi / Tautan Online')).toBeInTheDocument();
    expect(screen.getByText('Auditorium Utama & Zoom Online')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /pendaftaran event/i });
    expect(link).toHaveAttribute('href', 'https://event.univ.ac.id/seminar-ai');
  });

  it('renders Kegiatan & Kompetisi specific fields correctly per PRD §6', () => {
    const mockContent: Content = {
      id: 'k-1',
      type: 'KEGIATAN_KOMPETISI',
      title: 'Hackathon Mahasiswa Nasional 2026',
      slug: 'hackathon-nasional-2026',
      summary: 'Ringkasan hackathon nasional.',
      body: 'Isi lengkap panduan hackathon.',
      status: 'PUBLISHED',
      custom_metadata: { activity_type: 'Kompetisi Teknologi Informasi' },
      organizer: 'Himpunan Informatika',
      registration_deadline: '2026-11-01T08:00:00Z',
      location_or_url: 'Gedung Robotika Kampus',
      registration_url: 'https://hackathon.univ.ac.id',
      requirements: 'Tim 3 orang mahasiswa aktif.',
      view_count: 200,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    };

    render(<DetailFields content={mockContent} />);

    expect(screen.getByText('Jenis Kegiatan')).toBeInTheDocument();
    expect(screen.getByText('Kompetisi Teknologi Informasi')).toBeInTheDocument();
    expect(screen.getByText('Penyelenggara')).toBeInTheDocument();
    expect(screen.getByText('Himpunan Informatika')).toBeInTheDocument();
    expect(screen.getByText('Batas Pendaftaran')).toBeInTheDocument();
    expect(screen.getByText('Lokasi / Media')).toBeInTheDocument();
    expect(screen.getByText('Gedung Robotika Kampus')).toBeInTheDocument();
    expect(screen.getByText('Tim 3 orang mahasiswa aktif.')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /daftar kompetisi \/ kegiatan/i });
    expect(link).toHaveAttribute('href', 'https://hackathon.univ.ac.id');
  });

  it('renders Promosi specific fields correctly per PRD §6', () => {
    const mockContent: Content = {
      id: 'p-1',
      type: 'PROMOSI',
      title: 'Diskon 50% Cloud Subscription',
      slug: 'diskon-cloud-sub',
      summary: 'Ringkasan diskon mahasiswa.',
      body: 'Isi lengkap diskon cloud.',
      status: 'PUBLISHED',
      organizer: 'Mitra Cloud Edukasi',
      promo_period_start: '2026-09-01T00:00:00Z',
      promo_period_end: '2026-12-31T23:59:59Z',
      registration_url: 'https://cloud-provider.com/edu-promo',
      terms_and_conditions: 'Wajib verifikasi email student @student.ac.id.',
      view_count: 30,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    };

    render(<DetailFields content={mockContent} />);

    expect(screen.getByText('Penyedia / Mitra')).toBeInTheDocument();
    expect(screen.getByText('Mitra Cloud Edukasi')).toBeInTheDocument();
    expect(screen.getByText('Periode Berlaku')).toBeInTheDocument();
    expect(screen.getByText('Syarat & Ketentuan Promosi')).toBeInTheDocument();
    expect(screen.getByText('Wajib verifikasi email student @student.ac.id.')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /kunjungi penawaran \/ website/i });
    expect(link).toHaveAttribute('href', 'https://cloud-provider.com/edu-promo');
  });

  it('rejects unsafe URL schemes like javascript:', () => {
    const mockContent: Content = {
      id: 'bad-1',
      type: 'BEASISWA',
      title: 'Beasiswa Malicious',
      slug: 'beasiswa-bad',
      summary: 'Ringkasan beasiswa.',
      body: 'Isi beasiswa.',
      organizer: 'Bad Actor',
      status: 'PUBLISHED',
      registration_url: 'javascript:alert(1)',
      view_count: 1,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    };

    render(<DetailFields content={mockContent} />);

    // Link should not be rendered
    const link = screen.queryByRole('link', { name: /daftar \/ akses portal beasiswa/i });
    expect(link).toBeNull();
  });

  it('renders high-contrast labels and accessible external links with new-tab announcement', () => {
    const mockContent: Content = {
      id: 'k-2',
      type: 'KEGIATAN_KOMPETISI',
      title: 'Lomba Debat Nasional',
      slug: 'lomba-debat-nasional',
      summary: 'Lomba debat mahasiswa se-Indonesia.',
      body: 'Detail lengkap kompetisi.',
      organizer: 'Unit Debat Mahasiswa',
      status: 'PUBLISHED',
      registration_url: 'https://debat.univ.ac.id/daftar',
      view_count: 15,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    };

    render(<DetailFields content={mockContent} />);

    // Check high-contrast label class
    const label = screen.getByText('Penyelenggara');
    expect(label.className).toContain('text-brand-950');
    expect(label.className).not.toContain('/70');

    // Check brand-dark CTA uses bg-brand-800 for >= 4.5:1 contrast
    const link = screen.getByRole('link', { name: /daftar kompetisi \/ kegiatan/i });
    expect(link.className).toContain('bg-brand-800');
    expect(link.className).not.toContain('bg-brand-600');

    // Check screen reader announcement for new tab
    expect(screen.getByText('(terbuka di tab baru)')).toHaveClass('sr-only');
  });

  it('renders semantic definition list <dl>, <dt>, and <dd> elements for key facts', () => {
    const mockContent: Content = {
      id: 'b-sem',
      type: 'BEASISWA',
      title: 'Beasiswa Semantik',
      slug: 'beasiswa-semantik',
      summary: 'Ringkasan.',
      body: 'Isi artikel.',
      status: 'PUBLISHED',
      organizer: 'Yayasan Parahyangan',
      registration_deadline: '2026-11-30T23:59:59Z',
      requirements: 'Syarat lengkap.',
      view_count: 50,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    };

    const { container } = render(<DetailFields content={mockContent} />);

    const dl = container.querySelector('dl');
    expect(dl).toBeInTheDocument();

    const dts = container.querySelectorAll('dt');
    expect(dts.length).toBeGreaterThanOrEqual(2);

    const dds = container.querySelectorAll('dd');
    expect(dds.length).toBeGreaterThanOrEqual(2);
  });

  it('handles expired Promosi content with specific closed notice and disabled state', () => {
    const pastDate = new Date(Date.now() - 86400000 * 10).toISOString();
    const expiredPromo: Content = {
      id: 'p-exp',
      type: 'PROMOSI',
      title: 'Diskon Buku',
      slug: 'diskon-buku',
      summary: 'Diskon buku selesai.',
      body: 'Isi lengkap.',
      status: 'PUBLISHED',
      organizer: 'Toko Buku Kampus',
      promo_period_end: pastDate,
      registration_url: 'https://tokobuku.com/diskon',
      view_count: 10,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-01T00:00:00Z',
    };

    render(<DetailFields content={expiredPromo} />);

    expect(screen.getByText('Periode Penawaran Berakhir')).toBeInTheDocument();
    const disabledIndicator = screen.getByText('Periode Penawaran Berakhir').closest('[aria-disabled="true"]');
    expect(disabledIndicator).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /kunjungi penawaran/i })).toBeNull();
  });
});
