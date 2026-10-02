import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Cek Status Laporan',
};

export default function CekLaporanLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
