# QA evidence — prototype statis

Tanggal verifikasi: 2 Oktober 2026 (Windows 11, Node v24.19.0, Chrome sistem).

| Check | Perintah | Hasil |
|---|---|---|
| Type-check | `npm run type-check` | Lulus, tanpa error |
| Lint | `npm run lint` | `✔ No ESLint warnings or errors` |
| Unit/integrasi | `npx vitest run --coverage` | 39 file, 492 test lulus |
| Coverage (scope modul demo) | v8 | Statements 95.83%, Branches 86.39%, Functions 92.85%, Lines 95.83% |
| Build root | `npm run build` (basePath kosong) | Lulus |
| Build GitHub Pages | `NEXT_PUBLIC_BASE_PATH=/jembatan-unpar npm run build` | Lulus; aset memakai prefix `/jembatan-unpar/_next/...` |
| E2E root | `npx playwright test` terhadap `http://127.0.0.1:3100/` | 2 test lulus |
| E2E subpath | `NEXT_PUBLIC_BASE_PATH=/jembatan-unpar npx playwright test` | 2 test lulus |

## Cakupan E2E

1. 11 rute (beranda, 4 kategori, 4 halaman lapor, Pusat Demo, kredit foto): heading, banner prototype, dan reload langsung. Tanpa request `/api/` atau `:8080`, dan tanpa respons ≥400. Tidak ada overflow horizontal pada lebar 320/375/768/1024/1440/1920. Keempat foto lokal termuat.
2. Kode akses contoh dari Pusat Demo membuka detail laporan. Dialog reset dapat dibatalkan tanpa mengubah data.

## Isolasi dan keamanan

- Hash 111 file sumber `portal-guest` asli dibandingkan dengan `original-integrity.json`: **0 perubahan**.
- Pemindaian pola secret (API key, `sk-`, `ghp_`, AWS key, private key) pada source: hanya token palsu di file test, tanpa secret nyata.
- Bundle `out/` tidak memuat referensi `:8080`, `/api/v1`, atau email `@gmail.com`. Teks fixture domain kampus sudah diganti ke domain contoh.
- `getApiBaseUrl()` di `src/lib/api.ts` dipertahankan untuk kompatibilitas test. Fungsi ini tidak dipanggil oleh kode aplikasi.

## Catatan

- Tenggat fixture bersifat tetap terhadap tanggal acuan 2 Oktober 2026. Mengganti `NEXT_PUBLIC_DEMO_DATE` akan menggeser jumlah aktif/lewat tenggat, dan unit test akan menangkapnya. Karena itu workflow Pages memakai default tetap.
- Audit a11y otomatis (axe/Lighthouse) tidak dijalankan. Hanya pemeriksaan heading/landmark/label lewat E2E dan RTL.
