# JEMBATAN — Prototype statis

Prototype mahasiswa **tidak resmi** untuk demonstrasi desain dan alur. Informasi, laporan, identitas, OTP dan kode akses adalah simulasi. Jangan memasukkan informasi pribadi atau berkas sungguhan. Tidak ada email/laporan yang dikirim ke backend. Foto internet adalah ilustrasi, bukan dokumentasi acara atau laporan.

## Folder

Proyek mandiri ini berada di `portal-guest-prototype`, bukan `portal-guest` asli. Tidak memerlukan backend/Go/PostgreSQL.

- `src/`: source React/Next.js.
- `public/images/demo/`: foto lokal internet; lihat `MEDIA_CREDITS.md`.
- `out/`: hasil build **HTML/CSS/JavaScript statis** untuk hosting.
- `src/lib/demo/`: fixture dan database browser.

## Menjalankan

Dari folder prototype:

```sh
npm ci
npm run dev
```

Development: http://localhost:3100. Untuk mencoba hasil HTML statis:

```sh
npm run build
npm start
```

Preview: http://127.0.0.1:3100. Jangan double-click HTML lewat `file://`; routing/aset dan database membutuhkan origin HTTP/HTTPS. Node hanya dibutuhkan untuk build/preview, **tidak dibutuhkan di GitHub Pages**.

## Data dan demo laporan

48 informasi: 12 Beasiswa, 12 Event, 12 Kegiatan & Kompetisi, 12 Promosi. Masing-masing kategori mempunyai 9 aktif dan 3 lewat tenggat berdasarkan **tanggal acuan demo** yang ditampilkan di Pusat Demo. Acuan default 2 Oktober 2026; tenggat fixture bersifat tetap, jadi `NEXT_PUBLIC_DEMO_DATE` (ISO timestamp) sebaiknya tidak diubah kecuali fixture ikut disesuaikan. Bukan tenggat atau penawaran resmi.

Buka **Pusat Demo** (`/demo/`) untuk enam laporan contoh, nomor referensi, email fiktif, kode contoh, dan inbox OTP/pemulihan. Buka inbox di tab kedua saat mencoba form agar draft tab pertama tetap tersedia. Gunakan email fiktif `pelapor1@example.com` atau alamat `example.com` lain.

1. Buat Laporan → isi data fiktif → minta OTP.
2. Lihat OTP di inbox simulasi Pusat Demo, masukkan pada wizard.
3. Review/submit → simpan kode demo yang muncul.
4. Cek Status Laporan → masukkan kode → lihat timeline/percakapan dan kirim balasan lokal.
5. Pemulihan → gunakan nomor referensi dan email fiktif → ikuti OTP inbox. Kode baru muncul di inbox, kode lama tidak berlaku.
6. Reset data demo mengembalikan contoh awal dan menghapus data buatan Anda di prototype ini saja.

IndexedDB menyimpan data di browser/origin yang dipakai. Data **tidak tersinkron ke teman, tab dengan origin berbeda, atau perangkat lain**. Sesi akses tetap in-memory dan perlu kode kembali setelah refresh. Mode browser privat, storage ditolak, quota penuh atau hapus data situs dapat membuat data hilang; UI menampilkan pesan status/failure. Fallback in-memory tidak bertahan setelah reload. Database ini **bukan keamanan atau autentikasi produksi**.

Lampiran disimpan lokal; jangan mengunggah berkas pribadi. Foto dan aset telah dibundel, tidak memakai hotlink gambar acak.

## GitHub Pages

### Cara yang disediakan: GitHub Actions

Repository: https://github.com/CleonThadeas/jembatan-unpar — situs setelah deploy: https://cleonthadeas.github.io/jembatan-unpar/

1. Repository Settings → Pages → Build and deployment → Source **GitHub Actions**.
2. Actions → **Deploy static prototype** → **Run workflow** (branch `main`).
3. Workflow memasang dependency, menjalankan checks, build, dan deploy `out/`.
4. Buka https://cleonthadeas.github.io/jembatan-unpar/ setelah job selesai.

Workflow hanya dipicu manual (`workflow_dispatch`), jadi push tidak otomatis deploy. BasePath otomatis `/<nama-repository>` untuk project-site, atau kosong untuk repository `<owner>.github.io`. Jika situs memakai custom (sub)domain sendiri, isi repository variable `PAGES_CUSTOM_DOMAIN` (Settings → Secrets and variables → Actions → Variables) agar basePath kosong, lalu jalankan ulang workflow. Tanggal acuan memakai default tetap 2 Oktober 2026 agar komposisi 9 aktif / 3 lewat tenggat selalu konsisten.

### Build manual untuk project-site

PowerShell:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/nama-repository'
npm run build
npm start
```

Preview pada http://127.0.0.1:3100/nama-repository/. Untuk root-site, hapus variabel tersebut sebelum build. **BasePath ditanam saat build**; mengganti nama repository memerlukan build ulang. Upload seluruh isi `out/`, termasuk `.nojekyll` dan `_next/`, bukan source TSX. Direktori halaman dengan `index.html` mendukung reload rute langsung.

GitHub Pages tidak menjalankan API/Next server serta tidak menerapkan fungsi `headers()` Next. Tidak ada cookie HttpOnly, backend auth, rate limiter server, atau email production di prototype. Pengamanan server/CSP nonce produksi memerlukan hosting/backend lain; jangan memakai demo sebagai layanan laporan nyata.

## Checks

```sh
npm test
npm run type-check
npm run lint
npm test -- --coverage
npm run build
```

E2E (butuh `npm start` berjalan di :3100): `npx playwright test`. Hasil verifikasi aktual ada di `docs/QA-EVIDENCE.md`.
