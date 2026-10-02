import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ReportRecoveryForm } from '@/components/report/ReportRecoveryForm';

export const metadata: Metadata = {
  title: 'Pemulihan Kode Akses',
};

export default function PemulihanPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-md border border-slate-200 p-8 max-w-xl mx-auto text-center text-xs text-slate-500">
          Memuat formulir pemulihan...
        </div>
      }
    >
      <ReportRecoveryForm />
    </Suspense>
  );
}
