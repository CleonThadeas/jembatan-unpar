import Link from 'next/link';
import { ArrowUpRight, Mail, Phone, MapPin, Instagram, Youtube, Linkedin } from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { BRAND_TAGLINE } from '@/lib/brand';

const information = [
  { href: '/beasiswa', label: 'Beasiswa' },
  { href: '/event', label: 'Event' },
  { href: '/kegiatan-kompetisi', label: 'Kegiatan & Kompetisi' },
  { href: '/promosi', label: 'Promosi' },
];

export function Footer(): React.JSX.Element {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'jembatan@unpar.ac.id';

  return (
    <footer className="mt-auto bg-brand-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-7">
        <div className="grid gap-10 border-b border-white/20 pb-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <BrandLogo className="h-12 w-auto mb-5" />
            <p className="font-display text-2xl sm:text-3xl font-bold">JEMBATAN<span className="text-gold-500">.</span></p>
            <p className="text-xs uppercase tracking-wider text-gold-400 font-semibold mt-1">{BRAND_TAGLINE}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">Wadah terpadu mahasiswa Universitas Katolik Parahyangan untuk informasi beasiswa, event, talenta mahasiswa, serta pelaporan kondisi lingkungan kampus secara aman dan terpercaya.</p>
            <Link href="/lapor/tentang" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gold-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400">Kenali inisiatif ini <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <nav aria-label="Kategori informasi" className="md:col-span-2">
            <h2 className="font-display text-xs uppercase tracking-widest font-bold text-gold-500 mb-5">Jelajahi</h2>
            <ul className="space-y-1">{information.map((item) => <li key={item.href}><Link href={item.href} className="inline-flex min-h-10 items-center text-sm text-white/80 hover:text-gold-500 transition-colors">{item.label}</Link></li>)}</ul>
          </nav>
          <nav aria-label="Layanan pelaporan" className="md:col-span-3">
            <h2 className="font-display text-xs uppercase tracking-widest font-bold text-gold-500 mb-5">Laporan</h2>
            <ul className="space-y-1">
              <li><Link href="/lapor" className="inline-flex min-h-10 items-center text-sm text-white/80 hover:text-gold-500 transition-colors">Laporkan Kondisi Kampus</Link></li>
              <li><Link href="/lapor/cek-laporan" className="inline-flex min-h-10 items-center text-sm text-white/80 hover:text-gold-500 transition-colors">Pantau laporan</Link></li>
              <li><Link href="/lapor/pemulihan" className="inline-flex min-h-10 items-center text-sm text-white/80 hover:text-gold-500 transition-colors">Pulihkan akses</Link></li>
            </ul>
          </nav>
          <div className="md:col-span-3">
            <h2 className="font-display text-xs uppercase tracking-widest font-bold text-gold-500 mb-5">Kontak</h2>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center gap-2.5 min-h-[44px] hover:text-gold-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold-500" aria-hidden="true" />
                  <span className="break-all">{contactEmail}</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+62222032655"
                  className="inline-flex items-center gap-2.5 min-h-[44px] hover:text-gold-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  <Phone className="h-4 w-4 shrink-0 text-gold-500" aria-hidden="true" />
                  <span>(022) 203-2655</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 pt-1">
                <MapPin className="h-4 w-4 shrink-0 text-gold-500 mt-1" aria-hidden="true" />
                <span className="leading-relaxed text-white/75">Jl. Ciumbuleuit No. 94, Bandung 40141</span>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram JEMBATAN UNPAR"
                className="inline-flex items-center justify-center w-11 h-11 text-white/80 hover:text-gold-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube JEMBATAN UNPAR"
                className="inline-flex items-center justify-center w-11 h-11 text-white/80 hover:text-gold-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
              >
                <Youtube className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn JEMBATAN UNPAR"
                className="inline-flex items-center justify-center w-11 h-11 text-white/80 hover:text-gold-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded"
              >
                <Linkedin className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-xs text-white/55 sm:flex-row sm:justify-between"><p>© {new Date().getFullYear()} JEMBATAN · Dikelola mahasiswa, didukung Universitas Katolik Parahyangan</p></div>
      </div>
    </footer>
  );
}
