'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
  extraMatches?: string[];
}

const infoNavItems: NavItem[] = [
  { href: '/beasiswa', label: 'Beasiswa' },
  { href: '/event', label: 'Event' },
  { href: '/kegiatan-kompetisi', label: 'Kegiatan & Kompetisi' },
  { href: '/promosi', label: 'Promosi' },
];

const reportNavItems: NavItem[] = [
  { href: '/lapor', label: 'Buat Laporan', exact: true },
  { href: '/lapor/cek-laporan', label: 'Cek Status Laporan', extraMatches: ['/lapor/detail'] },
  { href: '/lapor/pemulihan', label: 'Pemulihan Kode' },
  { href: '/lapor/tentang', label: 'Panduan dan Batasan' },
];

function isSegmentActive(
  currentPath: string | null | undefined,
  targetHref: string,
  exact?: boolean
): boolean {
  if (!currentPath) return false;
  if (exact) return currentPath === targetHref;
  return currentPath === targetHref || currentPath.startsWith(targetHref + '/');
}

function checkItemActive(currentPath: string | null | undefined, item: NavItem): boolean {
  if (isSegmentActive(currentPath, item.href, item.exact)) {
    return true;
  }
  if (item.extraMatches && item.extraMatches.length > 0) {
    return item.extraMatches.some((extra) => isSegmentActive(currentPath, extra));
  }
  return false;
}

export function Navbar(): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const pathname = usePathname();

  const isReportMode = Boolean(pathname === '/lapor' || pathname?.startsWith('/lapor/'));
  const currentNavItems = isReportMode ? reportNavItems : infoNavItems;

  // Dismiss mobile dropdown on Escape and return focus to toggle button.
  // Avoid speculative focus trap because the dropdown is not modal.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-950/95 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[72px] sm:min-h-[76px] items-center justify-between gap-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            <BrandLogo priority className="h-10 w-auto sm:h-11 lg:h-12 shrink-0" />
            <span className="sr-only">JEMBATAN — beranda</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Navigasi utama"
            className={`items-center gap-1 ${isReportMode ? 'hidden xl:flex' : 'hidden lg:flex'}`}
          >
            {currentNavItems.map((item) => {
              const active = checkItemActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex min-h-12 items-center px-3 font-semibold text-sm border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 rounded-t-sm ${
                    active
                      ? 'border-gold-500 text-white'
                      : 'border-transparent text-white/80 hover:border-gold-400/60 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          {isReportMode ? (
            <Link
              href="/"
              className="hidden xl:inline-flex min-h-12 items-center gap-2 bg-gold-500 px-4 font-semibold text-sm text-brand-950 hover:bg-gold-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 rounded-sm"
            >
              Informasi Kampus <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href="/lapor"
              className="hidden lg:inline-flex min-h-12 items-center gap-2 bg-gold-500 px-4 font-semibold text-sm text-brand-950 hover:bg-gold-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 rounded-sm"
            >
              Laporkan Kondisi Kampus <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}

          {/* Mobile Toggle Button */}
          <button
            ref={toggleButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className={`flex h-12 w-12 items-center justify-center border border-white/25 text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 rounded-sm ${
              isReportMode ? 'xl:hidden' : 'lg:hidden'
            }`}
            aria-controls="mobile-navigation"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Navigasi seluler"
          className={`border-t border-white/10 bg-brand-950 px-4 py-3 sm:px-6 space-y-1 ${
            isReportMode ? 'xl:hidden' : 'lg:hidden'
          }`}
        >
          {isReportMode ? (
            <>
              {reportNavItems.map((item) => {
                const active = checkItemActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-12 items-center border-b border-white/10 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 ${
                      active ? 'text-gold-400' : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 flex min-h-12 items-center justify-between bg-gold-500 px-4 font-semibold text-brand-950 hover:bg-gold-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 rounded-sm"
              >
                Informasi Kampus <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={pathname === '/' ? 'page' : undefined}
                className={`flex min-h-12 items-center border-b border-white/10 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 ${
                  pathname === '/' ? 'text-gold-400' : 'text-white/90 hover:text-white'
                }`}
              >
                Beranda
              </Link>
              {infoNavItems.map((item) => {
                const active = checkItemActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-12 items-center border-b border-white/10 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 ${
                      active ? 'text-gold-400' : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/lapor"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 flex min-h-12 items-center justify-between bg-gold-500 px-4 font-semibold text-brand-950 hover:bg-gold-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 rounded-sm"
              >
                Laporkan Kondisi Kampus <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/lapor/cek-laporan"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-12 items-center text-white/90 font-semibold hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
              >
                Pantau laporan
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
