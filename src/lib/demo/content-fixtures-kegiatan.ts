import { Content } from '@/types/content';
import { assetPath } from './asset-path';

export const DEMO_KEGIATAN_ITEMS: Content[] = [
  // 9 Active Activities / Competitions (registration_deadline > 2026-10-02T12:00:00.000Z)
  {
    id: 'keg-01',
    title: 'National Smart Campus Hackathon: Solusi Cerdas Mobilitas Perkotaan',
    slug: 'hackathon-solusi-cerdas-kota-bandung',
    type: 'KEGIATAN_KOMPETISI',
    status: 'PUBLISHED',
    summary:
      'Kompetisi pembuatan prototipe aplikasi dan sensor IoT selama 48 jam untuk menyelesaikan tantangan mobilitas dan transportasi perkotaan.',
    body: `Fakultas Teknologi Informasi mengundang inovator muda beradu gagasan dalam National Smart Campus Hackathon 2026. Kompetisi ini menantang mahasiswa merancang prototipe perangkat lunak dan arsitektur IoT yang mampu mengurai kemacetan serta mengoptimalkan rute angkutan massal.

Total hadiah mencapai Rp 60.000.000 didukung oleh inkubator industri teknologi. Finalis akan memamerkan prototipe mereka di hadapan dinas perhubungan dan investor modal ventura.

Catatan simulasi: Pendaftaran hackathon ini merupakan data simulasi pengujian.`,
    organizer: 'Fakultas Teknologi Informasi & Sains',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi mahasiswa memprogram prototipe aplikasi di laptop kerja',
    registration_url: '/demo/simulasi-pendaftaran?kegiatan=hackathon-smart-campus',
    registration_deadline: '2026-10-25T23:59:59.000Z',
location_or_url: 'Gedung Lab Riset Terpadu Lantai 3',
terms_and_conditions:
      '1. Tim beranggotakan 3-4 orang mahasiswa aktif.\n2. Mengumpulkan proposal ide awal dan repositori kode dasar.\n3. Hak cipta karya tetap menjadi milik peserta.',
    custom_metadata: { activity_type: 'Kompetisi Perangkat Lunak' },
    published_at: '2026-09-03T08:00:00.000Z',
    created_at: '2026-09-03T08:00:00.000Z',
    updated_at: '2026-09-03T08:00:00.000Z',
    view_count: 2150,
    tags: [
      { id: 'tag-kegiatan', name: 'Kegiatan', slug: 'kegiatan' },
      { id: 'tag-teknologi', name: 'Teknologi', slug: 'teknologi' },
      { id: 'tag-kompetisi', name: 'Kompetisi', slug: 'kompetisi' },
    ],
  },
  {
    id: 'keg-02',
    title: 'Lomba Karya Tulis Ilmiah Nasional (LKTIN) Gagasan Futuristik 2026',
    slug: 'lomba-karya-tulis-ilmiah-nasional-lktin',
    type: 'KEGIATAN_KOMPETISI',
    status: 'PUBLISHED',
    summary:
      'Ajang adu gagasan ilmiah kritis mahasiswa seluruh Indonesia bertema implementasi teknologi hijau untuk ketahanan pangan nusantara.',
    body: `Unit Riset dan Penalaran Ilmiah Mahasiswa kembali menggelar LKTIN 2026. Ajang bergengsi ini mempertemukan peneliti muda sarjana dan vokasi untuk menuangkan gagasan solutif dan teruji secara metodologis.

Subtema meliputi bioteknologi pangan, rantai pasok agrikultur presisi, kebijakan perlindungan petani gurem, dan diversifikasi pangan lokal. Karya terbaik akan diterbitkan dalam jurnal nasional terakreditasi SINTA 2.

Catatan simulasi: Seluruh naskah dalam ajang ini adalah skenario prototype.`,
    organizer: 'Unit Riset & Penalaran Ilmiah Mahasiswa',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi studi pustaka dan analisis literatur karya ilmiah di perpustakaan',
    registration_url: '/demo/simulasi-pendaftaran?kegiatan=lktin-gagasan-futuristik',
    registration_deadline: '2026-11-10T23:59:59.000Z',
location_or_url: 'Pengumpulan Karya Daring & Presentasi Finalis',
terms_and_conditions:
      '1. Mahasiswa D3/D4/S1 aktif seluruh perguruan tinggi di Indonesia.\n2. Naskah karya tulis orisinal dan belum pernah memenangkan kompetisi sejenis.\n3. Format penulisan mengikuti buku panduan resmi panitia.',
    custom_metadata: { activity_type: 'Kompetisi Karya Tulis' },
    published_at: '2026-09-08T09:00:00.000Z',
    created_at: '2026-09-08T09:00:00.000Z',
    updated_at: '2026-09-08T09:00:00.000Z',
    view_count: 1470,
    tags: [
      { id: 'tag-kegiatan', name: 'Kegiatan', slug: 'kegiatan' },
      { id: 'tag-riset', name: 'Riset', slug: 'riset' },
      { id: 'tag-kompetisi', name: 'Kompetisi', slug: 'kompetisi' },
    ],
  },
  {
    id: 'keg-03',
    title: 'Parahyangan Intervarsity English Debate Championship 2026',
    slug: 'debat-bahasa-inggris-intervarsity-championship',
    type: 'KEGIATAN_KOMPETISI',
    status: 'PUBLISHED',
    summary:
      'Turnamen debat parlementer standar British Parliamentary (BP) tingkat nasional menghadirkan adjudicator internasional terakreditasi.',
    body: `English Debate Society (EDS) membuka registrasi kompetisi debat bahasa Inggris antar-universitas tahunan. Mengadopsi format British Parliamentary dengan tema-tema mutakhir geopolitik, ekonomi global, etika bioteknologi, dan filsafat sosial.

Turnamen berlangsung selama tiga hari dengan lima babak penyisihan (preliminary rounds), babak gugur (break rounds), serta grand final di auditorium utama.

Catatan simulasi: Pendaftaran turnamen untuk menguji detail kegiatan kompetisi.`,
    organizer: 'English Debate Society (EDS)',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi peserta debat berargumen dalam suasana kompetisi yang dinamis',
    registration_url: '/demo/simulasi-pendaftaran?kegiatan=english-debate-championship',
    registration_deadline: '2026-10-30T23:59:59.000Z',
location_or_url: 'Ruang Debat Gedung Pembelajaran Arsitektur Lantai 4',
terms_and_conditions:
      '1. Setiap institusi dapat mengirim maksimal 3 tim (2 debater per tim).\n2. Wajib menyertakan N-1 Adjudicator sesuai ketentuan WUDC.\n3. Bahasa pengantar sepenuhnya bahasa Inggris formal.',
    custom_metadata: { activity_type: 'Kompetisi Debat Bahasa Inggris' },
    published_at: '2026-09-12T08:00:00.000Z',
    created_at: '2026-09-12T08:00:00.000Z',
    updated_at: '2026-09-12T08:00:00.000Z',
    view_count: 980,
    tags: [
      { id: 'tag-kegiatan', name: 'Kegiatan', slug: 'kegiatan' },
      { id: 'tag-prestasi', name: 'Prestasi', slug: 'prestasi' },
      { id: 'tag-kompetisi', name: 'Kompetisi', slug: 'kompetisi' },
    ],
  },
  {
    id: 'keg-04',
    title: 'National Student Business Plan Competition: Sustainable Ventures',
    slug: 'kompetisi-business-plan-dan-pitch-deck-nasional',
    type: 'KEGIATAN_KOMPETISI',
    status: 'PUBLISHED',
    summary:
      'Kompetisi rencana bisnis berkelanjutan dengan validasi model finansial, analisis dampak sosial (ESG), dan sesi elevator pitch.',
    body: `Himpunan Mahasiswa Manajemen Bisnis menyelenggarakan kompetisi perencanaan bisnis bagi generasi penerus wirausaha Indonesia. Fokus kompetisi tahun ini menitikberatkan pada kelayakan finansial dan dampak lingkungan hidup berkelanjutan (ESG framework).

Para peserta berpeluang mendapatkan modal awal investasi dari investor malaikat serta bimbingan intensif penyusunan dokumen investasi yang bankable.

Catatan simulasi: Skenario kompetisi bisnis prototipe portal kampus.`,
    organizer: 'Himpunan Mahasiswa Manajemen Bisnis',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi tim mahasiswa menganalisis matriks strategi bisnis',
    registration_url: '/demo/simulasi-pendaftaran?kegiatan=business-plan-competition',
    registration_deadline: '2026-11-25T23:59:59.000Z',
location_or_url: 'Auditorium Fakultas Ekonomi Gedung 2',
terms_and_conditions:
      '1. Tim terdiri dari 2 hingga 3 mahasiswa aktif.\n2. Melampirkan executive summary maksimal 5 halaman dan pitch deck 10 slide.\n3. Bisnis belum pernah mendapatkan pendanaan Seri A.',
    custom_metadata: { activity_type: 'Kompetisi Rencana Bisnis' },
    published_at: '2026-09-15T09:00:00.000Z',
    created_at: '2026-09-15T09:00:00.000Z',
    updated_at: '2026-09-15T09:00:00.000Z',
    view_count: 1310,
    tags: [
      { id: 'tag-kegiatan', name: 'Kegiatan', slug: 'kegiatan' },
      { id: 'tag-wirausaha', name: 'Wirausaha', slug: 'wirausaha' },
      { id: 'tag-kompetisi', name: 'Kompetisi', slug: 'kompetisi' },
    ],
  },
  {
    id: 'keg-05',
    title: 'Sayembara Arsitektur Mahasiswa: Revitalisasi Ruang Publik Inklusif',
    slug: 'sayembara-desain-arsitektur-ruang-publik-inklusif',
    type: 'KEGIATAN_KOMPETISI',
    status: 'PUBLISHED',
    summary:
      'Kompetisi desain tata ruang kota dan arsitektur lanskap ramah anak, lansia, dan penyandang disabilitas di kawasan urban.',
    body: `Jurusan Arsitektur bekerja sama dengan Ikatan Arsitek Indonesia (IAI) Jawa Barat menyelenggarakan Sayembara Desain Ruang Publik Inklusif. Peserta ditantang merevitalisasi salah satu taman publik perkotaan agar memenuhi standar universal design ramah difabel.

Karya akan dinilai oleh dewan juri yang terdiri dari arsitek senior, perwakilan komunitas disabilitas, dan pejabat tata ruang kota.

Catatan simulasi: Sayembara desain arsitektur untuk demo prototype.`,
    organizer: 'Jurusan Arsitektur & IAI Jawa Barat',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi mahasiswa arsitektur meninjau maket dan sketsa desain visual',
    registration_url: '/demo/simulasi-pendaftaran?kegiatan=sayembara-desain-arsitektur',
    registration_deadline: '2026-11-15T23:59:59.000Z',
location_or_url: 'Studio Perancangan Arsitektur 4 & Galeri Pameran',
terms_and_conditions:
      '1. Mahasiswa aktif jurusan Arsitektur atau Arsitektur Lanskap.\n2. Mengirimkan poster digital ukuran A1 (maksimal 3 lembar) format PDF.\n3. Menyertakan video animasi peragaan ruang durasi 60 detik.',
    custom_metadata: { activity_type: 'Sayembara Desain Arsitektur' },
    published_at: '2026-09-17T10:00:00.000Z',
    created_at: '2026-09-17T10:00:00.000Z',
    updated_at: '2026-09-17T10:00:00.000Z',
    view_count: 890,
    tags: [
      { id: 'tag-kegiatan', name: 'Kegiatan', slug: 'kegiatan' },
      { id: 'tag-desain', name: 'Desain', slug: 'desain' },
      { id: 'tag-kompetisi', name: 'Kompetisi', slug: 'kompetisi' },
    ],
  },
  {
    id: 'keg-06',
    title: 'Pekan Olahraga Antar-Fakultas: Turnamen Rektor Cup 2026',
    slug: 'turnamen-futsal-dan-basket-rektor-cup',
    type: 'KEGIATAN_KOMPETISI',
    status: 'PUBLISHED',
    summary:
      'Ajang pesta olahraga tahunan mempertandingkan cabang futsal, bola basket, bulutangkis, dan tenis meja antar fakultas.',
    body: `Unit Kegiatan Mahasiswa Olahraga Terpadu mengajak seluruh kontingen fakultas menyiapkan atlet terbaiknya dalam ajang Rektor Cup 2026. Pertandingan memperebutkan piala bergilir Rektorat dan medali kejuaraan di 6 cabang olahraga utama.

Junjung tinggi sportivitas, persaudaraan antar jurusan, serta semangat solidaritas kampus yang inklusif dan sehat.

Catatan simulasi: Pendaftaran kontingen olahraga simulasi prototype.`,
    organizer: 'Unit Kegiatan Mahasiswa Olahraga Terpadu',
    hero_image_url: assetPath('/images/demo/graduation.jpg'),
    hero_image_alt: 'Foto ilustrasi selebrasi kemenangan kontingen atlet mahasiswa kampus',
    registration_url: '/demo/simulasi-pendaftaran?kegiatan=rektor-cup-olahraga',
    registration_deadline: '2026-10-18T23:59:59.000Z',
location_or_url: 'Kompleks Gelanggang Olahraga Mahasiswa',
terms_and_conditions:
      '1. Peserta terdaftar sebagai mahasiswa aktif pada fakultas yang diwakili.\n2. Wajib melampirkan surat keterangan sehat dari dokter poliklinik.\n3. Mengikuti technical meeting resmi per cabang olahraga.',
    custom_metadata: { activity_type: 'Turnamen Olahraga Kampus' },
    published_at: '2026-09-19T07:30:00.000Z',
    created_at: '2026-09-19T07:30:00.000Z',
    updated_at: '2026-09-19T07:30:00.000Z',
    view_count: 1720,
    tags: [
      { id: 'tag-kegiatan', name: 'Kegiatan', slug: 'kegiatan' },
      { id: 'tag-olahraga', name: 'Olahraga', slug: 'olahraga' },
      { id: 'tag-prestasi', name: 'Prestasi', slug: 'prestasi' },
    ],
  },
  {
    id: 'keg-07',
    title: 'Program Relawan Pengabdian Masyarakat: Literasi Digital Desa Ciburial',
    slug: 'volunteer-pengabdian-desa-binaan-ciwidey',
    type: 'KEGIATAN_KOMPETISI',
    status: 'PUBLISHED',
    summary:
      'Kegiatan bakti sosial dan pendampingan UMKM desa binaan dalam pemanfaatan pemasaran digital dan pembukuan elektronik.',
    body: `Lembaga Pengabdian Kepada Masyarakat membuka rekrutmen relawan mahasiswa untuk program pengabdian intensif akhir pekan di Desa Binaan Ciburial. Relawan akan mendampingi puluhan perajin dan kelompok tani dalam memasarkan produk melalui platform e-commerce serta menerapkan pencatatan kas digital.

Akomodasi, konsumsi, dan transportasi antar-jemput dari kampus disediakan oleh universitas. Program ini diakui setara dengan 2 SKS mata kuliah pengabdian masyarakat (KKN Tematik).

Catatan simulasi: Pendaftaran relawan pengabdian prototipe.`,
    organizer: 'Lembaga Pengabdian Kepada Masyarakat',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi interaksi edukasi dan literasi bersama warga masyarakat',
    registration_url: '/demo/simulasi-pendaftaran?kegiatan=relawan-desa-binaan',
    registration_deadline: '2026-10-22T23:59:59.000Z',
location_or_url: 'Kawasan Desa Binaan Bandung Barat',
terms_and_conditions:
      '1. Mahasiswa aktif minimal semester 3 semua disiplin ilmu.\n2. Bersedia tinggal di posko desa binaan selama 3 hari berturut-turut.\n3. Berkomitmen menyelesaikan modul edukasi pendampingan warga.',
    custom_metadata: { activity_type: 'Program Relawan Pengabdian' },
    published_at: '2026-09-21T08:00:00.000Z',
    created_at: '2026-09-21T08:00:00.000Z',
    updated_at: '2026-09-21T08:00:00.000Z',
    view_count: 940,
    tags: [
      { id: 'tag-kegiatan', name: 'Kegiatan', slug: 'kegiatan' },
      { id: 'tag-sosial', name: 'Sosial', slug: 'sosial' },
      { id: 'tag-pengabdian', name: 'Pengabdian', slug: 'pengabdian' },
    ],
  },
  {
    id: 'keg-08',
    title: 'University Data Science Challenge: Prediksi Permintaan Pasar',
    slug: 'kompetisi-data-science-dan-analitika-bisnis',
    type: 'KEGIATAN_KOMPETISI',
    status: 'PUBLISHED',
    summary:
      'Tantangan eksplorasi data, rekayasa fitur (feature engineering), dan permodelan machine learning menggunakan dataset dunia nyata.',
    body: `Data Science Club bersama Jurusan Matematika menggelar kompetisi analisis data terbuka. Peserta diberikan dataset riil transaksi retail multinasional untuk memprediksi fluktuasi permintaan barang musiman secara akurat.

Metrik evaluasi menggunakan Root Mean Squared Logarithmic Error (RMSLE). Tiga tim teratas dengan kode terbersih dan metodologi terbaik berkesempatan mempresentasikan solusinya pada symposium industri mitra.

Catatan simulasi: Tantangan analitika data untuk pengujian portal.`,
    organizer: 'Data Science Club & Jurusan Matematika',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi grafik analitika data dan kode pemodelan di monitor',
    registration_url: '/demo/simulasi-pendaftaran?kegiatan=data-science-challenge',
    registration_deadline: '2026-11-05T23:59:59.000Z',
location_or_url: 'Platform Kaggle Community & Lab Data Gedung 9',
terms_and_conditions:
      '1. Tim terdiri dari 1-3 mahasiswa.\n2. Dilarang menggunakan data eksternal di luar panduan resmi.\n3. Menyertakan notebook reproduksi hasil (Jupyter Notebook / Python script).',
    custom_metadata: { activity_type: 'Tantangan Analitika Data' },
    published_at: '2026-09-23T09:00:00.000Z',
    created_at: '2026-09-23T09:00:00.000Z',
    updated_at: '2026-09-23T09:00:00.000Z',
    view_count: 1610,
    tags: [
      { id: 'tag-kegiatan', name: 'Kegiatan', slug: 'kegiatan' },
      { id: 'tag-teknologi', name: 'Teknologi', slug: 'teknologi' },
      { id: 'tag-kompetisi', name: 'Kompetisi', slug: 'kompetisi' },
    ],
  },
  {
    id: 'keg-09',
    title: 'Festival Film Pendek Mahasiswa: Narasi Empati Sosial',
    slug: 'festival-film-pendek-dan-videografi-kreatif',
    type: 'KEGIATAN_KOMPETISI',
    status: 'PUBLISHED',
    summary:
      'Ajang kreasi sinematografi dan film dokumenter pendek berdurasi maksimal 15 menit bertema keberagaman dan solidaritas kemanusiaan.',
    body: `Klub Sinematografi Kampus membuka pendaftaran karya film pendek untuk festival film mahasiswa 2026. Ajang ini wadah unjuk kebolehan para sineas muda dalam menyajikan cerita sinematik yang menyentuh nurani dan menyuarakan isu-isu sosial di sekitar kita.

Dewan juri terdiri dari sutradara film nasional dan kurator festival film independen. Seluruh film finalis akan diputar dalam malam penganugerahan di gedung bioskop mini kampus.

Catatan simulasi: Skenario pendaftaran festival film dummy.`,
    organizer: 'Klub Sinematografi & Komunikasi Visual',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi kru film mahasiswa mempersiapkan kamera dan set pengambilan gambar',
    registration_url: '/demo/simulasi-pendaftaran?kegiatan=festival-film-pendek',
    registration_deadline: '2026-11-28T23:59:59.000Z',
location_or_url: 'Bioskop Mini Gedung Pusat Kebudayaan Lt. 2',
terms_and_conditions:
      '1. Durasi film 7 hingga 15 menit termasuk credit title.\n2. Musik pengiring wajib berlisensi bebas royalti atau karya orisinal peserta.\n3. Format video Full HD 1080p MP4.',
    custom_metadata: { activity_type: 'Festival Film & Sinema' },
    published_at: '2026-09-25T10:00:00.000Z',
    created_at: '2026-09-25T10:00:00.000Z',
    updated_at: '2026-09-25T10:00:00.000Z',
    view_count: 820,
    tags: [
      { id: 'tag-kegiatan', name: 'Kegiatan', slug: 'kegiatan' },
      { id: 'tag-seni', name: 'Seni', slug: 'seni' },
      { id: 'tag-kompetisi', name: 'Kompetisi', slug: 'kompetisi' },
    ],
  },

  // 3 Expired Activities (registration_deadline < 2026-10-02T12:00:00.000Z)
  {
    id: 'keg-10',
    title: 'Kontes Robot Cerdas Pemadam Api & Penyelamatan Bencana',
    slug: 'kompetisi-robotika-lintas-perguruan-tinggi',
    type: 'KEGIATAN_KOMPETISI',
    status: 'PUBLISHED',
    summary:
      'Kompetisi rancang bangun robot otonom navigating maze dan pemadaman titik api simulasi penyelamatan darurat.',
    body: `Pendaftaran kontes robot cerdas tingkat regional telah resmi ditutup pada 20 Agustus 2026. Sebanyak 28 tim robotik yang lolos evaluasi desain teknis saat ini tengah merampungkan kalibrasi sensor di arena lintasan latihan.

Babak eliminasi dan final akan disiarkan langsung melalui saluran media resmi fakultas teknik.

Catatan simulasi: Arsip kompetisi robotika yang sudah tutup registrasi.`,
    organizer: 'Laboratorium Mekatronika & Robotika',
    hero_image_url: assetPath('/images/demo/laptop.jpg'),
    hero_image_alt: 'Foto ilustrasi pengujian robotik dan sirkuit mikrokontroler di lab',
    registration_url: '/demo/simulasi-pendaftaran?kegiatan=kontes-robotika-kampus&status=tutup',
    registration_deadline: '2026-08-20T23:59:59.000Z',
location_or_url: 'Arena Robotika Gedung Sains Terapan',
terms_and_conditions:
      '1. Pendaftaran telah ditutup.\n2. Verifikasi fisik robot berlangsung saat technical inspection.',
    custom_metadata: { activity_type: 'Kontes Robotika Nasional' },
    published_at: '2026-07-15T08:00:00.000Z',
    created_at: '2026-07-15T08:00:00.000Z',
    updated_at: '2026-08-21T00:00:00.000Z',
    view_count: 2450,
    tags: [
      { id: 'tag-kegiatan', name: 'Kegiatan', slug: 'kegiatan' },
      { id: 'tag-teknologi', name: 'Teknologi', slug: 'teknologi' },
      { id: 'tag-kompetisi', name: 'Kompetisi', slug: 'kompetisi' },
    ],
  },
  {
    id: 'keg-11',
    title: 'Lomba Penulisan Esai Kritis Kebijakan Publik & Demokrasi',
    slug: 'lomba-esai-kritis-kebijakan-publik-nasional',
    type: 'KEGIATAN_KOMPETISI',
    status: 'PUBLISHED',
    summary:
      'Kompetisi naskah opini dan esai analisis kritis tata kelola anggaran daerah serta transparansi pemerintahan.',
    body: `Penerimaan naskah esai kritis kebijakan publik telah ditutup pada 10 September 2026. Tim juri independen sedang menilai 140 naskah yang masuk dari berbagai perguruan tinggi negeri maupun swasta.

Pengumuman 10 besar finalis terbaik akan disampaikan melalui surat elektronik resmi masing-masing peserta.

Catatan simulasi: Data arsip kompetisi esai lampau.`,
    organizer: 'Departemen Hubungan Internasional & Ilmu Pemerintahan',
    hero_image_url: assetPath('/images/demo/library.jpg'),
    hero_image_alt: 'Foto ilustrasi lembaran kertas naskah esai dan buku kajian kebijakan',
    registration_url: '/demo/simulasi-pendaftaran?kegiatan=lomba-esai-kebijakan&status=tutup',
    registration_deadline: '2026-09-10T23:59:59.000Z',
location_or_url: 'Pengiriman Naskah Elektronik',
terms_and_conditions:
      '1. Masa pendaftaran telah berakhir.\n2. Keputusan dewan juri bersifat mutlak dan tidak dapat diganggu gugat.',
    custom_metadata: { activity_type: 'Kompetisi Esai Nasional' },
    published_at: '2026-08-10T09:00:00.000Z',
    created_at: '2026-08-10T09:00:00.000Z',
    updated_at: '2026-09-11T00:00:00.000Z',
    view_count: 1180,
    tags: [
      { id: 'tag-kegiatan', name: 'Kegiatan', slug: 'kegiatan' },
      { id: 'tag-akademik', name: 'Akademik', slug: 'akademik' },
      { id: 'tag-kompetisi', name: 'Kompetisi', slug: 'kompetisi' },
    ],
  },
  {
    id: 'keg-12',
    title: 'Social Innovation Bootcamp: Inisiatif Pengelolaan Sampah Kampus',
    slug: 'bootcamp-inovasi-sosial-dan-lingkungan-hidup',
    type: 'KEGIATAN_KOMPETISI',
    status: 'PUBLISHED',
    summary:
      'Inkubasi proyek aksi mahasiswa mengolah limbah organik kantin menjadi pupuk kompos dan biogas ramah lingkungan.',
    body: `Pendaftaran Social Innovation Bootcamp lingkungan hijau telah selesai pada 28 September 2026. Kelompok peserta yang lolos tahap seleksi gagasan kini mengikuti pembekalan teknis biokonversi dan perakitan instalasi biodigester mini.

Hasil percontohan proyek akan diresmikan bersama di area sentra pengolahan kompos kampus pada bulan mendatang.

Catatan simulasi: Arsip lampau untuk menguji kelengkapan status kedaluwarsa kegiatan.`,
    organizer: 'Komunitas Mahasiswa Peduli Lingkungan Hijau',
    hero_image_url: assetPath('/images/demo/workshop.jpg'),
    hero_image_alt: 'Foto ilustrasi mahasiswa bergotong royong dalam inisiatif lingkungan hijau',
    registration_url: '/demo/simulasi-pendaftaran?kegiatan=bootcamp-inovasi-sosial&status=tutup',
    registration_deadline: '2026-09-28T23:59:59.000Z',
location_or_url: 'Pusat Kegiatan Kemahasiswaan Lantai 1',
terms_and_conditions:
      '1. Masa registrasi telah berakhir.\n2. Peserta terpilih wajib menghadiri sesi pengantar lapangan.',
    custom_metadata: { activity_type: 'Inkubasi Aksi Lingkungan' },
    published_at: '2026-08-28T10:00:00.000Z',
    created_at: '2026-08-28T10:00:00.000Z',
    updated_at: '2026-09-29T00:00:00.000Z',
    view_count: 760,
    tags: [
      { id: 'tag-kegiatan', name: 'Kegiatan', slug: 'kegiatan' },
      { id: 'tag-sosial', name: 'Sosial', slug: 'sosial' },
      { id: 'tag-workshop', name: 'Workshop', slug: 'workshop' },
    ],
  },
];
