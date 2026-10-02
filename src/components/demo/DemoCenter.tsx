'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getDemoOverview, resetDemoDatabase } from '@/lib/api-client';

type Overview = Awaited<ReturnType<typeof getDemoOverview>>;

export function DemoCenter() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [notice, setNotice] = useState('');
  const isResettingRef = useRef(false);
  const load = useCallback(async () => {
    try {
      setOverview(await getDemoOverview());
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Data demo tidak dapat dibaca.');
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    const refresh = async () => {
      // Polling during a reset could read the half-cleared database and show stale codes.
      if (isResettingRef.current) return;
      try {
        const data = await getDemoOverview();
        if (isActive && !isResettingRef.current) setOverview(data);
      } catch (err: unknown) {
        if (isActive) setError(err instanceof Error ? err.message : 'Gagal membaca inbox demo.');
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    const interval = window.setInterval(refresh, 2000);
    return () => { isActive = false; window.clearInterval(interval); window.removeEventListener('focus', refresh); };
  }, []);

  const handleReset = async () => {
    if (isResettingRef.current) return;
    isResettingRef.current = true;
    setIsResetting(true);
    try {
      await resetDemoDatabase();
      setIsConfirming(false);
      setNotice('Data demo dikembalikan ke contoh awal. Muat ulang tab laporan agar draft dan sesi lama dibersihkan.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset gagal. Data tidak dihapus.');
    } finally {
      isResettingRef.current = false;
      setIsResetting(false);
    }
    await load();
  };

  return (
    <div className="container-page py-10 space-y-8">
      <header className="max-w-3xl space-y-3">
        <p className="text-sm font-semibold text-brand-700">LINGKUNGAN SIMULASI</p>
        <h1 className="font-display text-3xl font-bold text-brand-900">Pusat Demo</h1>
        <p className="text-slate-600 leading-relaxed">Prototype ini tidak mengirim email atau laporan nyata. Gunakan email fiktif seperti pelapor1@example.com. Data tersimpan di browser ini, tidak dibagikan ke teman atau perangkat lain.</p>
        <p className="text-sm text-slate-600">Tanggal acuan informasi: <strong>{(process.env.NEXT_PUBLIC_DEMO_DATE || '2026-10-02T12:00:00.000Z').slice(0, 10)}</strong>. Jumlah aktif/lewat tenggat memakai tanggal demo ini.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/lapor" className="inline-flex items-center min-h-12 px-4 rounded-md bg-brand-700 text-white font-semibold">Coba buat laporan</Link>
          <Link href="/lapor/cek-laporan" className="inline-flex items-center min-h-12 px-4 border border-brand-700 rounded-md text-brand-800 font-semibold">Cek kode contoh</Link>
          <Link href="/demo/kredit" className="inline-flex items-center min-h-12 underline text-brand-800">Kredit foto ilustrasi</Link>
        </div>
      </header>
      {error && <p role="alert" className="p-4 border border-rose-200 bg-rose-50 text-rose-800 rounded-md">{error}</p>}
      {notice && <p role="status" className="p-4 border border-brand-200 bg-brand-50 text-brand-900 rounded-md">{notice}</p>}
      {!overview ? <p role="status">Menyiapkan database demo...</p> : <>
        <section className="border border-slate-200 bg-white rounded-md p-5 space-y-3">
          <h2 className="font-display text-xl font-bold text-brand-900">Penyimpanan lokal</h2>
          <p className="text-sm text-slate-600">Mode: {overview.storageMode}. Menghapus data situs/browser juga menghapus laporan buatan Anda.</p>
          {overview.storageWarning && <p role="alert" className="text-amber-900">{overview.storageWarning}</p>}
          {!isConfirming ? <button type="button" onClick={() => setIsConfirming(true)} className="min-h-12 px-4 border border-rose-300 rounded-md text-rose-800 font-semibold">Reset data demo</button> : <div className="space-y-3">
            <p role="alert" className="text-sm text-rose-800">Hapus semua laporan, balasan, lampiran, OTP, dan kode hasil pemulihan buatan Anda di prototype ini? Contoh awal akan dibuat kembali.</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" disabled={isResetting} onClick={handleReset} className="min-h-12 px-4 rounded-md bg-rose-700 text-white font-semibold disabled:opacity-50">{isResetting ? 'Mereset...' : 'Ya, reset database demo'}</button>
              <button type="button" disabled={isResetting} onClick={() => setIsConfirming(false)} className="min-h-12 px-4 border border-slate-300 rounded-md">Batal</button>
            </div>
          </div>}
        </section>
        <section aria-labelledby="demo-inbox" className="space-y-4">
          <h2 id="demo-inbox" className="font-display text-xl font-bold text-brand-900">Inbox simulasi — OTP dan pemulihan</h2>
          <p className="text-sm text-slate-600">Buka halaman ini di tab kedua saat mengisi laporan. Inbox diperbarui otomatis. Kode di sini hanya untuk simulasi, bukan rahasia produksi.</p>
          {overview.inbox.length === 0 ? <p className="p-5 border border-dashed border-slate-300 rounded-md text-slate-600">Belum ada pesan. Minta OTP atau pemulihan kode pada halaman laporan.</p> : <ul className="space-y-3">{overview.inbox.map((message) => <li key={message.id} className="p-5 bg-white border border-slate-200 rounded-md space-y-2 min-w-0">
            <h3 className="font-semibold text-brand-900">{message.subject}</h3>
            <p className="text-xs text-slate-600 break-all">{message.email} • {message.created_at}</p>
            <p className="whitespace-pre-wrap break-words text-sm text-slate-800 select-text">{message.body}</p>
          </li>)}</ul>}
        </section>
        <section aria-labelledby="demo-reports" className="space-y-4">
          <h2 id="demo-reports" className="font-display text-xl font-bold text-brand-900">Laporan contoh dan kode demo</h2>
          <p className="text-sm text-slate-600">Semua laporan fiktif. Salin kode ke Cek Status Laporan; nomor referensi dan email dapat dipakai untuk pemulihan.</p>
          <div className="grid gap-4 md:grid-cols-2">{overview.reports.map((report) => <article key={report.reference_number} className="p-5 bg-white border border-slate-200 rounded-md space-y-2 min-w-0">
            <span className="text-xs font-semibold text-brand-800">{report.status}</span>
            <h3 className="font-semibold text-slate-900">{report.title}</h3>
            <p className="text-xs text-slate-600 break-all">{report.reference_number} • {report.email}</p>
            <code className="block p-3 bg-slate-50 border border-slate-200 rounded text-sm break-all select-all">{report.access_code}</code>
          </article>)}</div>
        </section>
      </>}
    </div>
  );
}
