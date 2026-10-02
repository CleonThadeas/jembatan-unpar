import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '../HeroSection';

describe('HeroSection Component', () => {
  it('renders hero titles and category navigation links', () => {
    render(<HeroSection />);

    expect(screen.getByText(/JEMBATAN · Universitas Katolik Parahyangan/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /JEMBATAN/i })).toBeInTheDocument();
    expect(screen.getByText(/Jaringan Aspirasi, Beasiswa, dan Talenta Mahasiswa/i)).toBeInTheDocument();
    expect(screen.getByText(/Dikelola mahasiswa, didukung UNPAR/i)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Beasiswa/i })).toHaveAttribute('href', '/beasiswa');
    expect(screen.getByRole('link', { name: /Event/i })).toHaveAttribute('href', '/event');
    expect(screen.getByRole('link', { name: /Kegiatan & Kompetisi/i })).toHaveAttribute('href', '/kegiatan-kompetisi');
    expect(screen.getByRole('link', { name: /Promosi/i })).toHaveAttribute('href', '/promosi');
  });

  it('links to student-led reporting and private tracking', () => {
    render(<HeroSection />);

    expect(screen.getByText(/Dengar · Kaji · Kawal/i)).toBeInTheDocument();
    expect(screen.getByText(/sesuai kapasitas program ini/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Laporkan Sekarang/i })).toHaveAttribute('href', '/lapor');
    expect(screen.getByRole('link', { name: /Pantau laporan/i })).toHaveAttribute('href', '/lapor/cek-laporan');
  });

  it('renders UNPAR rektorat background image as decorative background', () => {
    const { container } = render(<HeroSection />);
    const bgImg = container.querySelector('img[src*="gedung-rektorat-unpar.jpg"]');
    expect(bgImg).toBeInTheDocument();
    expect(bgImg).toHaveAttribute('alt', '');
  });
});
