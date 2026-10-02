import { Content } from '@/types/content';
import { assetPath } from './asset-path';

export const DEMO_PROMOSI_ITEMS: Content[] = [
  // 9 Active Promotions (promo_period_end > 2026-10-02T12:00:00.000Z)
  {
    id: 'pro-01',
    title: 'Akses Gratis & Diskon 80% Ribuan Jurnal Internasional Mitra',
    slug: 'diskon-spesial-langganan-jurnal-dan-e-book-kampus',
    type: 'PROMOSI',
    status: 'PUBLISHED',
    summary:
      'Fasilitas akses cuma-cuma pangkalan data referensi jurnal ilmiah dan potongan harga langganan e-book akademik bagi mahasiswa.',
    body: `Perpustakaan Pusat bekerja sama dengan penerbit ilmiah internasional membuka akses penuh jutaan artikel jurnal bereputasi dari jaringan kampus maupun jaringan remote via single sign-on (SSO).

Selain akses baca gratis, mahasiswa aktif memperoleh diskon 80% untuk pembelian lisensi e-book textbook kurikulum resmi melalui portal perpustakaan digital mitra.

Catatan simulasi: Penawaran promosi ini disajikan untuk demonstrasi prototype.`,
    organizer: 'Perpustakaan Pusat & Penerbit Mitra Ilmiah',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi rak koleksi buku dan sarana akses e-book digital perpustakaan',
    registration_url: '/demo/simulasi-klaim?promo=langganan-jurnal-digital',
    promo_period_start: '2026-09-01T00:00:00.000Z',
    promo_period_end: '2026-12-31T23:59:59.000Z',
terms_and_conditions:
      '1. Khusus mahasiswa dan dosen berstatus aktif.\n2. Login menggunakan alamat email institusi resmi (contoh: nama@kampus-demo.example).\n3. Kuota download per pengguna 50 artikel per hari.',
    published_at: '2026-09-01T08:00:00.000Z',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
    view_count: 2780,
    tags: [
      { id: 'tag-promosi', name: 'Promosi', slug: 'promosi' },
      { id: 'tag-akademik', name: 'Akademik', slug: 'akademik' },
      { id: 'tag-diskon', name: 'Diskon', slug: 'diskon' },
    ],
  },
  {
    id: 'pro-02',
    title: 'Subsidi Voucher Ujian Sertifikasi Cloud Computing Internasional',
    slug: 'promo-sertifikasi-cloud-computing-aws-azure',
    type: 'PROMOSI',
    status: 'PUBLISHED',
    summary:
      'Voucher subsidi biaya ujian sertifikasi profesi cloud architect dan developer sebesar 75% bagi 200 mahasiswa pendaftar pertama.',
    body: `Pusat Teknologi Informasi dan Komunikasi universitas menyalurkan bantuan subsidi voucher ujian sertifikasi komputasi awan berstandar global. Program ini dirancang untuk mendongkrak daya saing kompetensi lulusan di pasar tenaga kerja industri teknologi.

Voucher mencakup akses materi pembelajaran resmi, simulasi ujian (practice exam), dan satu kali kesempatan ujian sertifikasi utama.

Catatan simulasi: Voucher sertifikasi dummy pada prototype portal.`,
    organizer: 'Pusat Teknologi Informasi & Komunikasi',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi laptop terhubung dashboard komputasi awan dan sertifikasi IT',
    registration_url: '/demo/simulasi-klaim?promo=voucher-sertifikasi-cloud',
    promo_period_start: '2026-09-15T00:00:00.000Z',
    promo_period_end: '2026-11-30T23:59:59.000Z',
terms_and_conditions:
      '1. Mahasiswa semester 5 ke atas dari semua program studi.\n2. Telah menuntaskan modul persiapan minimal 80% sebelum mengklaim voucher.\n3. Berlaku untuk 1 ujian per mahasiswa.',
    published_at: '2026-09-05T09:00:00.000Z',
    created_at: '2026-09-05T09:00:00.000Z',
    updated_at: '2026-09-05T09:00:00.000Z',
    view_count: 1950,
    tags: [
      { id: 'tag-promosi', name: 'Promosi', slug: 'promosi' },
      { id: 'tag-teknologi', name: 'Teknologi', slug: 'teknologi' },
      { id: 'tag-karir', name: 'Karir', slug: 'karir' },
    ],
  },
  {
    id: 'pro-03',
    title: 'Program Khusus Laptop & Tablet Belajar Cicilan 0% Bank Mitra',
    slug: 'penawaran-laptop-cicilan-nol-persen-mahasiswa',
    type: 'PROMOSI',
    status: 'PUBLISHED',
    summary:
      'Kemudahan kepemilikan laptop dan tablet penunjang kuliah dengan skema cicilan tanpa bunga hingga 12 bulan serta garansi resmi.',
    body: `Koperasi Mahasiswa bermitra dengan bank mitra kampus menghadirkan program kepemilikan gawai belajar terjangkau. Mahasiswa dapat memilih berbagai pilihan laptop bisnis dan tablet grafis bergaransi resmi distributor nasional.

Skema pembayaran menawarkan uang muka 0% dan tenor cicilan ringan 6 hingga 12 bulan yang didebet langsung secara aman melalui rekening tabungan mahasiswa.

Catatan simulasi: Penawaran cicilan simulasi prototipe.`,
    organizer: 'Koperasi Mahasiswa & Bank BNI Mitra Kampus',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi perangkat laptop dan tablet belajar di atas meja kayu',
    registration_url: '/demo/simulasi-klaim?promo=laptop-belajar-mahasiswa',
    promo_period_start: '2026-10-01T00:00:00.000Z',
    promo_period_end: '2026-11-15T23:59:59.000Z',
terms_and_conditions:
      '1. Mahasiswa aktif dengan melampirkan kartu tanda mahasiswa (KTM).\n2. Membawa surat persetujuan wali/orang tua.\n3. Berlaku selama persediaan unit masih tersedia.',
    published_at: '2026-09-10T10:00:00.000Z',
    created_at: '2026-09-10T10:00:00.000Z',
    updated_at: '2026-09-10T10:00:00.000Z',
    view_count: 2210,
    tags: [
      { id: 'tag-promosi', name: 'Promosi', slug: 'promosi' },
      { id: 'tag-perangkat', name: 'Perangkat', slug: 'perangkat' },
      { id: 'tag-diskon', name: 'Diskon', slug: 'diskon' },
    ],
  },
  {
    id: 'pro-04',
    title: 'Diskon 50% Kursus Intensif Persiapan TOEFL ITP & IELTS Akademik',
    slug: 'kursus-bahasa-asing-toefl-ielts-diskon-setengah-harga',
    type: 'PROMOSI',
    status: 'PUBLISHED',
    summary:
      'Potongan separuh harga untuk kelas bimbingan tes kemahiran bahasa Inggris internasional persiapan beasiswa dan syarat kelulusan.',
    body: `Pusat Bahasa dan Kebudayaan Asing memberikan potongan biaya khusus 50% bagi mahasiswa yang mendaftar kelas kursus intensif TOEFL ITP atau IELTS Akademik semester ini.

Program mencakup 24 sesi pembelajaran tatap muka/daring, diagnostic test di awal, materi drilling soal berkala, serta 2 kali simulasi resmi (mock test) dengan analisis skor mendalam.

Catatan simulasi: Skenario promosi kursus bahasa untuk uji coba halaman detail.`,
    organizer: 'Pusat Bahasa & Kebudayaan Asing Kampus',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi mahasiswa tekun mempelajari kamus dan buku bahasa Inggris',
    registration_url: '/demo/simulasi-klaim?promo=kursus-toefl-ielts',
    promo_period_start: '2026-09-20T00:00:00.000Z',
    promo_period_end: '2026-10-31T23:59:59.000Z',
terms_and_conditions:
      '1. Khusus mahasiswa universitas (menunjukkan KTM aktif).\n2. Memilih jadwal kelas hari kerja (sore) atau akhir pekan.\n3. Biaya belum termasuk pendaftaran tes sertifikasi resmi ETS/IDP.',
    published_at: '2026-09-12T08:00:00.000Z',
    created_at: '2026-09-12T08:00:00.000Z',
    updated_at: '2026-09-12T08:00:00.000Z',
    view_count: 1410,
    tags: [
      { id: 'tag-promosi', name: 'Promosi', slug: 'promosi' },
      { id: 'tag-akademik', name: 'Akademik', slug: 'akademik' },
      { id: 'tag-bahasa', name: 'Bahasa', slug: 'bahasa' },
    ],
  },
  {
    id: 'pro-05',
    title: 'Cashback 30% Pembelian Menu Sehat Kantin Mahasiswa via QRIS',
    slug: 'potongan-harga-kafe-dan-kantin-kampus-qris',
    type: 'PROMOSI',
    status: 'PUBLISHED',
    summary:
      'Dukungan konsumsi gizi seimbang mahasiswa dengan promo cashback belanja harian di seluruh tenant pujasera kampus.',
    body: `Sentra Kuliner Mahasiswa berkolaborasi dengan penyedia pembayaran dompet digital meluncurkan program makan hemat dan sehat. Nikmati potongan cashback instan 30% untuk setiap transaksi pembelian makanan dan minuman bergizi.

Promo berlaku di seluruh pujasera kampus (Kantin Gedung 9, Pujasera Ciumbuleuit, dan Kafe Perpustakaan) dengan memindai kode QRIS transaksi.

Catatan simulasi: Penawaran diskon kuliner untuk variasi demo.`,
    organizer: 'Sentra Kuliner Mahasiswa & Mitra Dompet Digital',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi mahasiswa berkumpul santai menikmati hidangan di kantin',
    registration_url: '/demo/simulasi-klaim?promo=cashback-kantin-kampus',
    promo_period_start: '2026-10-01T00:00:00.000Z',
    promo_period_end: '2026-10-25T23:59:59.000Z',
terms_and_conditions:
      '1. Maksimal cashback Rp 10.000 per transaksi per akun per hari.\n2. Berlaku untuk menu makanan berat dan jus buah sehat.',
    published_at: '2026-09-15T09:00:00.000Z',
    created_at: '2026-09-15T09:00:00.000Z',
    updated_at: '2026-09-15T09:00:00.000Z',
    view_count: 1820,
    tags: [
      { id: 'tag-promosi', name: 'Promosi', slug: 'promosi' },
      { id: 'tag-kuliner', name: 'Kuliner', slug: 'kuliner' },
      { id: 'tag-diskon', name: 'Diskon', slug: 'diskon' },
    ],
  },
  {
    id: 'pro-06',
    title: 'Keanggotaan Gratis Pusat Kebugaran & Kolam Renang Mahasiswa',
    slug: 'bebas-biaya-keanggotaan-gym-dan-kolam-renang-kampus',
    type: 'PROMOSI',
    status: 'PUBLISHED',
    summary:
      'Akses bebas biaya sarana fitness center modern dan kolam renang semi-olimpik selama 2 bulan bagi mahasiswa aktif.',
    body: `Pusat Fasilitas Olahraga & Kebugaran Terpadu memberikan penawaran istimewa bagi mahasiswa yang ingin menjaga kebugaran tubuh di tengah kesibukan kuliah. Daftarkan diri Anda untuk memperoleh membership bebas biaya selama 60 hari.

Fasilitas meliputi area angkat beban berstandar, ruang kardio ber-AC, loker penyimpanan aman, kamar bilas air hangat, serta kolam renang semi-olimpik yang terawat.

Catatan simulasi: Skenario promosi fasilitas olahraga kampus.`,
    organizer: 'Pusat Fasilitas Olahraga & Kebugaran Terpadu',
    hero_image_url: assetPath('/images/demo/graduation.jpg'),
    hero_image_alt: 'Foto ilustrasi area fasilitas gelanggang olahraga kampus yang bersih',
    registration_url: '/demo/simulasi-klaim?promo=gym-kolam-renang',
    promo_period_start: '2026-09-10T00:00:00.000Z',
    promo_period_end: '2026-11-10T23:59:59.000Z',
terms_and_conditions:
      '1. Khusus mahasiswa terdaftar semester berjalan.\n2. Wajib mengenakan pakaian olahraga dan sepatu bersih di area gym.\n3. Menjaga ketertiban dan merapikan alat kembali ke tempat semula.',
    published_at: '2026-09-18T07:00:00.000Z',
    created_at: '2026-09-18T07:00:00.000Z',
    updated_at: '2026-09-18T07:00:00.000Z',
    view_count: 1150,
    tags: [
      { id: 'tag-promosi', name: 'Promosi', slug: 'promosi' },
      { id: 'tag-olahraga', name: 'Olahraga', slug: 'olahraga' },
      { id: 'tag-kesehatan', name: 'Kesehatan', slug: 'kesehatan' },
    ],
  },
  {
    id: 'pro-07',
    title: 'Lisensi Resmi Edukasi Adobe Creative Cloud Diskon Khusus 65%',
    slug: 'diskon-perangkat-lunak-adobe-creative-cloud',
    type: 'PROMOSI',
    status: 'PUBLISHED',
    summary:
      'Paket langganan resmi semua aplikasi kreatif (Photoshop, Illustrator, Premiere Pro, After Effects) dengan potongan harga edukasi.',
    body: `Direktorat Sistem Informasi memfasilitasi kemitraan lisensi perangkat lunak industri kreatif. Mahasiswa berhak menikmati diskon edukasi sebesar 65% untuk langganan tahunan paket Adobe Creative Cloud All Apps.

Lisensi diaktifkan langsung menggunakan akun email kampus mahasiswa dengan kapasitas penyimpanan cloud sebesar 100 GB dan akses penuh Adobe Fonts.

Catatan simulasi: Diskon software edukasi untuk demonstrasi katalog promo.`,
    organizer: 'Direktorat Sistem Informasi & Mitra Software',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi laptop mengoperasikan aplikasi editing desain visual',
    registration_url: '/demo/simulasi-klaim?promo=lisensi-adobe-creative',
    promo_period_start: '2026-09-01T00:00:00.000Z',
    promo_period_end: '2026-12-15T23:59:59.000Z',
terms_and_conditions:
      '1. Mahasiswa aktif dengan status registrasi terverifikasi di PDDikti.\n2. Lisensi dipergunakan untuk kebutuhan non-komersial/pembelajaran.\n3. Satu lisensi dapat diaktifkan pada maksimal 2 perangkat.',
    published_at: '2026-09-20T08:00:00.000Z',
    created_at: '2026-09-20T08:00:00.000Z',
    updated_at: '2026-09-20T08:00:00.000Z',
    view_count: 2480,
    tags: [
      { id: 'tag-promosi', name: 'Promosi', slug: 'promosi' },
      { id: 'tag-desain', name: 'Desain', slug: 'desain' },
      { id: 'tag-teknologi', name: 'Teknologi', slug: 'teknologi' },
    ],
  },
  {
    id: 'pro-08',
    title: 'Diskon Tarif Tiket Kereta Cepat & Shuttle Travel Antar-Kota',
    slug: 'voucher-transportasi-kereta-dan-shuttle-antar-kampus',
    type: 'PROMOSI',
    status: 'PUBLISHED',
    summary:
      'Subsidi potongan tiket perjalanan kereta cepat Whoosh dan travel shuttle jurusan Bandung - Jakarta khusus mahasiswa.',
    body: `Biro Kerjasama Layanan Transportasi Mahasiswa bermitra dengan operator kereta cepat dan agen shuttle antar-kota memberikan tarif khusus pelajar dan mahasiswa sebesar 25% setiap hari keberangkatan Senin hingga Kamis.

Nikmati perjalanan pulang-pergi yang nyaman, cepat, dan ekonomis untuk urusan riset, magang industri, maupun pulang ke rumah keluarga di akhir pekan.

Catatan simulasi: Data kemitraan perjalanan simulasi prototipe.`,
    organizer: 'Biro Kerjasama Layanan Transportasi Mahasiswa',
    hero_image_url: assetPath('/images/demo/graduation.jpg'),
    hero_image_alt: 'Foto ilustrasi mahasiswa menunggu perjalanan transportasi antar-kota',
    registration_url: '/demo/simulasi-klaim?promo=voucher-travel-kereta',
    promo_period_start: '2026-09-25T00:00:00.000Z',
    promo_period_end: '2026-10-31T23:59:59.000Z',
terms_and_conditions:
      '1. Menunjukkan KTM asli saat penukaran tiket di loket stasiun/shuttle.\n2. Pembelian tiket maksimal H-3 sebelum jadwal keberangkatan.',
    published_at: '2026-09-22T08:00:00.000Z',
    created_at: '2026-09-22T08:00:00.000Z',
    updated_at: '2026-09-22T08:00:00.000Z',
    view_count: 1530,
    tags: [
      { id: 'tag-promosi', name: 'Promosi', slug: 'promosi' },
      { id: 'tag-transportasi', name: 'Transportasi', slug: 'transportasi' },
      { id: 'tag-diskon', name: 'Diskon', slug: 'diskon' },
    ],
  },
  {
    id: 'pro-09',
    title: 'Paket Periksa Mata Komputer & Kacamata Anti Radiasi Hemat 40%',
    slug: 'paket-pemeriksaan-mata-dan-kacamata-mahasiswa',
    type: 'PROMOSI',
    status: 'PUBLISHED',
    summary:
      'Pemeriksaan refraksi mata komprehensif oleh optometris berlisensi serta diskon lensa blue-ray anti radiasi gawai digital.',
    body: `Poliklinik Kesehatan Mahasiswa bekerja sama dengan optik rekanan menghadirkan program peduli kesehatan mata pelajar. Berjam-jam menatap layar laptop dan ponsel rentan memicu ketegangan mata (digital eye strain).

Dapatkan pemeriksaan ketajaman visual lengkap secara cuma-cuma dan potongan diskon 40% untuk pergantian lensa kacamata anti radiasi sinar biru maupun frame modern pilihan.

Catatan simulasi: Program kesehatan mahasiswa untuk dummy prototype.`,
    organizer: 'Poliklinik Kesehatan Kampus & Optik Mitra',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi kacamata baca dan buku belajar dengan pencahayaan nyaman',
    registration_url: '/demo/simulasi-klaim?promo=kacamata-anti-radiasi',
    promo_period_start: '2026-10-01T00:00:00.000Z',
    promo_period_end: '2026-11-20T23:59:59.000Z',
terms_and_conditions:
      '1. Datang langsung ke Poliklinik Kampus Gedung Pelayanan Mahasiswa.\n2. Berlaku untuk seluruh mahasiswa, staf, dan pengajar kampus.',
    published_at: '2026-09-25T09:00:00.000Z',
    created_at: '2026-09-25T09:00:00.000Z',
    updated_at: '2026-09-25T09:00:00.000Z',
    view_count: 890,
    tags: [
      { id: 'tag-promosi', name: 'Promosi', slug: 'promosi' },
      { id: 'tag-kesehatan', name: 'Kesehatan', slug: 'kesehatan' },
      { id: 'tag-diskon', name: 'Diskon', slug: 'diskon' },
    ],
  },

  // 3 Expired Promotions (promo_period_end < 2026-10-02T12:00:00.000Z)
  {
    id: 'pro-10',
    title: 'Bazar Buku Akademik Awal Semester: Diskon Penerbit Hingga 40%',
    slug: 'promo-buku-teks-awal-semester-ganjil-2026',
    type: 'PROMOSI',
    status: 'PUBLISHED',
    summary:
      'Pesta buku awal tahun ajaran baru dengan potongan harga spesial ratusan judul buku literatur kuliah wajib.',
    body: `Pameran dan bazar buku teks akademik awal semester ganjil telah usai pada akhir Agustus 2026. Ribuan eksemplar buku rujukan kuliah dari penerbit terkemuka telah diserap mahasiswa dengan diskon menarik.

Koperasi kampus tetap melayani pemesanan buku reguler dengan diskon keanggotaan standar sepanjang semester.

Catatan simulasi: Arsip promosi bazar buku yang telah kedaluwarsa.`,
    organizer: 'Toko Buku Kampus & Koperasi Karyawan',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi tumpukan buku pelajaran akademik di bazar literatur',
    registration_url: '/demo/simulasi-klaim?promo=bazar-buku-awal-semester&status=tutup',
    promo_period_start: '2026-08-01T00:00:00.000Z',
    promo_period_end: '2026-08-31T23:59:59.000Z',
terms_and_conditions:
      '1. Periode bazar buku telah berakhir pada 31 Agustus 2026.\n2. Pembelian selanjutnya dilayani dengan harga normal.',
    published_at: '2026-07-25T08:00:00.000Z',
    created_at: '2026-07-25T08:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
    view_count: 2650,
    tags: [
      { id: 'tag-promosi', name: 'Promosi', slug: 'promosi' },
      { id: 'tag-akademik', name: 'Akademik', slug: 'akademik' },
      { id: 'tag-buku', name: 'Buku', slug: 'buku' },
    ],
  },
  {
    id: 'pro-11',
    title: 'Promo Medical Check Up & Skrining Kesehatan Mahasiswa Baru',
    slug: 'diskon-pemeriksaan-kesehatan-mahasiswa-baru',
    type: 'PROMOSI',
    status: 'PUBLISHED',
    summary:
      'Paket skrining kesehatan awal masuk kuliah mencakup tes bebas narkoba, rontgen dada, dan cek darah lengkap hemat 50%.',
    body: `Masa penukaran voucher paket medical check-up mahasiswa baru angkatan 2026 telah berakhir pada 15 September 2026. Seluruh berkas rekam kesehatan telah diverifikasi ke dalam basis data kemahasiswaan.

Bagi mahasiswa yang memerlukan tes susulan dapat berkonsultasi langsung ke poliklinik universitas.

Catatan simulasi: Arsip promosi pemeriksaan kesehatan lampau.`,
    organizer: 'Pusat Pelayanan Medis & Rumah Sakit Jejaring',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi ruang klinik pemeriksaan kesehatan mahasiswa',
    registration_url: '/demo/simulasi-klaim?promo=mcu-mahasiswa-baru&status=tutup',
    promo_period_start: '2026-08-10T00:00:00.000Z',
    promo_period_end: '2026-09-15T23:59:59.000Z',
terms_and_conditions:
      '1. Batas waktu penukaran voucher paket MCU telah berakhir.\n2. Layanan reguler tetap tersedia sesuai tarif poliklinik.',
    published_at: '2026-08-01T09:00:00.000Z',
    created_at: '2026-08-01T09:00:00.000Z',
    updated_at: '2026-09-16T00:00:00.000Z',
    view_count: 1720,
    tags: [
      { id: 'tag-promosi', name: 'Promosi', slug: 'promosi' },
      { id: 'tag-kesehatan', name: 'Kesehatan', slug: 'kesehatan' },
      { id: 'tag-diskon', name: 'Diskon', slug: 'diskon' },
    ],
  },
  {
    id: 'pro-12',
    title: 'Paket Perdana Kuota Data Edukasi Murah Operator Seluler Mitra',
    slug: 'voucher-langganan-internet-kuota-edukasi',
    type: 'PROMOSI',
    status: 'PUBLISHED',
    summary:
      'Bantuan kuota internet 30 GB per bulan untuk akses konferensi video pembelajaran daring dan LMS kampus.',
    body: `Program subsidi kuota data edukasi operator seluler kemitraan semester lalu telah resmi ditutup pada 30 September 2026. Penyaluran paket data telah dinikmati oleh ribuan mahasiswa selama masa perkuliahan hybrid.

Program serupa sedang dalam kajian kerja sama untuk periode semester ganjil berikutnya.

Catatan simulasi: Arsip kuota internet edukasi yang telah usai masa berlakunya.`,
    organizer: 'Biro Humas & Kemitraan Telekomunikasi',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi laptop terhubung koneksi internet di ruang kerja',
    registration_url: '/demo/simulasi-klaim?promo=kuota-data-edukasi&status=tutup',
    promo_period_start: '2026-08-15T00:00:00.000Z',
    promo_period_end: '2026-09-30T23:59:59.000Z',
terms_and_conditions:
      '1. Masa aktivasi paket perdana kuota telah berakhir.\n2. Sisa kuota aktif mengikuti masa tenggang kartu masing-masing pengguna.',
    published_at: '2026-08-10T10:00:00.000Z',
    created_at: '2026-08-10T10:00:00.000Z',
    updated_at: '2026-10-01T00:00:00.000Z',
    view_count: 1980,
    tags: [
      { id: 'tag-promosi', name: 'Promosi', slug: 'promosi' },
      { id: 'tag-teknologi', name: 'Teknologi', slug: 'teknologi' },
      { id: 'tag-diskon', name: 'Diskon', slug: 'diskon' },
    ],
  },
];
