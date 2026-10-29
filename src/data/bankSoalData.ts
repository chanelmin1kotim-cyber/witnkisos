import { AssessmentProject } from '../types/assessment';

export const SAMPLE_BANK_SOAL: AssessmentProject[] = [
  {
    id: 'proj-fikih-mi4',
    title: 'Penilaian Sumatif Fikih Kelas 4 MI (Zakat Fitrah & Infak)',
    createdAt: '2026-10-20T08:00:00.000Z',
    updatedAt: '2026-10-24T10:30:00.000Z',
    identity: {
      namaMadrasah: 'Madrasah Ibtidaiyah Negeri 1 Kotawaringin Timur',
      mataPelajaran: 'Fikih',
      jenjang: 'MI',
      kelas: 4,
      semester: 1,
      tahunPelajaran: '2026/2027',
      namaGuru: 'Witno, S.Pd.I',
      nipGuru: '198506122010011015',
      kepalaSekolah: 'Drs. H. Mahrus, M.Pd.',
      nipKepalaSekolah: '197403152002121004',
      alokasiWaktu: '60 Menit',
      kurikulum: 'Kurikulum Merdeka',
      penyusun: 'Disusun By Witno'
    },
    kisiKisi: [
      {
        id: 'kisi-1',
        nomorSoal: 1,
        capaianPembelajaran: 'Peserta didik memahami ketentuan zakat fitrah, infak, dan sedekah serta mempraktikkannya sebagai wujud ketaatan.',
        tujuanPembelajaran: 'Peserta didik dapat menjelaskan pengertian dan hukum zakat fitrah dengan tepat.',
        materiAjar: 'Ketentuan Zakat Fitrah',
        indikatorSoal: 'Disajikan narasi singkat, peserta didik dapat menentukan hukum mengeluarkan zakat fitrah bagi setiap muslim yang mampu dengan tepat.',
        level: 'L1',
        bentukSoal: 'Pilihan Ganda'
      },
      {
        id: 'kisi-2',
        nomorSoal: 2,
        capaianPembelajaran: 'Peserta didik memahami ketentuan zakat fitrah, infak, dan sedekah serta mempraktikkannya sebagai wujud ketaatan.',
        tujuanPembelajaran: 'Peserta didik mampu menghitung kadar besaran zakat fitrah berupa makanan pokok.',
        materiAjar: 'Ketentuan Zakat Fitrah',
        indikatorSoal: 'Disajikan data jumlah anggota keluarga, peserta didik dapat menghitung besaran zakat fitrah berupa beras yang wajib dikeluarkan dengan benar.',
        level: 'L2',
        bentukSoal: 'Pilihan Ganda'
      },
      {
        id: 'kisi-3',
        nomorSoal: 3,
        capaianPembelajaran: 'Peserta didik memahami ketentuan zakat fitrah, infak, dan sedekah serta mempraktikkannya sebagai wujud ketaatan.',
        tujuanPembelajaran: 'Peserta didik mampu menentukan golongan penerima zakat (mustahiq) dengan tepat.',
        materiAjar: 'Golongan Penerima Zakat',
        indikatorSoal: 'Disajikan deskripsi kondisi seseorang dalam masyarakat, peserta didik dapat mengidentifikasi golongan mustahiq zakat (fakir/miskin) secara tepat.',
        level: 'L2',
        bentukSoal: 'Pilihan Ganda'
      },
      {
        id: 'kisi-4',
        nomorSoal: 4,
        capaianPembelajaran: 'Peserta didik memahami ketentuan zakat fitrah, infak, dan sedekah serta mempraktikkannya sebagai wujud ketaatan.',
        tujuanPembelajaran: 'Peserta didik mampu membedakan waktu-waktu pembayaran zakat fitrah.',
        materiAjar: 'Waktu Pengeluaran Zakat Fitrah',
        indikatorSoal: 'Disajikan ilustrasi seorang ayah membayar zakat setelah salat Idul Fitri, peserta didik dapat menganalisis status hukum zakat fitrah tersebut.',
        level: 'L3',
        bentukSoal: 'Pilihan Ganda'
      },
      {
        id: 'kisi-5',
        nomorSoal: 5,
        capaianPembelajaran: 'Peserta didik memahami ketentuan zakat fitrah, infak, dan sedekah serta mempraktikkannya sebagai wujud ketaatan.',
        tujuanPembelajaran: 'Peserta didik dapat menjelaskan hikmah zakat fitrah bagi diri sendiri dan masyarakat.',
        materiAjar: 'Hikmah Zakat Fitrah',
        indikatorSoal: 'Peserta didik dapat menguraikan 3 hikmah penting pelaksanaan zakat fitrah bagi penyucian jiwa dan kepedulian sosial terhadap fakir miskin.',
        level: 'L3',
        bentukSoal: 'Uraian'
      }
    ],
    questions: [
      {
        id: 'q-1',
        nomorSoal: 1,
        kisiKisiId: 'kisi-1',
        stimulus: 'Setiap menjelang akhir bulan Ramadan, umat Islam berkewajiban menyucikan jiwa dengan mengeluarkan sebagian bahan makanan pokok.',
        pertanyaan: 'Hukum menunaikan zakat fitrah bagi setiap muslim yang menjumpai bulan Ramadan dan memiliki kelebihan nafkah pada malam serta hari raya Idul Fitri adalah ....',
        bentukSoal: 'Pilihan Ganda',
        level: 'L1',
        opsi: [
          { label: 'A', text: 'Sunah muakkad' },
          { label: 'B', text: 'Fardu \'ain (wajib)' },
          { label: 'C', text: 'Fardu kifayah' },
          { label: 'D', text: 'Mubah' }
        ],
        kunciJawaban: 'B',
        pembahasan: 'Zakat fitrah hukumnya fardu \'ain (wajib) bagi setiap individu muslim, baik laki-laki maupun perempuan, anak-anak maupun dewasa yang memiliki kecukupan rezeki.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Tepat menguji hukum zakat fitrah sesuai indikator L1.'
      },
      {
        id: 'q-2',
        nomorSoal: 2,
        kisiKisiId: 'kisi-2',
        stimulus: 'Keluarga Pak Ahmad terdiri dari ayah, ibu, dan 2 orang anak. Pak Ahmad hendak menunaikan zakat fitrah untuk seluruh anggota keluarganya berupa beras.',
        pertanyaan: 'Jika ketentuan zakat fitrah adalah 2,5 kg beras per jiwa, jumlah beras yang harus dikeluarkan oleh Pak Ahmad adalah ....',
        bentukSoal: 'Pilihan Ganda',
        level: 'L2',
        opsi: [
          { label: 'A', text: '5,0 kg' },
          { label: 'B', text: '7,5 kg' },
          { label: 'C', text: '10,0 kg' },
          { label: 'D', text: '12,5 kg' }
        ],
        kunciJawaban: 'C',
        pembahasan: 'Jumlah jiwa = 4 orang (ayah, ibu, 2 anak). Besaran beras = 4 x 2,5 kg = 10,0 kg. Jadi total beras yang dikeluarkan adalah 10 kg.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Sangat sesuai mengukur kemampuan menghitung besaran zakat (L2).'
      },
      {
        id: 'q-3',
        nomorSoal: 3,
        kisiKisiId: 'kisi-3',
        stimulus: 'Di sebuah desa terdapat seorang kakek tua yang hidup sebatang kara dan sudah tidak memiliki tenaga untuk bekerja mencukupi kebutuhan makan sehari-hari.',
        pertanyaan: 'Berdasarkan ketentuan delapan asnaf (mustahiq) dalam Al-Qur\'an, kakek tersebut paling tepat digolongkan sebagai ....',
        bentukSoal: 'Pilihan Ganda',
        level: 'L2',
        opsi: [
          { label: 'A', text: 'Fakir' },
          { label: 'B', text: 'Gharim' },
          { label: 'C', text: 'Ibnu sabil' },
          { label: 'D', text: 'Amil' }
        ],
        kunciJawaban: 'A',
        pembahasan: 'Fakir adalah orang yang tidak mempunyai harta dan penghasilan sama sekali serta tidak mampu mencukupi kebutuhan pokok sehari-hari.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Mengukur penentuan golongan mustahiq secara tepat.'
      },
      {
        id: 'q-4',
        nomorSoal: 4,
        kisiKisiId: 'kisi-4',
        stimulus: 'Karena kesibukan mudik, Pak Ridwan baru sempat menyerahkan beras zakat fitrah kepada pengurus musala pada sore hari tanggal 1 Syawal setelah salat Idul Fitri selesai.',
        pertanyaan: 'Berdasarkan ketentuan syariat, status pembayaran zakat fitrah yang dilakukan oleh Pak Ridwan adalah ....',
        bentukSoal: 'Pilihan Ganda',
        level: 'L3',
        opsi: [
          { label: 'A', text: 'Dianggap batal dan berdosa besar' },
          { label: 'B', text: 'Tetap sah sebagai zakat fitrah sempurna' },
          { label: 'C', text: 'Hanya bernilai sedekah biasa dan tidak menggugurkan kewajiban zakat fitrah' },
          { label: 'D', text: 'Dapat digantikan dengan puasa kafarat selama tiga hari' }
        ],
        kunciJawaban: 'C',
        pembahasan: 'Berdasarkan hadis Rasulullah Saw., zakat fitrah yang dikeluarkan setelah salat Idul Fitri tanpa uzur syar\'i hanya terhitung sebagai sedekah biasa, karena waktu afdalnya adalah sebelum salat Idul Fitri.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Menganalisis hukum kasus waktu zakat fitrah secara kontekstual (L3).'
      },
      {
        id: 'q-5',
        nomorSoal: 5,
        kisiKisiId: 'kisi-5',
        stimulus: 'Zakat fitrah disyariatkan dengan tujuan mulia baik bagi orang yang mengeluarkannya (muzaki) maupun penerimanya (mustahiq).',
        pertanyaan: 'Uraikan 3 (tiga) hikmah penting dari pelaksanaan ibadah zakat fitrah bagi kehidupan pribadi dan sosial masyarakat!',
        bentukSoal: 'Uraian',
        level: 'L3',
        kunciJawaban: 'Pedoman Jawaban:\n1. Menyucikan jiwa orang yang berpuasa dari perbuatan sia-sia dan kata-kata kotor selama Ramadan.\n2. Berbagi kebahagiaan dengan fakir miskin agar mereka dapat ikut merayakan hari raya Idul Fitri.\n3. Mempererat tali persaudaraan (ukhuwah Islamiyah) dan menumbuhkan sikap peduli terhadap sesama.',
        rubrikPenskoran: {
          skor4: 'Peserta didik menyebutkan 3 hikmah secara lengkap, tepat, dan menjelaskan dampaknya bagi diri dan masyarakat.',
          skor3: 'Peserta didik menyebutkan 2 hikmah dengan benar dan jelas, atau 3 hikmah secara singkat.',
          skor2: 'Peserta didik menyebutkan 1 hikmah dengan benar.',
          skor1: 'Jawaban kurang tepat atau hanya menyebutkan kata kunci tanpa penjelasan.',
          skor0: 'Tidak menjawab atau jawaban sama sekali salah.'
        },
        pembahasan: 'Hikmah zakat fitrah mencakup aspek penyucian diri (ruhiyah) dan pemerataan kesejahteraan serta kepedulian sosial (ijtima\'iyyah).',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Uraian terarah dengan rubrik penilaian bertingkat.'
      }
    ]
  },
  {
    id: 'proj-mtk-sd4',
    title: 'Asesmen Harian Matematika Kelas 4 SD/MI (Pecahan)',
    createdAt: '2026-10-18T09:00:00.000Z',
    updatedAt: '2026-10-23T11:00:00.000Z',
    identity: {
      namaMadrasah: 'SD Negeri Percobaan 1',
      mataPelajaran: 'Matematika',
      jenjang: 'SD',
      kelas: 4,
      semester: 1,
      tahunPelajaran: '2026/2027',
      namaGuru: 'Siti Rahmawati, S.Pd.',
      nipGuru: '198902142014022003',
      kepalaSekolah: 'Bambang Irawan, M.Pd.',
      nipKepalaSekolah: '196807101993031005',
      alokasiWaktu: '60 Menit',
      kurikulum: 'Kurikulum Merdeka',
      penyusun: 'Disusun By Witno'
    },
    kisiKisi: [
      {
        id: 'kisi-m1',
        nomorSoal: 1,
        capaianPembelajaran: 'Peserta didik dapat memahami pecahan senilai, membandingkan dan mengurutkan pecahan.',
        tujuanPembelajaran: 'Peserta didik mampu membandingkan dua pecahan berpenyebut sama.',
        materiAjar: 'Membandingkan Pecahan',
        indikatorSoal: 'Disajikan dua pecahan berpenyebut sama, peserta didik dapat menentukan tanda perbandingan (<, >, =) yang tepat.',
        level: 'L1',
        bentukSoal: 'Pilihan Ganda'
      },
      {
        id: 'kisi-m2',
        nomorSoal: 2,
        capaianPembelajaran: 'Peserta didik dapat memahami pecahan senilai, membandingkan dan mengurutkan pecahan.',
        tujuanPembelajaran: 'Peserta didik mampu menentukan pecahan senilai.',
        materiAjar: 'Pecahan Senilai',
        indikatorSoal: 'Disajikan sebuah pecahan sederhana, peserta didik dapat menentukan pecahan senilai melalui perkalian pembilang dan penyebut.',
        level: 'L2',
        bentukSoal: 'Pilihan Ganda'
      },
      {
        id: 'kisi-m3',
        nomorSoal: 3,
        capaianPembelajaran: 'Peserta didik dapat memahami pecahan senilai, membandingkan dan mengurutkan pecahan.',
        tujuanPembelajaran: 'Peserta didik mampu menyelesaikan masalah kontekstual mengenai pecahan.',
        materiAjar: 'Pecahan dalam Kehidupan Sehari-hari',
        indikatorSoal: 'Disajikan cerita tentang pembagian kue di rumah, peserta didik dapat menganalisis bagian kue yang lebih besar dengan benar.',
        level: 'L3',
        bentukSoal: 'Pilihan Ganda'
      }
    ],
    questions: [
      {
        id: 'q-m1',
        nomorSoal: 1,
        kisiKisiId: 'kisi-m1',
        pertanyaan: 'Tanda perbandingan yang tepat untuk melengkapi pernyataan 3/8 ... 5/8 adalah ....',
        bentukSoal: 'Pilihan Ganda',
        level: 'L1',
        opsi: [
          { label: 'A', text: '>' },
          { label: 'B', text: '<' },
          { label: 'C', text: '=' },
          { label: 'D', text: '≥' }
        ],
        kunciJawaban: 'B',
        pembahasan: 'Karena penyebut kedua pecahan sudah sama yaitu 8, kita cukup membandingkan pembilangnya: 3 lebih kecil dari 5. Sehingga 3/8 < 5/8.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Sangat sesuai indikator L1.'
      },
      {
        id: 'q-m2',
        nomorSoal: 2,
        kisiKisiId: 'kisi-m2',
        pertanyaan: 'Pecahan berikut yang senilai dengan pecahan 2/5 adalah ....',
        bentukSoal: 'Pilihan Ganda',
        level: 'L2',
        opsi: [
          { label: 'A', text: '4/10' },
          { label: 'B', text: '4/15' },
          { label: 'C', text: '6/10' },
          { label: 'D', text: '5/2' }
        ],
        kunciJawaban: 'A',
        pembahasan: 'Pecahan senilai diperoleh dengan mengalikan pembilang dan penyebut dengan angka yang sama: (2 x 2) / (5 x 2) = 4/10.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Sesuai indikator L2.'
      },
      {
        id: 'q-m3',
        nomorSoal: 3,
        kisiKisiId: 'kisi-m3',
        stimulus: 'Ibu memotong sebuah kue bolu menjadi 8 bagian sama besar. Budi memakan 2 bagian, sedangkan Dinda memakan 3 bagian.',
        pertanyaan: 'Berdasarkan cerita tersebut, pernyataan yang paling benar adalah ....',
        bentukSoal: 'Pilihan Ganda',
        level: 'L3',
        opsi: [
          { label: 'A', text: 'Budi memakan kue lebih banyak daripada Dinda' },
          { label: 'B', text: 'Dinda memakan 3/8 bagian kue dan lebih banyak dari Budi' },
          { label: 'C', text: 'Sisa kue bolu ibu adalah 5/8 bagian' },
          { label: 'D', text: 'Bagian kue Budi dan Dinda sama banyak' }
        ],
        kunciJawaban: 'B',
        pembahasan: 'Budi = 2/8 bagian, Dinda = 3/8 bagian. Karena 3/8 > 2/8, maka Dinda memakan kue lebih banyak dari Budi.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Sesuai indikator L3 kontekstual kehidupan sehari-hari anak.'
      }
    ]
  }
];
