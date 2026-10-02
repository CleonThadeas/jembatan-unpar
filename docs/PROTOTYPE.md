# Spesifikasi prototype

## Produk
Untuk teman mencoba portal informasi dan laporan tanpa backend. Pertahankan UI portal sumber, deploy HTML/CSS/JS static export ke GitHub Pages, semua perubahan dalam sibling. Semua records fiktif dan media ilustrasi dengan disclosure permanen.

## Arsitektur
Next14/React18/Tailwind → static export `out/`. CMS memakai fixture lokal yang tersedia saat build/client. Laporan memakai adapter API dengan kontrak UI yang sama → layanan simulasi → IndexedDB melalui idb. OTP/recovery masuk inbox lokal. Sessions/tickets demo bukan authentication produksi. Database khusus prototype; fallback memory jika storage unavailable.

## Tugas/acceptance
- [ ] Export root/subpath dan reload halaman/detail tanpa server API.
- [ ] 48 informasi, 12/kategori, tiga expired per kategori pada clock demo.
- [ ] Enam laporan contoh; submit/akses/balasan/pemulihan/reset lokal.
- [ ] Foto lokal internet dengan alt/kredit/licensing; no endorsement.
- [ ] Disclaimer, status persistence dan error jelas.
- [ ] TDD/tests/typecheck/lint/build; E2E alur utama; integrity source asli.
- [ ] README/Pages workflow manual; tidak deploy otomatis.

Pemeriksaan hasil aktual dicatat terpisah pada evidence QA, bukan disimpulkan dari checklist ini.
