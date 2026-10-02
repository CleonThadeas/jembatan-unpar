import type { Metadata } from 'next';
import Link from 'next/link';
import { assetPath } from '@/lib/demo/asset-path';

export const metadata: Metadata = { title: 'Kredit Foto Ilustrasi' };
const photos = [
  { file: 'library.jpg', title: 'Books in Black Wooden Book Shelf', author: 'Pixabay', url: 'https://www.pexels.com/photo/books-in-shelves-159711/', alt: 'Rak perpustakaan berisi buku' },
  { file: 'workshop.jpg', title: 'Group of People on a Conference Room', author: 'Christina Morillo', url: 'https://www.pexels.com/photo/people-sitting-near-table-with-laptop-1181406/', alt: 'Peserta berdiskusi di ruang konferensi' },
  { file: 'graduation.jpg', title: 'Newly Graduated People Throwing Hats Up in the Air', author: 'Pixabay', url: 'https://www.pexels.com/photo/photo-of-empty-classroom-267885/', alt: 'Lulusan melempar topi wisuda di luar ruangan' },
  { file: 'laptop.jpg', title: 'Woman Typing on Laptop', author: 'Startup Stock Photos', url: 'https://www.pexels.com/photo/brown-wooden-table-with-chair-7112/', alt: 'Seseorang mengetik menggunakan laptop di dekat jendela' },
];
export default function CreditPage() {
  return <div className="container-page py-10 space-y-6">
    <Link href="/demo" className="inline-flex min-h-12 items-center text-brand-800 underline">Kembali ke Pusat Demo</Link>
    <h1 className="font-display text-3xl text-brand-900 font-bold">Kredit Foto Ilustrasi</h1>
    <p className="max-w-3xl text-slate-600 leading-relaxed">Foto internet di prototype ini hanya ilustrasi. Bukan dokumentasi kegiatan dummy atau bukti laporan; orang di foto bukan pelapor. Penggunaan tidak menyiratkan dukungan fotografer atau institusi.</p>
    <a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center underline text-brand-800">Lisensi Pexels</a>
    <div className="grid gap-6 sm:grid-cols-2">{photos.map((photo) => <figure key={photo.file} className="border border-slate-200 rounded-md overflow-hidden bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={assetPath(`/images/demo/${photo.file}`)} alt={photo.alt} width={1200} height={800} loading="lazy" className="w-full aspect-video object-cover" />
      <figcaption className="p-5 space-y-2"><h2 className="font-semibold text-brand-900">{photo.title}</h2><p className="text-sm text-slate-600">{photo.author} • Pexels • Ilustrasi</p><a href={photo.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center text-brand-800 underline">Sumber foto</a></figcaption>
    </figure>)}</div>
    <p className="text-sm text-slate-600">Logo dan foto kampus yang berasal dari portal sumber dipertahankan hanya untuk demonstrasi desain. Tidak ada afiliasi atau endorsement resmi untuk prototype ini.</p>
  </div>;
}
