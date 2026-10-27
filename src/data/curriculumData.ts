import { Jenjang } from '../types/assessment';

export interface SubjectPreset {
  mataPelajaran: string;
  jenjang: Jenjang[];
  kelas: number[];
  semester: 1 | 2;
  cp: string;
  tpList: string[];
  materiList: string[];
}

export const CURRICULUM_PRESETS: SubjectPreset[] = [
  // --- MATEMATIKA ---
  {
    mataPelajaran: 'Matematika',
    jenjang: ['SD', 'MI'],
    kelas: [4],
    semester: 1,
    cp: 'Peserta didik dapat memahami dan melakukan operasi hitung bilangan cacah sampai 10.000, menentukan pecahan senilai, membandingkan dan mengurutkan pecahan serta menyelesaikan masalah berkaitan dengan kelipatan dan faktor bilangan.',
    tpList: [
      'Peserta didik mampu membandingkan dan mengurutkan pecahan dengan penyebut sama dan berbeda.',
      'Peserta didik mampu menentukan pecahan senilai menggunakan gambar dan perkalian/pembagian silang.',
      'Peserta didik mampu menyelesaikan masalah sehari-hari yang berkaitan dengan penjumlahan dan pengurangan pecahan berpenyebut sama.'
    ],
    materiList: ['Pecahan Senilai', 'Membandingkan Pecahan', 'Operasi Pecahan Sederhana']
  },
  {
    mataPelajaran: 'Matematika',
    jenjang: ['SD', 'MI'],
    kelas: [1, 2],
    semester: 1,
    cp: 'Peserta didik dapat membilang lambang bilangan cacah sampai dengan 50, menunjukkan pemahaman nilai tempat satuan dan puluhan, serta melakukan penjumlahan dan pengurangan sederhana.',
    tpList: [
      'Peserta didik dapat menghitung dan menuliskan bilangan cacah 1 sampai 20 dengan bantuan benda konkret.',
      'Peserta didik mampu melakukan operasi penjumlahan dua bilangan dengan hasil maksimal 20.',
      'Peserta didik mampu menyelesaikan masalah pengurangan sederhana dalam kehidupan sehari-hari.'
    ],
    materiList: ['Membilang Benda Konkret 1-20', 'Penjumlahan Bilangan Sampai 20', 'Pengurangan Bilangan Sampai 20']
  },
  {
    mataPelajaran: 'Matematika',
    jenjang: ['SD', 'MI'],
    kelas: [5, 6],
    semester: 1,
    cp: 'Peserta didik dapat menganalisis dan menyelesaikan masalah perbandingan, skala, bangun ruang, serta penyajian data dalam bentuk diagram dan tabel.',
    tpList: [
      'Peserta didik dapat menghitung volume kubus dan balok menggunakan kubus satuan dan rumus volume.',
      'Peserta didik mampu menganalisis sifat-sifat bangun ruang kubus, balok, dan prisma.',
      'Peserta didik mampu menyelesaikan permasalahan kontekstual mengenai perbandingan senilai.'
    ],
    materiList: ['Volume Kubus dan Balok', 'Jaring-jaring Bangun Ruang', 'Perbandingan dan Skala']
  },

  // --- IPAS (ILMU PENGETAHUAN ALAM DAN SOSIAL) ---
  {
    mataPelajaran: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    jenjang: ['SD', 'MI'],
    kelas: [4],
    semester: 1,
    cp: 'Peserta didik mengidentifikasi keterkaitan antara bentuk serta fungsi bagian tubuh pada tumbuhan, mengidentifikasi wujud zat dan perubahannya dalam kehidupan sehari-hari.',
    tpList: [
      'Peserta didik dapat mengidentifikasi bagian-bagian tubuh tumbuhan dan fungsinya bagi kelangsungan hidup tumbuhan.',
      'Peserta didik dapat menjelaskan proses fotosintesis dan pentingnya bagi makhluk hidup.',
      'Peserta didik dapat membedakan wujud zat (padat, cair, gas) serta contoh perubahannya.'
    ],
    materiList: ['Bagian Tubuh Tumbuhan & Fotosintesis', 'Wujud Zat dan Perubahannya', 'Gaya di Sekitar Kita']
  },
  {
    mataPelajaran: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    jenjang: ['SD', 'MI'],
    kelas: [5],
    semester: 1,
    cp: 'Peserta didik menganalisis hubungan antarmakhluk hidup pada suatu ekosistem dalam bentuk jaring-jaring makanan dan mendeskripsikan proses transfer energi.',
    tpList: [
      'Peserta didik mampu menjelaskan peran produsen, konsumen, dan pengurai dalam rantai makanan.',
      'Peserta didik dapat menganalisis dampak kepunahan salah satu populasi terhadap jaring-jaring makanan dalam ekosistem.',
      'Peserta didik mampu mengidentifikasi sifat-sifat cahaya dan keterkaitannya dengan penglihatan manusia.'
    ],
    materiList: ['Rantai Makanan & Jaring-jaring Makanan', 'Keseimbangan Ekosistem', 'Sifat-sifat Cahaya & Bunyi']
  },

  // --- BAHASA INDONESIA ---
  {
    mataPelajaran: 'Bahasa Indonesia',
    jenjang: ['SD', 'MI'],
    kelas: [4],
    semester: 1,
    cp: 'Peserta didik mampu memahami pesan dan informasi tentang kehidupan sehari-hari dalam bentuk cetak maupun elektronik, mengidentifikasi ide pokok dan ide pendukung, serta menggunakan kalimat transitif dan intransitif.',
    tpList: [
      'Peserta didik dapat menemukan ide pokok dan ide pendukung dalam teks paragraf deskripsi.',
      'Peserta didik dapat membedakan kalimat transitif dan kalimat intransitif dalam teks narasi.',
      'Peserta didik mampu menggunakan tanda baca titik, koma, dan huruf kapital secara tepat.'
    ],
    materiList: ['Ide Pokok dan Pendukung', 'Kalimat Transitif & Intransitif', 'Penggunaan Huruf Kapital & Tanda Baca']
  },
  {
    mataPelajaran: 'Bahasa Indonesia',
    jenjang: ['SD', 'MI'],
    kelas: [1, 2],
    semester: 1,
    cp: 'Peserta didik bersikap menjadi penyimak yang baik, memahami informasi dari teks lisan dan visual tentang diri dan lingkungan, serta merangkai suku kata menjadi kata bermakna.',
    tpList: [
      'Peserta didik mampu membaca dan mengeja kata sederhana yang diawali huruf b, c, d.',
      'Peserta didik dapat menceritakan kembali isi gambar atau cerita pendek yang didengar.',
      'Peserta didik mampu menyusun kalimat sederhana dengan pola Subjek-Predikat.'
    ],
    materiList: ['Mengenal Suku Kata dan Kata', 'Menceritakan Gambar Berseri', 'Kalimat Sederhana Sehari-hari']
  },

  // --- PENDIDIKAN PANCASILA ---
  {
    mataPelajaran: 'Pendidikan Pancasila',
    jenjang: ['SD', 'MI'],
    kelas: [4, 5],
    semester: 1,
    cp: 'Peserta didik mampu memahami dan menyajikan makna sila-sila Pancasila dalam kehidupan sehari-hari di lingkungan keluarga, sekolah, dan masyarakat, serta menerapkan norma dan aturan.',
    tpList: [
      'Peserta didik dapat mengidentifikasi contoh perilaku pengamalan sila ke-1 sampai ke-5 Pancasila.',
      'Peserta didik mampu membedakan hak dan kewajiban sebagai peserta didik di sekolah dan anggota keluarga.',
      'Peserta didik dapat menunjukkan sikap menghargai keberagaman budaya dan agama di Indonesia.'
    ],
    materiList: ['Nilai-Nilai Sila Pancasila', 'Hak dan Kewajiban Warga Sekolah', 'Keberagaman Suku dan Budaya']
  },

  // --- FIKIH (MI) ---
  {
    mataPelajaran: 'Fikih',
    jenjang: ['MI'],
    kelas: [4],
    semester: 1,
    cp: 'Peserta didik mampu memahami ketentuan zakat fitrah, infak, dan sedekah serta mempraktikkannya sebagai wujud ketaatan kepada Allah Swt. dan kepedulian sosial terhadap sesama.',
    tpList: [
      'Peserta didik dapat menjelaskan pengertian dan hukum zakat fitrah, infak, dan sedekah.',
      'Peserta didik mampu menentukan mustahiq (golongan penerima) zakat fitrah dengan tepat.',
      'Peserta didik mampu menghitung kadar besaran zakat fitrah berupa makanan pokok (beras) per jiwa.'
    ],
    materiList: ['Ketentuan Zakat Fitrah', 'Golongan Penerima Zakat (Mustahiq)', 'Infak dan Sedekah']
  },
  {
    mataPelajaran: 'Fikih',
    jenjang: ['MI'],
    kelas: [3],
    semester: 1,
    cp: 'Peserta didik memahami tata cara salat sunah rawatib, salat jamak dan qashar serta melaksanakannya dalam kehidupan sehari-hari.',
    tpList: [
      'Peserta didik dapat menyebutkan macam-macam salat sunah rawatib muakkad dan ghairu muakkad.',
      'Peserta didik mampu membedakan salat jamak taqdim dan jamak takhir beserta syarat-syaratnya.',
      'Peserta didik dapat menjelaskan rukun dan cara pelaksanaan salat qashar.'
    ],
    materiList: ['Salat Sunah Rawatib', 'Salat Jamak dan Qashar', 'Salat bagi Orang Sakit']
  },

  // --- AKIDAH AKHLAK (MI) ---
  {
    mataPelajaran: 'Akidah Akhlak',
    jenjang: ['MI'],
    kelas: [4],
    semester: 1,
    cp: 'Peserta didik terbiasa mengucapkan kalimat thayyibah (Subhanallah, Masya Allah, Allahu Akbar), memahami makna Asmaul Husna, serta menghindari akhlak tercela.',
    tpList: [
      'Peserta didik dapat menjelaskan waktu dan situasi yang tepat mengucapkan kalimat thayyibah.',
      'Peserta didik mampu meneladani makna Asmaul Husna: Al-Malik, Al-Quddus, dan As-Salam.',
      'Peserta didik dapat mengidentifikasi ciri-ciri akhlak terpuji seperti bersyukur dan rendah hati (tawadhu).'
    ],
    materiList: ['Kalimat Thayyibah', 'Asmaul Husna (Al-Malik, Al-Quddus, As-Salam)', 'Akhlak Terpuji Menghargai Sesama']
  },

  // --- AL-QUR'AN HADIS (MI) ---
  {
    mataPelajaran: 'Al-Qur\'an Hadis',
    jenjang: ['MI'],
    kelas: [4],
    semester: 1,
    cp: 'Peserta didik mampu membaca, menghafal, dan memahami makna surah-surah pendek pilihan (At-Takatsur dan Al-Zalzalah) serta hukum tajwid nun sukun/tanwin.',
    tpList: [
      'Peserta didik dapat melafalkan surah At-Takatsur dengan fasih dan tartil.',
      'Peserta didik dapat mengidentifikasi hukum bacaan Idzhar Halqi dan Idgham Bighunnah dalam ayat Al-Qur\'an.',
      'Peserta didik mampu menjelaskan kandungan surah At-Takatsur tentang bahaya bermegah-megahan.'
    ],
    materiList: ['Surah At-Takatsur', 'Hukum Bacaan Nun Sukun dan Tanwin', 'Kandungan Nilai Surah Pilihan']
  },

  // --- SEJARAH KEBUDAYAAN ISLAM / SKI (MI) ---
  {
    mataPelajaran: 'Sejarah Kebudayaan Islam (SKI)',
    jenjang: ['MI'],
    kelas: [5],
    semester: 1,
    cp: 'Peserta didik mampu menganalisis peristiwa hijrah Nabi Muhammad Saw. ke Madinah serta upaya pembinaan masyarakat Madinah.',
    tpList: [
      'Peserta didik dapat menceritakan sebab-sebab Nabi Muhammad Saw. hijrah ke Yatsrib (Madinah).',
      'Peserta didik mampu menganalisis langkah pertama Nabi Muhammad Saw. dalam membangun Masjid Nabawi.',
      'Peserta didik mampu mengidentifikasi nilai persaudaraan antara kaum Muhajirin dan Anshar.'
    ],
    materiList: ['Peristiwa Hijrah ke Madinah', 'Pembangunan Masjid Nabawi', 'Persaudaraan Kaum Muhajirin dan Anshar']
  },

  // --- PAI & BUDI PEKERTI (SD) ---
  {
    mataPelajaran: 'Pendidikan Agama Islam dan Budi Pekerti',
    jenjang: ['SD'],
    kelas: [4],
    semester: 1,
    cp: 'Peserta didik memahami pesan pokok Surah Al-Hujurat ayat 13 tentang keragaman manusia sebagai sunnatullah, mengenal Asmaul Husna, serta membiasakan sikap toleransi.',
    tpList: [
      'Peserta didik dapat membaca QS. Al-Hujurat: 13 dengan kaidah tajwid yang benar.',
      'Peserta didik mampu menjelaskan pesan keragaman bangsa dan suku sebagai kehendak Allah untuk saling mengenal.',
      'Peserta didik dapat menampilkan contoh sikap saling menghormati antarteman yang berbeda suku dan agama.'
    ],
    materiList: ['QS. Al-Hujurat Ayat 13', 'Keragaman sebagai Sunnatullah', 'Sikap Saling Menghargai & Berakhlak Mulia']
  }
];
