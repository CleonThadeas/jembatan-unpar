import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { BackButton } from '@/components/shared/BackButton';

const CATEGORY_LINK_CLASS =
  'text-brand-700 hover:underline px-3 py-2 bg-white border border-slate-200 rounded min-h-[44px] inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-700';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6">
        <FileQuestion className="w-12 h-12 text-gold-600 mx-auto" aria-hidden="true" />

        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-wider text-brand-700 uppercase">Informasi Tidak Tersedia</p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl font-display">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Maaf, halaman atau artikel informasi yang Anda cari tidak tersedia atau mungkin telah dipindahkan.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold text-white bg-brand-700 hover:bg-brand-800 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            <Home className="w-4 h-4 mr-2" aria-hidden="true" />
            Kembali ke Beranda
          </Link>
          <BackButton className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700" />
        </div>

        <nav aria-label="Kategori informasi" className="pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-3">Jelajahi kategori informasi:</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <Link href="/beasiswa" className={CATEGORY_LINK_CLASS}>
              Beasiswa
            </Link>
            <Link href="/event" className={CATEGORY_LINK_CLASS}>
              Event Kampus
            </Link>
            <Link href="/kegiatan-kompetisi" className={CATEGORY_LINK_CLASS}>
              Kegiatan & Kompetisi
            </Link>
            <Link href="/promosi" className={CATEGORY_LINK_CLASS}>
              Promosi Mahasiswa
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
