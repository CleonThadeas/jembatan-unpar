import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { TRUTHFUL_BLOCKERS } from '@/lib/constants';
import { ReportPageHeader } from '@/components/report/ReportPageHeader';
import {
  FileText,
  Search,
  KeyRound,
  ShieldCheck,
  Lock,
  AlertTriangle,
  ArrowRight,
  Clock,
  Paperclip,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Panduan dan Batasan Layanan',
};

export default function TentangPage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <ReportPageHeader
        title="Panduan dan Batasan"
        description="Pelajari alur pengajuan laporan, cara memeriksa status tindak lanjut, prosedur pemulihan kode akses, komitmen privasi, serta batasan operasional layanan."
      />

      {/* Quick Navigation Anchor Links */}
      <nav aria-label="Navigasi Bagian Panduan" className="bg-slate-50 rounded-md border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Daftar Isi Panduan &amp; Batasan
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <a
            href="#buat-laporan"
            className="min-h-12 inline-flex items-center px-3.5 py-2 bg-white border border-slate-200 rounded-md text-brand-700 hover:border-brand-500 hover:text-brand-800 transition font-medium"
          >
            1. Buat Laporan
          </a>
          <a
            href="#cek-status"
            className="min-h-12 inline-flex items-center px-3.5 py-2 bg-white border border-slate-200 rounded-md text-brand-700 hover:border-brand-500 hover:text-brand-800 transition font-medium"
          >
            2. Cek Status
          </a>
          <a
            href="#pemulihan"
            className="min-h-12 inline-flex items-center px-3.5 py-2 bg-white border border-slate-200 rounded-md text-brand-700 hover:border-brand-500 hover:text-brand-800 transition font-medium"
          >
            3. Pemulihan Kode
          </a>
          <a
            href="#privasi"
            className="min-h-12 inline-flex items-center px-3.5 py-2 bg-white border border-slate-200 rounded-md text-brand-700 hover:border-brand-500 hover:text-brand-800 transition font-medium"
          >
            4. Privasi &amp; Kerahasiaan
          </a>
          <a
            href="#kode-akses"
            className="min-h-12 inline-flex items-center px-3.5 py-2 bg-white border border-slate-200 rounded-md text-brand-700 hover:border-brand-500 hover:text-brand-800 transition font-medium"
          >
            5. Kode Akses vs No. Referensi
          </a>
          <a
            href="#batasan"
            className="min-h-12 inline-flex items-center px-3.5 py-2 bg-white border border-slate-200 rounded-md text-brand-700 hover:border-brand-500 hover:text-brand-800 transition font-medium"
          >
            6. Batasan Layanan
          </a>
        </div>
      </nav>

      {/* 1. Buat Laporan */}
      <section
        id="buat-laporan"
        aria-labelledby="heading-buat-laporan"
        className="bg-white rounded-md shadow-sm border border-slate-200 p-6 sm:p-7 space-y-4 scroll-mt-28"
      >
        <div className="flex items-center space-x-2 text-brand-700 font-bold border-b border-slate-100 pb-3">
          <FileText className="w-5 h-5 text-brand-600" aria-hidden="true" />
          <h2 id="heading-buat-laporan" className="font-display text-lg font-bold text-brand-900">
            1. Panduan Membuat Laporan
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          Kanal pelaporan dirancang tanpa registrasi akun mahasiswa untuk mempermudah penyampaian aspirasi dan keluhan terkait kondisi lingkungan kampus. Alamat email pelapor tetap diverifikasi menggunakan kode OTP 6 digit sebelum laporan disimpan secara resmi.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-xs text-slate-600 space-y-1.5">
          <p className="font-semibold text-slate-900">Penyimpanan Draf di Memori (In-Memory):</p>
          <p className="leading-relaxed">
            Draf formulir dan tiket verifikasi disimpan secara aman hanya di memori sementara peramban (in-memory) dan tidak pernah ditulis ke media penyimpanan permanen (localStorage atau sessionStorage). Jika Anda memuat ulang (reload) atau menutup peramban sebelum laporan terkirim, draf yang belum diajukan akan terhapus.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <Paperclip className="w-4 h-4 text-brand-600" aria-hidden="true" />
              <span>Ketentuan Lampiran Bukti</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Maksimal <strong>3 file</strong> lampiran, dengan ukuran masing-masing hingga <strong>10 MB</strong>. Format berkas yang didukung adalah <strong>JPG, PNG, atau PDF</strong>.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <Clock className="w-4 h-4 text-brand-600" aria-hidden="true" />
              <span>Verifikasi OTP Pelaporan</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Kode OTP verifikasi email dikirimkan secara otomatis dan berlaku selama <strong>10 menit</strong> sejak diajukan, dengan jeda (cooldown) pengiriman ulang selama <strong>60 detik</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Cek Status */}
      <section
        id="cek-status"
        aria-labelledby="heading-cek-status"
        className="bg-white rounded-md shadow-sm border border-slate-200 p-6 sm:p-7 space-y-4 scroll-mt-28"
      >
        <div className="flex items-center space-x-2 text-brand-700 font-bold border-b border-slate-100 pb-3">
          <Search className="w-5 h-5 text-brand-600" aria-hidden="true" />
          <h2 id="heading-cek-status" className="font-display text-lg font-bold text-brand-900">
            2. Panduan Memeriksa Status Laporan
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          Setelah berhasil mengirimkan laporan, Anda mendapatkan satu Kode Akses Rahasia. Buka halaman{' '}
          <Link href="/lapor/cek-laporan" className="text-brand-600 font-semibold hover:underline">
            Cek Status Laporan
          </Link>{' '}
          dan masukkan kode akses tersebut untuk:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-600 pl-2">
          <li>Melihat perkembangan status penanganan (Menunggu, Diproses, Selesai, atau Ditolak).</li>
          <li>Membaca catatan resmi dari tim pengelola mahasiswa.</li>
          <li>Mengirim pesan klarifikasi atau bukti tambahan dalam ruang dialog dua arah.</li>
        </ul>
        <div className="space-y-3 pt-1">
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs text-slate-600">
            <p className="font-semibold text-slate-900 mb-1">Cakupan Akses Satu Laporan &amp; Keamanan Sesi:</p>
            <p className="leading-relaxed">
              Pada prototipe ini, sesi pelapor diamankan menggunakan token sesi di memori peramban tanpa akun login terpusat. Setiap kode akses rahasia secara ketat hanya membuka satu laporan yang bersangkutan.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs text-slate-600">
            <p className="font-semibold text-slate-900 mb-1">Proteksi Percobaan Gagal:</p>
            <p className="leading-relaxed">
              Gagal memasukkan kode akses sebanyak 5 kali berturut-turut akan membatasi percobaan akses selama 15 menit sebagai perlindungan dari upaya tebakan brute force.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Pemulihan */}
      <section
        id="pemulihan"
        aria-labelledby="heading-pemulihan"
        className="bg-white rounded-md shadow-sm border border-slate-200 p-6 sm:p-7 space-y-4 scroll-mt-28"
      >
        <div className="flex items-center space-x-2 text-brand-700 font-bold border-b border-slate-100 pb-3">
          <KeyRound className="w-5 h-5 text-brand-600" aria-hidden="true" />
          <h2 id="heading-pemulihan" className="font-display text-lg font-bold text-brand-900">
            3. Panduan Pemulihan Kode Akses
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          Jika Anda kehilangan atau lupa Kode Akses Rahasia, Anda dapat meminta pembuatan kode baru melalui halaman{' '}
          <Link href="/lapor/pemulihan" className="text-brand-600 font-semibold hover:underline">
            Pemulihan Kode
          </Link>
          .
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Mekanisme Keamanan Pemulihan:</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-600">
            <li>Memerlukan kombinasi alamat email terdaftar dan nomor referensi laporan yang valid.</li>
            <li>Kode OTP pemulihan 6 digit berlaku selama <strong>10 menit</strong> sejak diajukan, dengan jeda (cooldown) permintaan ulang <strong>60 detik</strong>.</li>
            <li>Sistem menerapkan kebijakan <em>anti-enumerasi</em>: pesan sukses generik ditampilkan tanpa membocorkan apakah data terdaftar atau tidak.</li>
            <li>Kode akses rahasia yang baru <strong>tidak pernah ditampilkan di layar</strong> formulir, melainkan dikirimkan langsung ke kotak masuk email pelapor terdaftar. Sesi lama dicabut seketika.</li>
          </ul>
        </div>
      </section>

      {/* 4. Privasi */}
      <section
        id="privasi"
        aria-labelledby="heading-privasi"
        className="bg-white rounded-md shadow-sm border border-slate-200 p-6 sm:p-7 space-y-4 scroll-mt-28"
      >
        <div className="flex items-center space-x-2 text-brand-700 font-bold border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-brand-600" aria-hidden="true" />
          <h2 id="heading-privasi" className="font-display text-lg font-bold text-brand-900">
            4. Makna Kerahasiaan &amp; Privasi
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          Kerahasiaan identitas dan isi laporan menjadi prioritas utama pengelolaan platform:
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-xs sm:text-sm text-slate-700 space-y-2">
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>Email pelapor dan rincian laporan <strong>tidak ditampilkan kepada publik</strong> atau sesama mahasiswa.</li>
            <li>Hanya tim pengelola mahasiswa yang berwenang yang dapat memeriksa dan menindaklanjuti laporan Anda.</li>
            <li>Sistem ini <strong>tidak menjamin anonimitas mutlak</strong> terhadap operator infrastruktur server, penyedia hosting jaringan, atau penyedia layanan email universitas.</li>
            <li>Siapa pun yang memiliki Kode Akses Rahasia dapat mengakses laporan. Mohon simpan kredensial Anda di tempat yang aman.</li>
          </ul>
        </div>
      </section>

      {/* 5. Kode Akses vs Nomor Referensi */}
      <section
        id="kode-akses"
        aria-labelledby="heading-kode-akses"
        className="bg-white rounded-md shadow-sm border border-slate-200 p-6 sm:p-7 space-y-4 scroll-mt-28"
      >
        <div className="flex items-center space-x-2 text-brand-700 font-bold border-b border-slate-100 pb-3">
          <Lock className="w-5 h-5 text-brand-600" aria-hidden="true" />
          <h2 id="heading-kode-akses" className="font-display text-lg font-bold text-brand-900">
            5. Dua Pengenal dengan Peran Berbeda
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2">
            <span className="font-bold text-slate-900 block text-sm">Nomor Referensi Publik</span>
            <p className="font-mono text-xs font-bold text-brand-700">Contoh: REP-YYYYMMDD-XXXXX</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Digunakan dalam subjek email, pencatatan administratif, atau formulir pemulihan kode. <strong>Nomor ini tidak memberikan hak akses langsung</strong> ke isi dialog atau detail laporan.
            </p>
          </div>

          <div className="p-4 bg-gold-50 border border-gold-400 rounded-md space-y-2">
            <span className="font-bold text-ink-900 block text-sm">Kode Akses Rahasia</span>
            <p className="font-mono text-xs font-bold text-gold-700">Contoh: XXXXX-XXXXX-XXXXX-XXXXX...</p>
            <p className="text-xs text-ink-600 leading-relaxed">
              Kredensial rahasia ber-entropi tinggi yang dibuat acak saat laporan dikirim. Berfungsi sebagai kata sandi tunggal untuk membaca balasan dan berdialog dengan tim pengelola.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Batasan Layanan */}
      <section
        id="batasan"
        aria-labelledby="heading-batasan"
        className="bg-white rounded-md shadow-sm border border-slate-200 p-6 sm:p-7 space-y-4 scroll-mt-28"
      >
        <div className="flex items-center space-x-2 text-gold-700 font-bold border-b border-slate-100 pb-3">
          <AlertTriangle className="w-5 h-5 text-gold-700" aria-hidden="true" />
          <h2 id="heading-batasan" className="font-display text-lg font-bold text-brand-900">
            6. Batasan Layanan &amp; Keterbukaan Teknis
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Kanal ini dikelola secara independen dalam lingkup mahasiswa dengan dukungan UNPAR. Untuk persoalan di luar kewenangan dan kapasitas tim mahasiswa, eskalasi maupun penyelesaian formal oleh pihak rektorat kampus tidak dapat dijamin.
        </p>

        <div className="space-y-3 text-xs pt-1">
          {TRUTHFUL_BLOCKERS.map((item, idx) => (
            <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-md">
              <span className="font-bold text-slate-900 block mb-1">
                {idx + 1}. {item.title}
              </span>
              <p className="text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <div className="text-center pt-2">
        <Link
          href="/lapor"
          className="inline-flex items-center space-x-2 min-h-[48px] px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-md shadow-sm text-sm transition"
        >
          <span>Mulai Pengajuan Laporan</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
