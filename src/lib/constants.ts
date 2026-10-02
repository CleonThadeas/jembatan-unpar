import { ReportStatus, ReportPriority } from '@/types/report';

export const STATUS_LABELS: Record<ReportStatus, { label: string; description: string; color: string; badge: string }> = {
  BARU: {
    label: 'Baru',
    description: 'Laporan telah diterima sistem dan sedang menunggu peninjauan awal dari tim pengelola.',
    color: 'gold',
    badge: 'bg-gold-50 text-gold-700 border-gold-400',
  },
  DITINJAU: {
    label: 'Ditinjau',
    description: 'Laporan sedang ditinjau dan ditentukan penanggung jawab internal tim.',
    color: 'brand',
    badge: 'bg-brand-50 text-brand-700 border-brand-200',
  },
  DIPROSES: {
    label: 'Diproses',
    description: 'Tim sedang menindaklanjuti laporan. Kedua pihak dapat berkomunikasi melalui percakapan.',
    color: 'brand',
    badge: 'bg-brand-100 text-brand-900 border-brand-300',
  },
  MENUNGGU_BALASAN_PELAPOR: {
    label: 'Menunggu Balasan Pelapor',
    description: 'Tim pengelola membutuhkan informasi tambahan dari Anda. Balasan Anda akan mengembalikan status ke Diproses.',
    color: 'gold',
    badge: 'bg-gold-100 text-ink-900 border-gold-500',
  },
  SELESAI: {
    label: 'Selesai',
    description: 'Laporan telah dinyatakan selesai oleh tim pengelola. Riwayat tetap dapat dibaca, namun percakapan telah ditutup.',
    color: 'brand',
    badge: 'bg-brand-800 text-white border-brand-800',
  },
};

export const PRIORITY_LABELS: Record<ReportPriority, { label: string; badge: string }> = {
  P1: { label: 'P1 - Rendah', badge: 'bg-slate-100 text-slate-700 border-slate-300' },
  P2: { label: 'P2 - Rendah Menengah', badge: 'bg-brand-50 text-brand-700 border-brand-200' },
  P3: { label: 'P3 - Sedang', badge: 'bg-gold-50 text-gold-700 border-gold-400' },
  P4: { label: 'P4 - Tinggi', badge: 'bg-gold-100 text-ink-900 border-gold-500' },
  P5: { label: 'P5 - Mendesak', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const REPORTER_IMPACT_OPTIONS = [
  { value: 'Rendah', label: 'Rendah (Dampak kecil, tidak mengganggu perkuliahan)' },
  { value: 'Sedang', label: 'Sedang (Cukup mengganggu kenyamanan/kegiatan)' },
  { value: 'Tinggi', label: 'Tinggi (Sangat mengganggu aktivitas/layanan kampus)' },
  { value: 'Mendesak', label: 'Mendesak (Membutuhkan perhatian segera/potensi bahaya)' },
];

export const TRUTHFUL_BLOCKERS = [
  {
    id: 'magic-links',
    title: 'Verifikasi & Pemulihan Berbasis Token',
    description:
      'Tautan email mengirimkan kode/token sekali-pakai yang diinputkan ke formulir web (bukan auto-login redirect satu klik).',
  },
  {
    id: 'rotation',
    title: 'Rotasi Kode Akses Melalui Alur Pemulihan',
    description:
      'Rotasi kode akses baru dilakukan saat pengguna meminta pemulihan kode melalui email terdaftar, yang sekaligus membatalkan sesi lama.',
  },
  {
    id: 'logout',
    title: 'Pembersihan Sesi Lokal & Batas Cookie Server',
    description:
      'Sesi lokal di memori dibersihkan saat keluar. Cookie report_session berflag HttpOnly akan kedaluwarsa otomatis sesuai batas server (2 jam) karena backend v1 belum menyediakan endpoint pencabutan sesi server (/reports/logout).',
  },
  {
    id: 'smtp',
    title: 'Antrean Email (Outbox)',
    description:
      'Pada pengujian lokal tanpa relay SMTP aktif, token verifikasi dan pemulihan tercatat pada tabel email_outbox backend.',
  },
];
