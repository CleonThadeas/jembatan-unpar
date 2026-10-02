import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MessageSquareText, ShieldCheck } from 'lucide-react';
import { assetPath } from '@/lib/demo/asset-path';

const paths = [
  { number: '01', label: 'Beasiswa', href: '/beasiswa' },
  { number: '02', label: 'Event', href: '/event' },
  { number: '03', label: 'Kegiatan & Kompetisi', href: '/kegiatan-kompetisi' },
  { number: '04', label: 'Promosi', href: '/promosi' },
];

export function HeroSection(): React.JSX.Element {
  return (
    <section className="relative isolate overflow-hidden bg-brand-900 text-white border-b-4 border-gold-500">
      {/* Background photo with gradient overlays for AA text contrast */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 select-none pointer-events-none">
        <Image
          src={assetPath('/images/gedung-rektorat-unpar.jpg')}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/85 to-brand-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent" />
      </div>
      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-1/2 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 46px, #fff 47px 48px, transparent 49px 96px)' }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-24 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-gold-500 mb-6">JEMBATAN · Universitas Katolik Parahyangan</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[4.4rem] font-bold leading-[1.08] tracking-tight max-w-3xl text-balance">
              JEMBATAN<span className="text-gold-500">.</span>
              <span className="block text-xl sm:text-2xl lg:text-3xl font-semibold text-gold-400 mt-3 font-sans tracking-normal">
                Jaringan Aspirasi, Beasiswa, dan Talenta Mahasiswa
              </span>
            </h1>
            <p className="mt-4 font-display text-lg text-white/90">
              Suara kita. Langkah bersama.
            </p>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/80 max-w-xl">
              Sampaikan aspirasi dan kondisi di lingkungan kampus yang membuat Anda tidak nyaman — fasilitas rusak, kebersihan, keamanan, layanan, hingga perilaku yang mengganggu — secara aman dan rahasia. Dikelola mahasiswa, didukung UNPAR.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/lapor" className="inline-flex min-h-12 items-center gap-3 bg-gold-500 px-5 py-3 font-display font-bold text-brand-950 hover:bg-gold-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Laporkan Sekarang <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link href="/lapor/cek-laporan" className="inline-flex min-h-12 items-center gap-2 border border-white/50 px-5 py-3 font-semibold text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Pantau laporan
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 border-t border-white/30 pt-5">
            <div className="flex items-center gap-3 mb-3 text-gold-500">
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">Dengar · Kaji · Kawal</span>
            </div>
            <p className="text-white/85 leading-relaxed text-sm sm:text-base">Ceritakan persoalan akademik, fasilitas, atau kesejahteraan mahasiswa. Tim mahasiswa akan menelaah dan mengawal tindak lanjutnya sesuai kapasitas program ini.</p>
            <p className="flex items-start gap-2 text-sm text-white/65 mt-5"><ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-gold-500" aria-hidden="true" /> Akses laporan pribadi memakai kode rahasia. Simpan kode Anda dengan aman.</p>
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/20 bg-brand-950/40">
        <nav aria-label="Jelajahi informasi" className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-4 sm:px-6 lg:px-8">
          {paths.map((path) => (
            <Link
              key={path.href}
              href={path.href}
              className="group flex min-h-[72px] sm:min-h-[92px] items-center justify-between gap-2 border-b sm:border-b-0 border-white/15 py-4 sm:py-5 px-3 sm:first:pl-0 sm:border-r sm:last:border-r-0 hover:text-gold-500 transition-colors focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none rounded-sm"
            >
              <span className="flex items-baseline gap-2"><span className="text-xs font-mono text-gold-500">{path.number}</span><span className="font-display text-sm sm:text-base font-semibold">{path.label}</span></span>
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
