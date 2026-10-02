import Link from 'next/link';

export function DemoBanner() {
  return (
    <aside aria-label="Pemberitahuan prototype" className="bg-amber-100 border-b border-amber-300 text-amber-950">
      <div className="container-page py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs leading-relaxed">
        <p><strong>PROTOTYPE • Bukan layanan resmi.</strong> Data simulasi dan foto ilustrasi. Jangan masukkan data pribadi atau kode sungguhan.</p>
        <Link href="/demo" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center font-semibold underline underline-offset-4">Pusat Demo — OTP &amp; kode contoh</Link>
      </div>
    </aside>
  );
}
