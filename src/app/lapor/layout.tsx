import React from 'react';
import type { Metadata } from 'next';
import { ReporterSessionProvider } from '@/context/ReporterSessionContext';

export const metadata: Metadata = {
  title: 'Laporan Kondisi Kampus',
  description:
    'Laporkan kondisi di kampus yang membuat Anda tidak nyaman kepada tim mahasiswa JEMBATAN tanpa membuat akun. Verifikasi email dan simpan kode akses rahasia Anda.',
};

export default function LaporLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <ReporterSessionProvider>
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </div>
    </ReporterSessionProvider>
  );
}
