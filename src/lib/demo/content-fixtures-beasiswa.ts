import { Content } from '@/types/content';
import { assetPath } from './asset-path';

export const DEMO_BEASISWA_ITEMS: Content[] = [
  // 9 Active Items
  {
    id: 'bea-01',
    title: 'Beasiswa Prestasi Akademik Semester Genap 2026/2027',
    slug: 'beasiswa-prestasi-akademik-semester-genap',
    type: 'BEASISWA',
    status: 'PUBLISHED',
    summary:
      'Program bantuan biaya pendidikan penuh satu semester untuk mahasiswa sarjana berprestasi akademik unggul dengan IPK minimal 3.50.',
    body: `Direktorat Kemahasiswaan membuka pendaftaran Beasiswa Prestasi Akademik Semester Genap 2026/2027. Program ini ditujukan bagi mahasiswa aktif program Sarjana (S1) yang telah menyelesaikan minimal 2 semester dan mempertahankan indeks prestasi kumulatif (IPK) di atas 3.50.

Penerima beasiswa akan memperoleh pembebasan biaya kuliah pokok dan SKS selama satu semester, serta sertifikat penghargaan rektorat. Mahasiswa diwajibkan melampirkan transkrip nilai legalisir terbaru, kartu tanda mahasiswa, serta surat rekomendasi dari dosen pembimbing akademik.

Catatan simulasi: Seluruh data pada prototype ini bersifat dummy untuk keperluan pengujian dan demonstrasi sistem.`,
    organizer: 'Direktorat Kemahasiswaan & Alumni',
    hero_image_url: assetPath('/images/demo/graduation.jpg'),
    hero_image_alt: 'Foto ilustrasi mahasiswa mengenakan toga wisuda kelulusan',
    registration_url: '/demo/simulasi-pendaftaran?program=beasiswa-prestasi-akademik',
    registration_deadline: '2026-10-31T23:59:59.000Z',
    terms_and_conditions:
      '1. Mahasiswa aktif S1 minimal semester 3.\n2. IPK minimal 3.50 skala 4.00.\n3. Tidak sedang menerima beasiswa dari institusi lain.',
    published_at: '2026-09-01T08:00:00.000Z',
    created_at: '2026-09-01T08:00:00.000Z',
    updated_at: '2026-09-01T08:00:00.000Z',
    view_count: 1420,
    tags: [
      { id: 'tag-beasiswa', name: 'Beasiswa', slug: 'beasiswa' },
      { id: 'tag-prestasi', name: 'Prestasi', slug: 'prestasi' },
      { id: 'tag-akademik', name: 'Akademik', slug: 'akademik' },
    ],
  },
  {
    id: 'bea-02',
    title: 'Beasiswa Bantuan UKT Yayasan Mitra Peduli 2026',
    slug: 'beasiswa-bantuan-ukt-yayasan-peduli',
    type: 'BEASISWA',
    status: 'PUBLISHED',
    summary:
      'Bantuan subsidi uang kuliah tunggal sebesar 70% bagi mahasiswa aktif yang membutuhkan dukungan finansial keluarga.',
    body: `Yayasan Mitra Peduli Pendidikan kembali menyalurkan bantuan subsidi Uang Kuliah Tunggal (UKT) bagi 100 mahasiswa yang sedang mengalami kendala ekonomi. Program ini bertujuan memastikan kelangsungan studi mahasiswa tanpa terhambat beban finansial.

Bantuan diberikan langsung berupa pemotongan tagihan UKT pada sistem keuangan universitas. Calon penerima wajib mengunggah slip gaji atau surat keterangan penghasilan orang tua, kartu keluarga, dan surat keterangan tidak mampu dari kelurahan setempat.

Catatan simulasi: Data dan nomor pendaftaran tidak terhubung ke sistem pembiayaan riil kampus.`,
    organizer: 'Yayasan Mitra Peduli Pendidikan',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi deretan buku dan ruang belajar perpustakaan kampus',
    registration_url: '/demo/simulasi-pendaftaran?program=bantuan-ukt-yayasan',
    registration_deadline: '2026-11-15T23:59:59.000Z',
    terms_and_conditions:
      '1. Mahasiswa aktif D3/S1 semua jurusan.\n2. Penghasilan kotor gabungan orang tua maksimal Rp 4.500.000 per bulan.\n3. Melampirkan bukti tagihan UKT semester berjalan.',
    published_at: '2026-09-05T09:00:00.000Z',
    created_at: '2026-09-05T09:00:00.000Z',
    updated_at: '2026-09-05T09:00:00.000Z',
    view_count: 980,
    tags: [
      { id: 'tag-beasiswa', name: 'Beasiswa', slug: 'beasiswa' },
      { id: 'tag-sosial', name: 'Sosial', slug: 'sosial' },
      { id: 'tag-bantuan-ukt', name: 'Bantuan UKT', slug: 'bantuan-ukt' },
    ],
  },
  {
    id: 'bea-03',
    title: 'Beasiswa Riset & Tugas Akhir Inovasi Mahasiswa 2026',
    slug: 'beasiswa-riset-inovasi-mahasiswa-tingkat-akhir',
    type: 'BEASISWA',
    status: 'PUBLISHED',
    summary:
      'Dana hibah penelitian tugas akhir dan skripsi hingga Rp 15.000.000 untuk topik keberlanjutan dan transformasi digital.',
    body: `Lembaga Penelitian dan Pengabdian Masyarakat (LPPM) menyediakan dana hibah penelitian tugas akhir bagi mahasiswa tingkat akhir yang menyusun skripsi bertema ekonomi sirkular, energi terbarukan, atau kecerdasan buatan.

Selain pendanaan peralatan laboratorium dan survei lapangan, penerima beasiswa mendapatkan pembimbingan langsung dari peneliti senior dan kesempatan publikasi bersama di prosiding terakreditasi internasional.

Catatan simulasi: Seluruh dokumen proposal pada demo ini merupakan simulasi pengajuan prototype.`,
    organizer: 'Lembaga Penelitian & Pengabdian Masyarakat (LPPM)',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi mahasiswa mengerjakan analisis riset di laptop kerja',
    registration_url: '/demo/simulasi-pendaftaran?program=riset-inovasi-tugas-akhir',
    registration_deadline: '2026-11-30T23:59:59.000Z',
    terms_and_conditions:
      '1. Mahasiswa semester 7 atau 8 yang telah lulus seminar proposal skripsi.\n2. Proposal telah disetujui oleh dosen pembimbing.\n3. Rencana anggaran biaya (RAB) realistis dan terukur.',
    published_at: '2026-09-10T10:00:00.000Z',
    created_at: '2026-09-10T10:00:00.000Z',
    updated_at: '2026-09-10T10:00:00.000Z',
    view_count: 850,
    tags: [
      { id: 'tag-beasiswa', name: 'Beasiswa', slug: 'beasiswa' },
      { id: 'tag-riset', name: 'Riset', slug: 'riset' },
      { id: 'tag-akademik', name: 'Akademik', slug: 'akademik' },
    ],
  },
  {
    id: 'bea-04',
    title: 'Beasiswa Talenta Unggul Bidang Olahraga & Seni Budaya',
    slug: 'beasiswa-atlet-dan-seni-budaya',
    type: 'BEASISWA',
    status: 'PUBLISHED',
    summary:
      'Apresiasi keringanan biaya kuliah bagi mahasiswa berprestasi kejuaraan tingkat nasional maupun internasional.',
    body: `Biro Kemahasiswaan membuka pendaftaran beasiswa apresiasi atlet mahasiswa dan seniman muda kampus. Program ini memberikan penghargaan atas dedikasi mahasiswa yang mengharumkan nama almamater di kompetisi resmi tingkat daerah, nasional, dan internasional.

Penerima memperoleh potongan UKT berkisar antara 50% hingga 100% tergantung level medali yang diraih selama satu tahun terakhir, serta prioritas penggunaan fasilitas kebugaran dan studio latihan kampus.

Catatan simulasi: Pendaftaran online merupakan alur demonstrasi interaktif.`,
    organizer: 'Biro Kemahasiswaan & Pengembangan Karakter',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi workshop kolaborasi dan kreativitas mahasiswa',
    registration_url: '/demo/simulasi-pendaftaran?program=talenta-olahraga-seni',
    registration_deadline: '2026-10-25T23:59:59.000Z',
    terms_and_conditions:
      '1. Meraih medali (emas/perak/perunggu) kompetisi resmi minimal tingkat provinsi dalam 12 bulan terakhir.\n2. Mempertahankan IPK minimal 2.75.\n3. Bersedia mewakili kampus pada POMNAS atau pekan seni mahasiswa berikutnya.',
    published_at: '2026-09-12T11:00:00.000Z',
    created_at: '2026-09-12T11:00:00.000Z',
    updated_at: '2026-09-12T11:00:00.000Z',
    view_count: 670,
    tags: [
      { id: 'tag-beasiswa', name: 'Beasiswa', slug: 'beasiswa' },
      { id: 'tag-prestasi', name: 'Prestasi', slug: 'prestasi' },
      { id: 'tag-olahraga', name: 'Olahraga', slug: 'olahraga' },
    ],
  },
  {
    id: 'bea-05',
    title: 'Beasiswa Pertukaran Pelajar Asia-Pasifik Spring 2027',
    slug: 'beasiswa-pertukaran-mahasiswa-asia-pasifik',
    type: 'BEASISWA',
    status: 'PUBLISHED',
    summary:
      'Kesempatan belajar selama 1 semester di universitas mitra Jepang dan Korea Selatan dengan tunjangan biaya hidup.',
    body: `Kantor Urusan Internasional (KUI) mengundang mahasiswa berwawasan global untuk mengikuti program Beasiswa Pertukaran Mahasiswa Asia-Pasifik semester musim semi 2027. Mahasiswa terpilih akan menempuh studi selama 5 bulan dengan skema transfer kredit penuh.

Komponen beasiswa mencakup tiket pesawat pulang-pergi, pembebasan biaya kuliah di universitas tujuan, asuransi kesehatan internasional, serta uang saku bulanan sebesar USD 800.

Catatan simulasi: Formulir pendaftaran hanya dipergunakan untuk simulasi prototype.`,
    organizer: 'Kantor Urusan Internasional (KUI)',
    hero_image_url: assetPath('/images/demo/graduation.jpg'),
    hero_image_alt: 'Foto ilustrasi mahasiswa tersenyum memegang ijazah kelulusan internasional',
    registration_url: '/demo/simulasi-pendaftaran?program=pertukaran-asia-pasifik',
    registration_deadline: '2026-12-10T23:59:59.000Z',
    terms_and_conditions:
      '1. Mahasiswa semester 4 sampai 6 dengan IPK minimal 3.30.\n2. Sertifikat kemampuan bahasa Inggris TOEFL iBT >= 80 atau IELTS >= 6.5.\n3. Esai motivasi dan rencana studi bahasa Inggris (500 kata).',
    published_at: '2026-09-15T08:30:00.000Z',
    created_at: '2026-09-15T08:30:00.000Z',
    updated_at: '2026-09-15T08:30:00.000Z',
    view_count: 1890,
    tags: [
      { id: 'tag-beasiswa', name: 'Beasiswa', slug: 'beasiswa' },
      { id: 'tag-internasional', name: 'Internasional', slug: 'internasional' },
      { id: 'tag-prestasi', name: 'Prestasi', slug: 'prestasi' },
    ],
  },
  {
    id: 'bea-06',
    title: 'Beasiswa Ikatan Dinas & Magang Industri Teknologi Nusantara',
    slug: 'beasiswa-ikatan-dinas-teknologi-nusantara',
    type: 'BEASISWA',
    status: 'PUBLISHED',
    summary:
      'Dukungan biaya kuliah penuh semester 5-8 disertai program magang intensif dan percepatan karir pascakampus.',
    body: `Konsorsium Industri Digital Indonesia membuka program beasiswa kemitraan industri untuk mahasiswa jurusan Informatika, Sistem Informasi, Teknik Elektro, dan Matematika Komputasi.

Program ini membiayai SPP kuliah secara menyeluruh sejak semester 5 hingga lulus, menyediakan laptop penunjang spesifikasi tinggi, serta menyertakan kontrak magang berbayar 6 bulan dengan penawaran kerja tetap setelah wisuda.

Catatan simulasi: Pendaftaran ini tidak mengikat secara hukum dan semata-mata data uji prototype.`,
    organizer: 'Konsorsium Industri Digital Indonesia',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi layar laptop dengan kode pembaruan teknologi modern',
    registration_url: '/demo/simulasi-pendaftaran?program=ikatan-dinas-teknologi',
    registration_deadline: '2026-10-20T23:59:59.000Z',
    terms_and_conditions:
      '1. Mahasiswa aktif program studi rumpun komputasi/teknologi semester 4 menuju 5.\n2. IPK minimal 3.25.\n3. Lulus uji pemrograman dasar dan wawancara kepribadian.',
    published_at: '2026-09-18T10:00:00.000Z',
    created_at: '2026-09-18T10:00:00.000Z',
    updated_at: '2026-09-18T10:00:00.000Z',
    view_count: 1650,
    tags: [
      { id: 'tag-beasiswa', name: 'Beasiswa', slug: 'beasiswa' },
      { id: 'tag-teknologi', name: 'Teknologi', slug: 'teknologi' },
      { id: 'tag-karir', name: 'Karir', slug: 'karir' },
    ],
  },
  {
    id: 'bea-07',
    title: 'Beasiswa Dana Abadi Ikatan Alumni Angkatan 1990',
    slug: 'beasiswa-alumni-berdaya-angkatan-sembilan-puluh',
    type: 'BEASISWA',
    status: 'PUBLISHED',
    summary:
      'Bantuan SPP dan tunjangan buku per semester hasil galang dana alumni untuk mahasiswa lintas fakultas.',
    body: `Ikatan Alumni (IKA) Angkatan 1990 mempersembahkan Program Beasiswa Guyub Alumni sebagai bentuk kontribusi nyata para lulusan dalam mendampingi adik tingkat yang berjuang menyelesaikan perkuliahan.

Setiap penerima mendapatkan bantuan pembayaran SPP sebesar Rp 4.000.000 per semester dan voucher belanja buku teks akademik. Seleksi ditekankan pada keaktifan organisasi sosial serta komitmen integritas moral.

Catatan simulasi: Data yayasan alumni merupakan bagian dari skenario prototype portal.`,
    organizer: 'Ikatan Alumni Universitas (IKA)',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi suasana hening perpustakaan referensi buku studi',
    registration_url: '/demo/simulasi-pendaftaran?program=dana-abadi-alumni',
    registration_deadline: '2026-11-05T23:59:59.000Z',
    terms_and_conditions:
      '1. Mahasiswa jenjang Sarjana semester 3 s.d. 7.\n2. Aktif dalam organisasi kemahasiswaan atau kegiatan kerelawanan sosial.\n3. Menyertakan esai rencana kontribusi alumni.',
    published_at: '2026-09-20T07:00:00.000Z',
    created_at: '2026-09-20T07:00:00.000Z',
    updated_at: '2026-09-20T07:00:00.000Z',
    view_count: 590,
    tags: [
      { id: 'tag-beasiswa', name: 'Beasiswa', slug: 'beasiswa' },
      { id: 'tag-alumni', name: 'Alumni', slug: 'alumni' },
      { id: 'tag-sosial', name: 'Sosial', slug: 'sosial' },
    ],
  },
  {
    id: 'bea-08',
    title: 'Beasiswa Inkubasi Startup Mahasiswa Berdaya 2026',
    slug: 'beasiswa-wirausaha-muda-inkubator-bisnis',
    type: 'BEASISWA',
    status: 'PUBLISHED',
    summary:
      'Pendanaan modal awal ventura mahasiswa sebesar Rp 25.000.000 disertai bimbingan mentor founder berpengalaman.',
    body: `Pusat Inovasi & Kewirausahaan Kampus memberikan hibah beasiswa rintisan usaha bagi tim mahasiswa yang memiliki produk prototipe bernilai komersial tinggi.

Program inkubasi berlangsung selama 4 bulan mencakup fasilitas co-working space gratis, akses jaringan investor ventura, pendampingan legalitas merek dagang, dan insentif tunai bulanan bagi pendiri rintisan usaha.

Catatan simulasi: Seluruh kompetisi kewirausahaan dalam prototype ini adalah simulasi.`,
    organizer: 'Pusat Inovasi & Kewirausahaan Mahasiswa',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi mahasiswa berdiskusi merancang strategi inovasi bisnis',
    registration_url: '/demo/simulasi-pendaftaran?program=inkubasi-startup-mahasiswa',
    registration_deadline: '2026-11-20T23:59:59.000Z',
    terms_and_conditions:
      '1. Tim beranggotakan 2-4 mahasiswa aktif lintas program studi.\n2. Memiliki prototype produk atau validasi traksi pasar awal.\n3. Siap berkomitmen mengikuti jadwal bootcamp mingguan.',
    published_at: '2026-09-22T08:00:00.000Z',
    created_at: '2026-09-22T08:00:00.000Z',
    updated_at: '2026-09-22T08:00:00.000Z',
    view_count: 1140,
    tags: [
      { id: 'tag-beasiswa', name: 'Beasiswa', slug: 'beasiswa' },
      { id: 'tag-wirausaha', name: 'Wirausaha', slug: 'wirausaha' },
      { id: 'tag-prestasi', name: 'Prestasi', slug: 'prestasi' },
    ],
  },
  {
    id: 'bea-09',
    title: 'Beasiswa Kesetaraan Pendidikan Mahasiswa Berkebutuhan Khusus',
    slug: 'beasiswa-difabel-pendidikan-inklusif',
    type: 'BEASISWA',
    status: 'PUBLISHED',
    summary:
      'Program beasiswa komprehensif mencakup biaya kuliah dan perangkat pendukung aksesibilitas belajar mandiri.',
    body: `Pusat Layanan Disabilitas dan Pendidikan Inklusif menegaskan komitmen kampus ramah disabilitas melalui program beasiswa khusus mahasiswa disabilitas netra, rungu, daksa, dan ragam lainnya.

Beasiswa mencakup pembebasan 100% biaya kuliah reguler, pendampingan asisten akademik sebaya (buddy system), serta pengadaan peranti bantu belajar digital seperti screen-reader profesional, kursi roda ergonomis, atau alat bantu dengar.

Catatan simulasi: Skenario pendaftaran ini dirancang ramah aksesibilitas di prototype.`,
    organizer: 'Pusat Layanan Disabilitas & Inklusi Kampus',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi meja belajar inklusif di perpustakaan dengan pencahayaan tenang',
    registration_url: '/demo/simulasi-pendaftaran?program=pendidikan-inklusif',
    registration_deadline: '2026-12-01T23:59:59.000Z',
    terms_and_conditions:
      '1. Mahasiswa disabilitas aktif terdaftar di universitas.\n2. Mengisi formulir asesmen kebutuhan akomodasi belajar.\n3. Tanpa batasan minimal semester.',
    published_at: '2026-09-25T09:00:00.000Z',
    created_at: '2026-09-25T09:00:00.000Z',
    updated_at: '2026-09-25T09:00:00.000Z',
    view_count: 510,
    tags: [
      { id: 'tag-beasiswa', name: 'Beasiswa', slug: 'beasiswa' },
      { id: 'tag-sosial', name: 'Sosial', slug: 'sosial' },
      { id: 'tag-akademik', name: 'Akademik', slug: 'akademik' },
    ],
  },

  // 3 Expired Items (registration_deadline < 2026-10-02T12:00:00.000Z)
  {
    id: 'bea-10',
    title: 'Beasiswa Unggulan Mahasiswa Berprestasi Semester Ganjil 2026',
    slug: 'beasiswa-unggulan-kemendikbud-semester-ganjil-2026',
    type: 'BEASISWA',
    status: 'PUBLISHED',
    summary:
      'Seleksi beasiswa gelar sarjana berprestasi tingkat nasional untuk periode semester ganjil tahun akademik 2026.',
    body: `Pendaftaran Beasiswa Unggulan untuk periode Semester Ganjil 2026 telah resmi ditutup pada akhir Agustus 2026. Seluruh berkas pendaftar saat ini telah masuk pada tahap wawancara komisi seleksi nasional.

Pengumuman kelulusan administrasi dan jadwal tes wawancara dapat dipantau oleh peserta terdaftar melalui portal resmi penjaminan mutu kementerian.

Catatan simulasi: Konten ini berstatus kedaluwarsa pada prototype demo tanggal acuan 2 Oktober 2026.`,
    organizer: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi',
    hero_image_url: assetPath('/images/demo/graduation.jpg'),
    hero_image_alt: 'Foto ilustrasi wisudawan berprestasi menerima piagam penghargaan',
    registration_url: '/demo/simulasi-pendaftaran?program=unggulan-ganjil-2026&status=tutup',
    registration_deadline: '2026-08-31T23:59:59.000Z',
    terms_and_conditions:
      '1. Pendaftaran periode ganjil telah ditutup.\n2. Berkas tidak dapat disunting kembali setelah batas akhir.',
    published_at: '2026-07-01T08:00:00.000Z',
    created_at: '2026-07-01T08:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
    view_count: 3200,
    tags: [
      { id: 'tag-beasiswa', name: 'Beasiswa', slug: 'beasiswa' },
      { id: 'tag-prestasi', name: 'Prestasi', slug: 'prestasi' },
      { id: 'tag-akademik', name: 'Akademik', slug: 'akademik' },
    ],
  },
  {
    id: 'bea-11',
    title: 'Program Bantuan Perangkat Laptop Belajar Gelombang 1',
    slug: 'beasiswa-bantuan-laptop-kemahasiswaan-gelombang-1',
    type: 'BEASISWA',
    status: 'PUBLISHED',
    summary:
      'Pemberian fasilitas laptop operasional bagi mahasiswa pra-sejahtera untuk mendukung pembelajaran digital.',
    body: `Penerimaan berkas Program Bantuan Perangkat Laptop Belajar Gelombang 1 telah berakhir pada pertengahan September 2026. Sebanyak 75 unit laptop telah diserahterimakan kepada mahasiswa penerima manfaat.

Bagi mahasiswa yang belum berkesempatan mendaftar, panitia merencanakan pembukaan gelombang kedua pada awal semester mendatang.

Catatan simulasi: Arsip program beasiswa kedaluwarsa untuk pengujian filter ketersediaan.`,
    organizer: 'Biro Kemahasiswaan & Sarana Pembelajaran',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi laptop belajar mahasiswa di ruang kerja',
    registration_url: '/demo/simulasi-pendaftaran?program=bantuan-laptop-g1&status=tutup',
    registration_deadline: '2026-09-15T23:59:59.000Z',
    terms_and_conditions:
      '1. Periode gelombang 1 selesai.\n2. Verifikasi fisik telah dirampungkan.',
    published_at: '2026-08-01T09:00:00.000Z',
    created_at: '2026-08-01T09:00:00.000Z',
    updated_at: '2026-09-16T00:00:00.000Z',
    view_count: 1530,
    tags: [
      { id: 'tag-beasiswa', name: 'Beasiswa', slug: 'beasiswa' },
      { id: 'tag-sosial', name: 'Sosial', slug: 'sosial' },
      { id: 'tag-bantuan-ukt', name: 'Bantuan UKT', slug: 'bantuan-ukt' },
    ],
  },
  {
    id: 'bea-12',
    title: 'Beasiswa Mobilitas Internasional Erasmus+ Autumn Intake 2026',
    slug: 'beasiswa-pertukaran-eropa-erasmus-autumn-2026',
    type: 'BEASISWA',
    status: 'PUBLISHED',
    summary:
      'Program pertukaran mahasiswa ke universitas konsorsium Eropa untuk keberangkatan semester gugur 2026.',
    body: `Seleksi berkas beasiswa Erasmus+ Mobilitas Eropa keberangkatan Musim Gugur 2026 telah ditutup pada 25 September 2026. Calon peserta yang lolos nominasi universitas telah diteruskan ke komite penerimaan di negara tujuan.

Informasi seputar intake keberangkatan tahun 2027 akan diumumkan lebih lanjut pada akhir tahun berjalan.

Catatan simulasi: Contoh data lampau untuk menguji kelengkapan badge kedaluwarsa.`,
    organizer: 'Kantor Kemitraan Internasional & Uni Eropa',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi buku-buku di perpustakaan bernuansa klasik Eropa',
    registration_url: '/demo/simulasi-pendaftaran?program=erasmus-autumn-2026&status=tutup',
    registration_deadline: '2026-09-25T23:59:59.000Z',
    terms_and_conditions:
      '1. Pendaftaran periode musim gugur 2026 telah berakhir.\n2. Peserta terpilih mengikuti pembekalan pra-keberangkatan.',
    published_at: '2026-08-15T10:00:00.000Z',
    created_at: '2026-08-15T10:00:00.000Z',
    updated_at: '2026-09-26T00:00:00.000Z',
    view_count: 2410,
    tags: [
      { id: 'tag-beasiswa', name: 'Beasiswa', slug: 'beasiswa' },
      { id: 'tag-internasional', name: 'Internasional', slug: 'internasional' },
      { id: 'tag-prestasi', name: 'Prestasi', slug: 'prestasi' },
    ],
  },
];
