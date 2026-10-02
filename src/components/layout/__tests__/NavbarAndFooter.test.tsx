import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

let currentPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
}));

describe('Navbar and Footer Navigation Links', () => {
  beforeEach(() => {
    currentPathname = '/';
  });
  it('Navbar renders CTA link to internal /lapor', () => {
    render(<Navbar />);

    const ctaLinks = screen.getAllByRole('link', { name: /Laporkan Kondisi Kampus/i });
    expect(ctaLinks.length).toBeGreaterThan(0);
    ctaLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/lapor');
    });
  });

  it('Navbar logo renders UNPAR brand image and accessible link name (WCAG 2.5.3)', () => {
    render(<Navbar />);

    const logoLink = screen.getByRole('link', { name: /JEMBATAN.*beranda/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
    expect(logoLink).not.toHaveAttribute('aria-label');

    const logoImg = screen.getByAltText('Universitas Katolik Parahyangan');
    expect(logoImg).toBeInTheDocument();
  });

  it('marks active navigation link with aria-current="page"', () => {
    render(<Navbar />);

    // The home logo is the always-visible current-page link on '/'.
    expect(screen.getByRole('link', { name: /JEMBATAN.*beranda/i })).toHaveAttribute('aria-current', 'page');

    // Inactive links must not have aria-current="page"
    const beasiswaLink = screen.getByRole('link', { name: /Beasiswa/i });
    expect(beasiswaLink).not.toHaveAttribute('aria-current');
  });

  it('closes mobile navigation on Escape key press and returns focus to toggle button', () => {
    render(<Navbar />);

    const toggleButton = screen.getByRole('button', { name: /Buka navigasi/i });
    expect(screen.queryByRole('navigation', { name: /Navigasi seluler/i })).not.toBeInTheDocument();

    // Open mobile menu
    fireEvent.click(toggleButton);
    expect(screen.getByRole('navigation', { name: /Navigasi seluler/i })).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });

    // Menu should be closed
    expect(screen.queryByRole('navigation', { name: /Navigasi seluler/i })).not.toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveFocus();
  });

  it('marks mobile Beranda link as current page on home route', () => {
    render(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: /Buka navigasi/i }));

    expect(screen.getByRole('link', { name: 'Beranda' })).toHaveAttribute('aria-current', 'page');
  });

  it('Footer renders internal links to /lapor and /lapor/cek-laporan without external attributes', () => {
    render(<Footer />);

    const kirimLaporanLink = screen.getByRole('link', { name: /Laporkan Kondisi Kampus/i });
    expect(kirimLaporanLink).toHaveAttribute('href', '/lapor');
    expect(kirimLaporanLink).not.toHaveAttribute('target');

    const cekProgresLink = screen.getByRole('link', { name: /Pantau laporan/i });
    expect(cekProgresLink).toHaveAttribute('href', '/lapor/cek-laporan');
    expect(cekProgresLink).not.toHaveAttribute('target');
  });

  it('Footer contains JEMBATAN branding and stewardship note', () => {
    render(<Footer />);

    const brandElements = screen.getAllByText(/JEMBATAN/);
    expect(brandElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByAltText('Universitas Katolik Parahyangan')).toBeInTheDocument();
    expect(screen.getByText(/Dikelola mahasiswa, didukung Universitas Katolik Parahyangan/i)).toBeInTheDocument();
  });

  it('Footer renders Kontak section with mailto link, tel link, and address', () => {
    render(<Footer />);

    expect(screen.getByRole('heading', { level: 2, name: /Kontak/i })).toBeInTheDocument();

    const emailLink = screen.getByRole('link', { name: /@unpar\.ac\.id/i });
    expect(emailLink).toHaveAttribute('href', expect.stringMatching(/^mailto:/));

    const phoneLink = screen.getByRole('link', { name: /\(022\) 203-2655/i });
    expect(phoneLink).toHaveAttribute('href', 'tel:+62222032655');

    expect(screen.getByText(/Jl\. Ciumbuleuit No\. 94, Bandung 40141/i)).toBeInTheDocument();
  });

  it('Footer renders social links with external attributes and accessible labels', () => {
    render(<Footer />);

    const instagramLink = screen.getByRole('link', { name: /Instagram/i });
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/');
    expect(instagramLink).toHaveAttribute('target', '_blank');
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');

    const youtubeLink = screen.getByRole('link', { name: /YouTube/i });
    expect(youtubeLink).toHaveAttribute('href', 'https://youtube.com/');
    expect(youtubeLink).toHaveAttribute('target', '_blank');
    expect(youtubeLink).toHaveAttribute('rel', 'noopener noreferrer');

    const linkedinLink = screen.getByRole('link', { name: /LinkedIn/i });
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/');
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  describe('Contextual Navbar - Report Mode (/lapor and /lapor/*)', () => {
    it('renders 4 report navigation links and gold CTA to Informasi Kampus on /lapor', () => {
      currentPathname = '/lapor';
      render(<Navbar />);

      // Must have 4 report links
      const buatLaporLink = screen.getByRole('link', { name: 'Buat Laporan' });
      const cekLaporLink = screen.getByRole('link', { name: 'Cek Status Laporan' });
      const pemulihanLink = screen.getByRole('link', { name: 'Pemulihan Kode' });
      const panduanLink = screen.getByRole('link', { name: 'Panduan dan Batasan' });

      expect(buatLaporLink).toHaveAttribute('href', '/lapor');
      expect(cekLaporLink).toHaveAttribute('href', '/lapor/cek-laporan');
      expect(pemulihanLink).toHaveAttribute('href', '/lapor/pemulihan');
      expect(panduanLink).toHaveAttribute('href', '/lapor/tentang');

      // Information mode category links should NOT be rendered in report mode
      expect(screen.queryByRole('link', { name: 'Beasiswa' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Event' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Kegiatan & Kompetisi' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Promosi' })).not.toBeInTheDocument();

      // Gold CTA points to '/' with text "Informasi Kampus"
      const ctaLinks = screen.getAllByRole('link', { name: /Informasi Kampus/i });
      expect(ctaLinks.length).toBeGreaterThan(0);
      ctaLinks.forEach((link) => {
        expect(link).toHaveAttribute('href', '/');
      });
    });

    it('marks active navigation links based on segment boundaries in report mode', () => {
      // 1. exact match on /lapor for Buat Laporan
      currentPathname = '/lapor';
      const { unmount: u1 } = render(<Navbar />);
      expect(screen.getByRole('link', { name: 'Buat Laporan' })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('link', { name: 'Cek Status Laporan' })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: 'Pemulihan Kode' })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: 'Panduan dan Batasan' })).not.toHaveAttribute('aria-current');
      u1();

      // Buat Laporan is exact only, so /lapor/cek-laporan does not mark Buat Laporan as active
      currentPathname = '/lapor/cek-laporan';
      const { unmount: u2 } = render(<Navbar />);
      expect(screen.getByRole('link', { name: 'Buat Laporan' })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: 'Cek Status Laporan' })).toHaveAttribute('aria-current', 'page');
      u2();

      // Cek Status Laporan is active also on /lapor/detail or /lapor/detail/*
      currentPathname = '/lapor/detail/rep-xyz-123';
      const { unmount: u3 } = render(<Navbar />);
      expect(screen.getByRole('link', { name: 'Cek Status Laporan' })).toHaveAttribute('aria-current', 'page');
      u3();

      // Pemulihan Kode active on /lapor/pemulihan
      currentPathname = '/lapor/pemulihan';
      const { unmount: u4 } = render(<Navbar />);
      expect(screen.getByRole('link', { name: 'Pemulihan Kode' })).toHaveAttribute('aria-current', 'page');
      u4();

      // Panduan dan Batasan active on /lapor/tentang
      currentPathname = '/lapor/tentang';
      const { unmount: u5 } = render(<Navbar />);
      expect(screen.getByRole('link', { name: 'Panduan dan Batasan' })).toHaveAttribute('aria-current', 'page');
      u5();

      // Segment boundary check: /lapor/pemulihan-palsu must NOT activate Pemulihan Kode
      currentPathname = '/lapor/pemulihan-palsu';
      const { unmount: u6 } = render(<Navbar />);
      expect(screen.getByRole('link', { name: 'Pemulihan Kode' })).not.toHaveAttribute('aria-current');
      u6();

      // Segment boundary check: /lapor/detail-palsu must NOT activate Cek Status Laporan
      currentPathname = '/lapor/detail-palsu';
      const { unmount: u7 } = render(<Navbar />);
      expect(screen.getByRole('link', { name: 'Cek Status Laporan' })).not.toHaveAttribute('aria-current');
      u7();
    });

    it('renders identical configuration in mobile menu for report mode and closes on selection', () => {
      currentPathname = '/lapor/cek-laporan';
      render(<Navbar />);

      const toggleButton = screen.getByRole('button', { name: /Buka navigasi/i });
      fireEvent.click(toggleButton);

      const mobileNav = screen.getByRole('navigation', { name: /Navigasi seluler/i });
      expect(mobileNav).toBeInTheDocument();

      // Mobile nav has same 4 links
      const mobileBuatLapor = within(mobileNav).getByRole('link', { name: 'Buat Laporan' });
      const mobileCekLapor = within(mobileNav).getByRole('link', { name: 'Cek Status Laporan' });
      const mobilePemulihan = within(mobileNav).getByRole('link', { name: 'Pemulihan Kode' });
      const mobilePanduan = within(mobileNav).getByRole('link', { name: 'Panduan dan Batasan' });
      const mobileCta = within(mobileNav).getByRole('link', { name: /Informasi Kampus/i });

      expect(mobileBuatLapor).toHaveAttribute('href', '/lapor');
      expect(mobileCekLapor).toHaveAttribute('href', '/lapor/cek-laporan');
      expect(mobileCekLapor).toHaveAttribute('aria-current', 'page');
      expect(mobilePemulihan).toHaveAttribute('href', '/lapor/pemulihan');
      expect(mobilePanduan).toHaveAttribute('href', '/lapor/tentang');
      expect(mobileCta).toHaveAttribute('href', '/');

      // 48px touch targets check: links and button have minimum 48px height class (min-h-12 or min-h-[48px])
      expect(toggleButton).toHaveClass('h-12');
      expect(mobileBuatLapor).toHaveClass('min-h-12');
      expect(mobileCekLapor).toHaveClass('min-h-12');
      expect(mobilePemulihan).toHaveClass('min-h-12');
      expect(mobilePanduan).toHaveClass('min-h-12');
      expect(mobileCta).toHaveClass('min-h-12');

      // jsdom cannot navigate; keep the click handler while preventing native navigation.
      mobileBuatLapor.addEventListener('click', (event) => event.preventDefault());
      fireEvent.click(mobileBuatLapor);
      expect(screen.queryByRole('navigation', { name: /Navigasi seluler/i })).not.toBeInTheDocument();
    });

    it('preserves Escape key focus restoration in report mode', () => {
      currentPathname = '/lapor';
      render(<Navbar />);

      const toggleButton = screen.getByRole('button', { name: /Buka navigasi/i });
      fireEvent.click(toggleButton);
      expect(screen.getByRole('navigation', { name: /Navigasi seluler/i })).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('navigation', { name: /Navigasi seluler/i })).not.toBeInTheDocument();
      expect(toggleButton).toHaveFocus();
    });
  });

  describe('Contextual Navbar - Information Mode segment boundaries', () => {
    it('respects segment boundary for category links', () => {
      currentPathname = '/beasiswa/slug-item';
      const { unmount: u1 } = render(<Navbar />);
      expect(screen.getByRole('link', { name: 'Beasiswa' })).toHaveAttribute('aria-current', 'page');
      u1();

      currentPathname = '/beasiswa-palsu';
      const { unmount: u2 } = render(<Navbar />);
      expect(screen.getByRole('link', { name: 'Beasiswa' })).not.toHaveAttribute('aria-current');
      u2();
    });
  });
});
