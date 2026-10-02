import React from 'react';
import type { Metadata } from 'next';
import { ReportDetailView } from '@/components/report/ReportDetailView';

export const metadata: Metadata = {
  title: 'Detail Laporan & Percakapan',
};

export default function ReportDetailPage(): React.JSX.Element {
  return <ReportDetailView />;
}
