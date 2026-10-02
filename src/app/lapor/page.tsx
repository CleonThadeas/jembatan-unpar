import React from 'react';
import { ReportWizard } from '@/components/report/ReportWizard';
import { ReportPageHeader } from '@/components/report/ReportPageHeader';

export default function LaporPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <ReportPageHeader
        title="Buat Laporan"
        description="Sampaikan kondisi di lingkungan kampus yang membuat Anda tidak nyaman kepada tim mahasiswa. Tanpa registrasi akun; email Anda diverifikasi sebelum laporan dikirim."
        guideHref="/lapor/tentang#buat-laporan"
      />

      {/* Main Wizard */}
      <ReportWizard />
    </div>
  );
}
