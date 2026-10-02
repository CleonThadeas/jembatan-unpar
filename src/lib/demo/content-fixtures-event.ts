import { Content } from '@/types/content';
import { assetPath } from './asset-path';

export const DEMO_EVENT_ITEMS: Content[] = [
  // 9 Active Events (event_end_at > 2026-10-02T12:00:00.000Z)
  {
    id: 'evt-01',
    title: 'Seminar Nasional: Keamanan Siber & Etika AI di Era Industri 5.0',
    slug: 'seminar-nasional-keamanan-siber-dan-ai',
    type: 'EVENT',
    status: 'PUBLISHED',
    summary:
      'Diskusi panel ahli praktisi teknologi dan pakar hukum siber membahas mitigasi ancaman digital serta etika pemanfaatan AI generatif.',
    body: `Himpunan Mahasiswa Informatika menghadirkan Seminar Nasional Keamanan Siber dan Etika AI 2026. Di tengah adopsi kecerdasan buatan yang eksponensial, seminar ini mengupas tuntas kerentanan sistem modern, regulasi pelindungan data pribadi (UU PDP), serta batasan etis dalam pengembangan model otonom.

Pembicara utama meliputi Chief Information Security Officer (CISO) perusahaan unicorn dan pakar keamanan komputasi dari lembaga riset nasional. Peserta berkesempatan mengikuti sesi tanya jawab interaktif dan memperoleh sertifikat elektronik berbobot 2 SKPK.

Catatan simulasi: Acara ini disajikan sebagai contoh agenda seminar dalam prototype portal.`,
    organizer: 'Himpunan Mahasiswa Informatika (HMIF)',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi suasana workshop seminar teknologi dengan layar presentasi',
    registration_url: '/demo/simulasi-pendaftaran?event=seminar-keamanan-siber',
    event_start_at: '2026-10-15T02:00:00.000Z',
    event_end_at: '2026-10-15T08:00:00.000Z',
location_or_url: 'Auditorium Gedung 9 Lantai 3 & Zoom Webinar Hybrid',
terms_and_conditions:
      '1. Terbuka untuk seluruh civitas akademika dan umum.\n2. Wajib melakukan check-in barcode di lokasi 15 menit sebelum acara.',
    published_at: '2026-09-02T08:00:00.000Z',
    created_at: '2026-09-02T08:00:00.000Z',
    updated_at: '2026-09-02T08:00:00.000Z',
    view_count: 1780,
    tags: [
      { id: 'tag-event', name: 'Event', slug: 'event' },
      { id: 'tag-teknologi', name: 'Teknologi', slug: 'teknologi' },
      { id: 'tag-seminar', name: 'Seminar', slug: 'seminar' },
    ],
  },
  {
    id: 'evt-02',
    title: 'Hands-on Workshop: Membangun Scalable Design System dengan Figma',
    slug: 'workshop-desain-ui-ux-design-system-modern',
    type: 'EVENT',
    status: 'PUBLISHED',
    summary:
      'Pelatihan intensif praktik langsung menyusun token desain, komponen atomik, dan dokumentasi design system standar industri.',
    body: `Komunitas Desain Grafis & Multimedia Kampus menyelenggarakan workshop teknis perancangan antarmuka aplikasi. Peserta akan dibimbing langkah demi langkah membuat library Figma yang siap pakai untuk tim engineering, meliputi varian komponen, auto layout tingkat lanjut, dan token tema responsif.

Setiap peserta disarankan membawa laptop pribadi dengan akun Figma yang telah terpasang. Mentor merupakan Senior Product Designer dari agensi digital nasional.

Catatan simulasi: Sesi registrasi prototype untuk demonstrasi modul kegiatan.`,
    organizer: 'Komunitas Desain Grafis & Multimedia Kampus',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi laptop menampilkan kanvas desain antarmuka pengguna',
    registration_url: '/demo/simulasi-pendaftaran?event=workshop-design-system',
    event_start_at: '2026-10-24T02:00:00.000Z',
    event_end_at: '2026-10-24T09:00:00.000Z',
location_or_url: 'Lab Komputer Rekayasa Perangkat Lunak Gedung 8',
terms_and_conditions:
      '1. Kuota terbatas 40 peserta demi efektivitas pendampingan.\n2. Membawa laptop dengan mouse dan charger pribadi.',
    published_at: '2026-09-06T09:00:00.000Z',
    created_at: '2026-09-06T09:00:00.000Z',
    updated_at: '2026-09-06T09:00:00.000Z',
    view_count: 1220,
    tags: [
      { id: 'tag-event', name: 'Event', slug: 'event' },
      { id: 'tag-desain', name: 'Desain', slug: 'desain' },
      { id: 'tag-workshop', name: 'Workshop', slug: 'workshop' },
    ],
  },
  {
    id: 'evt-03',
    title: 'Campus Career Expo & Walk-in Interview 2026',
    slug: 'career-fair-dan-expo-industri-kampus-2026',
    type: 'EVENT',
    status: 'PUBLISHED',
    summary:
      'Pameran bursa kerja tahunan menghadirkan lebih dari 45 perusahaan multinasional, BUMN, dan startup terkemuka.',
    body: `Pusat Pengembangan Karir & Hubungan Alumni kembali menggelar Campus Career Expo 2026 selama 3 hari berturut-turut. Acara ini menjadi jembatan antara lulusan baru (fresh graduates) maupun mahasiswa semester akhir dengan puluhan perusahaan terkemuka.

Selain booth pameran lowongan kerja, tersedia panggung Career Talk, klinik bedah CV gratis, serta bilik walk-in interview langsung bagi kandidat terpilih.

Catatan simulasi: Pameran karir ini merupakan agenda tiruan untuk prototype.`,
    organizer: 'Pusat Pengembangan Karir & Hubungan Alumni',
    hero_image_url: assetPath('/images/demo/graduation.jpg'),
    hero_image_alt: 'Foto ilustrasi para wisudawan antusias menyambut peluang masa depan karir',
    registration_url: '/demo/simulasi-pendaftaran?event=campus-career-expo',
    event_start_at: '2026-11-04T01:30:00.000Z',
    event_end_at: '2026-11-06T10:00:00.000Z',
location_or_url: 'Hall Serbaguna Kampus Utama Lantai 1',
terms_and_conditions:
      '1. Berpakaian rapi dan formal.\n2. Menyiapkan softcopy CV dalam ponsel atau flashdisk.\n3. Menunjukkan tiket masuk digital saat di pintu gerbang.',
    published_at: '2026-09-10T10:00:00.000Z',
    created_at: '2026-09-10T10:00:00.000Z',
    updated_at: '2026-09-10T10:00:00.000Z',
    view_count: 2890,
    tags: [
      { id: 'tag-event', name: 'Event', slug: 'event' },
      { id: 'tag-karir', name: 'Karir', slug: 'karir' },
      { id: 'tag-expo', name: 'Expo', slug: 'expo' },
    ],
  },
  {
    id: 'evt-04',
    title: 'Pekan Festival Seni, Budaya Nusantara, dan Kuliner Tradisional',
    slug: 'festival-kebudayaan-nusantara-dan-kuliner',
    type: 'EVENT',
    status: 'PUBLISHED',
    summary:
      'Perayaan kekayaan ragam budaya nusantara dengan pertunjukan tari tradisional, pameran kriya, dan bazaar jajanan daerah.',
    body: `Badan Eksekutif Mahasiswa (BEM) mengundang seluruh keluarga besar universitas dan masyarakat sekitar untuk meramaikan Pekan Festival Kebudayaan Nusantara 2026. Acara menampilkan parade kostum daerah oleh perwakilan mahasiswa dari 34 provinsi, panggung kolaborasi musik gamelan dan modern, serta puluhan stand kuliner otentik Indonesia.

Tersedia lomba foto berhadiah total jutaan rupiah bagi pengunjung yang mengabadikan kemeriahan festival dengan tagar budaya kampus.

Catatan simulasi: Informasi agenda seni budaya pada prototype portal.`,
    organizer: 'Badan Eksekutif Mahasiswa (BEM)',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi perayaan kolaborasi kreasi mahasiswa di area terbuka',
    registration_url: '/demo/simulasi-pendaftaran?event=festival-budaya-nusantara',
    event_start_at: '2026-10-28T01:00:00.000Z',
    event_end_at: '2026-10-30T14:00:00.000Z',
location_or_url: 'Plaza Lapangan Tengah Kampus Utama',
terms_and_conditions:
      '1. Tiket masuk festival bebas biaya (gratis).\n2. Dilarang membawa benda berbahaya atau mengotori area hijau kampus.',
    published_at: '2026-09-14T08:00:00.000Z',
    created_at: '2026-09-14T08:00:00.000Z',
    updated_at: '2026-09-14T08:00:00.000Z',
    view_count: 1450,
    tags: [
      { id: 'tag-event', name: 'Event', slug: 'event' },
      { id: 'tag-seni', name: 'Seni', slug: 'seni' },
      { id: 'tag-festival', name: 'Festival', slug: 'festival' },
    ],
  },
  {
    id: 'evt-05',
    title: 'Kuliah Umum Internasional: Transisi Energi & Ekonomi Sirkular Hijau',
    slug: 'kuliah-umum-ekonomi-sirkular-keberlanjutan',
    type: 'EVENT',
    status: 'PUBLISHED',
    summary:
      'Kuliah tamu bersama profesor tamu dari universitas mitra membahas strategi dekarbonisasi industri di Asia Tenggara.',
    body: `Fakultas Ekonomi berkolaborasi dengan Pusat Studi Lingkungan Hidup menyelenggarakan kuliah umum internasional bertema percepatan transisi energi terbarukan. Pembicara membedah studi kasus implementasi sirkularitas rantai pasok manufaktur dan skema insentif pajak karbon.

Kuliah umum ini dibawakan dalam bahasa Inggris dengan opsi penerjemahan langsung via perangkat audio penerima di ruang kuliah.

Catatan simulasi: Agenda akademik demo untuk menguji integrasi detail event.`,
    organizer: 'Fakultas Ekonomi & Pusat Studi Lingkungan',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi ruang literatur ilmiah dan kajian akademik kampus',
    registration_url: '/demo/simulasi-pendaftaran?event=kuliah-umum-ekonomi-hijau',
    event_start_at: '2026-11-12T03:00:00.000Z',
    event_end_at: '2026-11-12T06:00:00.000Z',
location_or_url: 'Ruang Seminar Magister Gedung 1 Lt. 4',
terms_and_conditions:
      '1. Terbuka untuk dosen, mahasiswa pascasarjana, dan sarjana tingkat akhir.\n2. Wajib hadir 10 menit sebelum kuliah dimulai.',
    published_at: '2026-09-16T11:00:00.000Z',
    created_at: '2026-09-16T11:00:00.000Z',
    updated_at: '2026-09-16T11:00:00.000Z',
    view_count: 730,
    tags: [
      { id: 'tag-event', name: 'Event', slug: 'event' },
      { id: 'tag-akademik', name: 'Akademik', slug: 'akademik' },
      { id: 'tag-seminar', name: 'Seminar', slug: 'seminar' },
    ],
  },
  {
    id: 'evt-06',
    title: 'Bootcamp Penulisan Artikel Ilmiah Bereputasi Scopus / SINTA 1',
    slug: 'workshop-penulisan-jurnal-internasional-scopus',
    type: 'EVENT',
    status: 'PUBLISHED',
    summary:
      'Bimbingan teknis intensif dari reviewer jurnal internasional untuk menyempurnakan naskah artikel penelitian mahasiswa.',
    body: `Pusat Publikasi & Pengelolaan Jurnal Ilmiah mengadakan klinik pendampingan intensif penulisan artikel ilmiah. Peserta membawa draf artikel penelitian yang sedang disusun untuk dibedah secara mendalam (peer review) oleh para chief editor jurnal terindeks Scopus.

Materi mencakup teknik menyusun abstrak yang memikat, metodologi yang kokoh, visualisasi data grafik yang standar, hingga etika korespondensi dengan reviewer internasional.

Catatan simulasi: Sesi simulasi agenda penulisan artikel ilmiah.`,
    organizer: 'Pusat Publikasi & Pengelolaan Jurnal Ilmiah',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi telaah naskah publikasi ilmiah di layar laptop',
    registration_url: '/demo/simulasi-pendaftaran?event=bootcamp-jurnal-scopus',
    event_start_at: '2026-11-18T02:00:00.000Z',
    event_end_at: '2026-11-18T08:00:00.000Z',
location_or_url: 'Ruang Multimedia Perpustakaan Pusat Lantai 2',
terms_and_conditions:
      '1. Mahasiswa telah memiliki draf naskah minimal 60% selesai.\n2. Menandatangani komitmen bebas plagiarisme.',
    published_at: '2026-09-18T09:00:00.000Z',
    created_at: '2026-09-18T09:00:00.000Z',
    updated_at: '2026-09-18T09:00:00.000Z',
    view_count: 880,
    tags: [
      { id: 'tag-event', name: 'Event', slug: 'event' },
      { id: 'tag-riset', name: 'Riset', slug: 'riset' },
      { id: 'tag-workshop', name: 'Workshop', slug: 'workshop' },
    ],
  },
  {
    id: 'evt-07',
    title: 'Talkshow Kesehatan Mental: Menjaga Keseimbangan Kuliah dan Kehidupan',
    slug: 'talkshow-mental-health-mahasiswa-tangguh',
    type: 'EVENT',
    status: 'PUBLISHED',
    summary:
      'Dialog interaktif bersama psikolog klinis seputar manajemen stres akademik, pencegahan burnout, dan resiliensi diri.',
    body: `Unit Konseling & Pengembangan Pribadi Mahasiswa mempersembahkan sesi bincang hangat seputar kesehatan mental. Di tengah padatnya tenggat tugas kuliah dan dinamika organisasi, mahasiswa kerap rentan mengalami kelelahan mental (burnout).

Acara ini menghadirkan psikolog klinis praktisi yang membagikan teknik mindfulness sederhana, tips mengenali tanda stres berlebih, serta akses konseling rahasia gratis di kampus.

Catatan simulasi: Simulasi kegiatan layanan konseling mahasiswa.`,
    organizer: 'Unit Konseling & Pengembangan Pribadi Mahasiswa',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi diskusi kelompok santai dan saling menguatkan antar mahasiswa',
    registration_url: '/demo/simulasi-pendaftaran?event=talkshow-mental-health',
    event_start_at: '2026-10-18T06:00:00.000Z',
    event_end_at: '2026-10-18T09:30:00.000Z',
location_or_url: 'Gedung Teater Mahasiswa Lantai 2',
terms_and_conditions:
      '1. Acara mengedepankan ruang aman, empati, dan saling menghormati kerahasiaan.\n2. Tempat duduk diisi berdasarkan urutan kehadiran.',
    published_at: '2026-09-20T08:00:00.000Z',
    created_at: '2026-09-20T08:00:00.000Z',
    updated_at: '2026-09-20T08:00:00.000Z',
    view_count: 940,
    tags: [
      { id: 'tag-event', name: 'Event', slug: 'event' },
      { id: 'tag-kesehatan', name: 'Kesehatan', slug: 'kesehatan' },
      { id: 'tag-seminar', name: 'Seminar', slug: 'seminar' },
    ],
  },
  {
    id: 'evt-08',
    title: 'Startup Pitching & Demo Day: Inovasi Mahasiswa Angkatan IV',
    slug: 'demo-day-inkubator-startup-angkatan-keempat',
    type: 'EVENT',
    status: 'PUBLISHED',
    summary:
      'Ajang presentasi final 12 startup binaan kampus di hadapan investor modal ventura dan pimpinan industri teknologi.',
    body: `Inkubator Bisnis & Teknologi Kampus mengundang Anda menyaksikan Demo Day Angkatan IV. Sebanyak 12 startup terpilih di bidang edutech, agritech, healthtech, dan green economy akan mempresentasikan solusi produk dan model bisnis mereka di panggung utama.

Acara mencakup pameran showcase produk interaktif, networking session dengan venture capital, serta voting pemenang favorit penonton.

Catatan simulasi: Event inkubasi teknologi dummy untuk prototipe portal.`,
    organizer: 'Inkubator Bisnis & Teknologi Kampus',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi panggung presentasi ide startup teknologi di hadapan audiens',
    registration_url: '/demo/simulasi-pendaftaran?event=demo-day-startup-iv',
    event_start_at: '2026-12-05T02:00:00.000Z',
    event_end_at: '2026-12-05T09:00:00.000Z',
location_or_url: 'Auditorium Pusat Inovasi Digital Lt. 3',
terms_and_conditions:
      '1. Terbuka bagi penggiat startup, mahasiswa, dan calon angel investor.\n2. Disediakan konsumsi rehat kopi dan jejaring.',
    published_at: '2026-09-22T10:00:00.000Z',
    created_at: '2026-09-22T10:00:00.000Z',
    updated_at: '2026-09-22T10:00:00.000Z',
    view_count: 1390,
    tags: [
      { id: 'tag-event', name: 'Event', slug: 'event' },
      { id: 'tag-wirausaha', name: 'Wirausaha', slug: 'wirausaha' },
      { id: 'tag-teknologi', name: 'Teknologi', slug: 'teknologi' },
    ],
  },
  {
    id: 'evt-09',
    title: 'Aksi Sosial Donor Darah PMI & Cek Kesehatan Sukarela',
    slug: 'donor-darah-dan-pemeriksaan-kesehatan-gratis',
    type: 'EVENT',
    status: 'PUBLISHED',
    summary:
      'Bakti sosial donor darah rutin bersama PMI Kota serta layanan pengecekan tekanan darah, gula darah, dan kolesterol gratis.',
    body: `KSR Palang Merah Remaja Unit Kampus menyelenggarakan kegiatan rutin donor darah peduli kemanusiaan. Setetes darah Anda memberikan harapan besar bagi sesama yang membutuhkan di rumah sakit rujukan daerah.

Selain donor darah, dokter dari poliklinik kampus menyediakan konsultasi gizi sehat dan pemeriksaan profil metabolik gratis bagi 150 pendaftar pertama.

Catatan simulasi: Kegiatan sosial kemahasiswaan untuk demonstrasi fitur portal.`,
    organizer: 'KSR Palang Merah Remaja Kampus & PMI',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi ruang pelayanan sosial yang ramah dan tertata rapi',
    registration_url: '/demo/simulasi-pendaftaran?event=donor-darah-pmi',
    event_start_at: '2026-10-22T01:30:00.000Z',
    event_end_at: '2026-10-22T07:30:00.000Z',
location_or_url: 'Lobi Utama Gedung Olahraga & Seni Kampus',
terms_and_conditions:
      '1. Usia minimal 17 tahun, berat badan minimal 45 kg, dan tidur cukup minimal 5 jam.\n2. Tidak sedang mengonsumsi antibiotik dalam 3 hari terakhir.',
    published_at: '2026-09-25T07:00:00.000Z',
    created_at: '2026-09-25T07:00:00.000Z',
    updated_at: '2026-09-25T07:00:00.000Z',
    view_count: 620,
    tags: [
      { id: 'tag-event', name: 'Event', slug: 'event' },
      { id: 'tag-sosial', name: 'Sosial', slug: 'sosial' },
      { id: 'tag-kesehatan', name: 'Kesehatan', slug: 'kesehatan' },
    ],
  },

  // 3 Expired Events (event_end_at < 2026-10-02T12:00:00.000Z)
  {
    id: 'evt-10',
    title: 'Sidang Terbuka & Orasi Ilmiah Peringatan Dies Natalis ke-71',
    slug: 'orasi-ilmiah-dies-natalis-universitas-ke-71',
    type: 'EVENT',
    status: 'PUBLISHED',
    summary:
      'Rapat senat terbuka peringatan ulang tahun universitas dengan orasi ilmiah pengembangan riset berdaya saing global.',
    body: `Peringatan Dies Natalis ke-71 Universitas telah selesai dilaksanakan dengan khidmat pada 18 Agustus 2026. Acara dihadiri oleh pimpinan senat akademik, menteri riset, jajaran pimpinan universitas, serta perwakilan alumni lintas masa.

Rangkaian upacara ditutup dengan penyerahan anugerah insan kampus berprestasi dan peluncuran buku rekam jejak pengabdian universitas.

Catatan simulasi: Event seremonial lampau untuk uji filter kedaluwarsa.`,
    organizer: 'Sekretariat Rektorat Universitas',
    hero_image_url: assetPath('/images/demo/graduation.jpg'),
    hero_image_alt: 'Foto ilustrasi sidang terbuka dies natalis dengan toga kehormatan akademik',
    registration_url: '/demo/simulasi-pendaftaran?event=dies-natalis-71&status=tutup',
    event_start_at: '2026-08-18T01:00:00.000Z',
    event_end_at: '2026-08-18T06:00:00.000Z',
location_or_url: 'Auditorium Utama Rektorat',
terms_and_conditions:
      '1. Acara telah berakhir.\n2. Rekaman video dapat disaksikan di kanal YouTube universitas.',
    published_at: '2026-07-20T08:00:00.000Z',
    created_at: '2026-07-20T08:00:00.000Z',
    updated_at: '2026-08-19T00:00:00.000Z',
    view_count: 3100,
    tags: [
      { id: 'tag-event', name: 'Event', slug: 'event' },
      { id: 'tag-akademik', name: 'Akademik', slug: 'akademik' },
      { id: 'tag-seremonial', name: 'Seremonial', slug: 'seremonial' },
    ],
  },
  {
    id: 'evt-11',
    title: 'Webinar Nasional: Trik Lolos Seleksi Program Magang Bersertifikat',
    slug: 'webinar-persiapan-magang-bumn-dan-swasta',
    type: 'EVENT',
    status: 'PUBLISHED',
    summary:
      'Sesi bimbingan tips wawancara, penyusunan portofolio, dan seleksi administrasi program magang industri bersertifikat.',
    body: `Webinar persiapan seleksi magang nasional telah berlangsung pada 8 September 2026 lalu. Ratusan mahasiswa telah menyimak paparan materi dari para manajer talenta perusahaan mitra.

Dokumentasi presentasi dan rekaman sesi tanya jawab telah dikirimkan kepada seluruh peserta yang hadir di room virtual.

Catatan simulasi: Arsip webinar karir yang telah selesai.`,
    organizer: 'Biro Karir & Hubungan Industri',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi peserta webinar menyimak paparan karir dari laptop',
    registration_url: '/demo/simulasi-pendaftaran?event=webinar-magang-bumn&status=tutup',
    event_start_at: '2026-09-08T06:00:00.000Z',
    event_end_at: '2026-09-08T09:00:00.000Z',
location_or_url: 'Live Streaming Zoom & YouTube Edukasi',
terms_and_conditions:
      '1. Webinar telah terlaksana.\n2. Sertifikat kehadiran telah dibagikan melalui email peserta.',
    published_at: '2026-08-25T09:00:00.000Z',
    created_at: '2026-08-25T09:00:00.000Z',
    updated_at: '2026-09-09T00:00:00.000Z',
    view_count: 1670,
    tags: [
      { id: 'tag-event', name: 'Event', slug: 'event' },
      { id: 'tag-karir', name: 'Karir', slug: 'karir' },
      { id: 'tag-seminar', name: 'Seminar', slug: 'seminar' },
    ],
  },
  {
    id: 'evt-12',
    title: 'Pelatihan Dasar Jurnalistik Visual & Dokumentasi Lapangan',
    slug: 'workshop-fotografi-dan-videografi-jurnalistik',
    type: 'EVENT',
    status: 'PUBLISHED',
    summary:
      'Workshop teknik pengambilan foto berita, penyusunan caption jurnalistik, dan etika peliputan acara kampus.',
    body: `Lembaga Pers Mahasiswa telah sukses menyelenggarakan pelatihan fotografi jurnalistik pada 22 September 2026. Peserta telah mempraktikkan teknik framing visual, pengaturan kecepatan rana kamera, serta penyusunan foto esai lapangan.

Karya-karya terbaik dari peserta workshop saat ini dipamerkan di selasar perpustakaan pusat hingga akhir bulan.

Catatan simulasi: Event lampau untuk demonstrasi tampilan riwayat agenda.`,
    organizer: 'Lembaga Pers Mahasiswa (LPM)',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi mahasiswa berlatih mengoperasikan kamera dan pencahayaan studio',
    registration_url: '/demo/simulasi-pendaftaran?event=workshop-jurnalistik-visual&status=tutup',
    event_start_at: '2026-09-22T02:00:00.000Z',
    event_end_at: '2026-09-22T08:00:00.000Z',
location_or_url: 'Ruang Media Center Lantai 2',
terms_and_conditions:
      '1. Kegiatan pelatihan telah selesai pada September 2026.\n2. Pameran karya berlangsung di selasar lantai 1.',
    published_at: '2026-09-01T10:00:00.000Z',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-23T00:00:00.000Z',
    view_count: 810,
    tags: [
      { id: 'tag-event', name: 'Event', slug: 'event' },
      { id: 'tag-desain', name: 'Desain', slug: 'desain' },
      { id: 'tag-workshop', name: 'Workshop', slug: 'workshop' },
    ],
  },
];
