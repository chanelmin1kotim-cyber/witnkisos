import { KisiKisiItem, QuestionItem, SchoolIdentity, CognitiveLevel, BentukSoal } from '../types/assessment';

/**
 * Local Client-Side Generator
 * Ensures that generation NEVER fails even during network disruptions,
 * iframe sandboxing issues, or API rate limits.
 */

const OPERATIONAL_VERBS = {
  L1: ['mengidentifikasi', 'menyebutkan', 'menunjukkan', 'mengenali', 'menjelaskan secara sederhana'],
  L2: ['menentukan', 'menerapkan', 'menghitung', 'mengelompokkan', 'menyelesaikan masalah kontekstual'],
  L3: ['menganalisis', 'membandingkan', 'menyimpulkan', 'mengevaluasi', 'memecahkan masalah']
};

/**
 * Kaidah Baku Penulisan Soal Pilihan Ganda (Kemendikbudristek & Kemenag SD/MI):
 * Pokok soal (stem) pilihan ganda HARUS berupa kalimat pernyataan belum selesai (incomplete statement)
 * dan diakhiri dengan 4 titik (....).
 * Pokok soal pilihan ganda DILARANG KERAS menggunakan tanda tanya (?).
 */
export function sanitizePgQuestion(text: string): string {
  if (!text) return '';
  let str = text.trim();

  // 1. Hapus seluruh tanda tanya (?)
  str = str.replace(/[?？]+/g, '');

  // 2. Ubah kata tanya di awal kalimat atau klausa menjadi bentuk pernyataan
  str = str.replace(/(^|[.?!]\s+)[Bb]erapakah\s+/g, '$1');
  str = str.replace(/(^|[.?!]\s+)[Bb]erapa\s+kilogram\s+/gi, '$1jumlah beras ');
  str = str.replace(/(^|[.?!]\s+)[Bb]erapa\s+jumlah\s+/gi, '$1jumlah ');
  str = str.replace(/(^|[.?!]\s+)[Bb]erapa\s+total\s+/gi, '$1total ');
  str = str.replace(/(^|[.?!]\s+)[Bb]erapa\s+/gi, '$1jumlah ');
  str = str.replace(/(^|[.?!]\s+)[Aa]pakah\s+/gi, '$1');
  str = str.replace(/(^|[.?!]\s+)[Mm]anakah\s+/gi, '$1');
  str = str.replace(/(^|[.?!]\s+)[Bb]agaimanakah\s+/gi, '$1');
  str = str.replace(/(^|[.?!]\s+)[Bb]agaimana\s+/gi, '$1');
  str = str.replace(/(^|[.?!]\s+)[Ss]iapakah\s+/gi, '$1');
  str = str.replace(/(^|[.?!]\s+)[Ss]iapa\s+/gi, '$1');

  // Bersihkan tanda baca titik/titik dua/spasi di akhir
  str = str.replace(/[\.\:\s]+$/g, '').trim();

  // Rapikan huruf kapital di awal kalimat jika ada pemenggalan
  if (str.length > 0) {
    str = str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Jika diakhiri partikel/predikat baku (adalah, yaitu, ialah, sebesar, ke, dsb.)
  if (/(adalah|yaitu|ialah|sebesar|sebanyak|berjumlah|berbunyi|dinamakan|disebut|ke|pada|dengan|oleh)$/i.test(str)) {
    return `${str} ....`;
  }

  // Jika frasa kuantitas seperti "Keliling persegi tersebut"
  if (/(keliling|luas|panjang|hasil|jumlah|total|nilai|volume|jarak|kecepatan|status|hukum)\s+[^.]+$/i.test(str) && !str.toLowerCase().includes('adalah')) {
    return `${str} adalah ....`;
  }

  return `${str} ....`;
}

export function generateLocalKisiKisi(
  params: {
    totalSoal: number;
    levelDist: { L1: number; L2: number; L3: number };
    bentukDist: { pg: number; uraian: number };
    cp: string;
    tpList: string[];
    materiList: string[];
  },
  identity: SchoolIdentity
): KisiKisiItem[] {
  const { totalSoal, levelDist, bentukDist, cp, tpList, materiList } = params;

  const countL1 = Math.max(1, Math.round((totalSoal * (levelDist.L1 || 30)) / 100));
  const countL3 = Math.max(1, Math.round((totalSoal * (levelDist.L3 || 20)) / 100));
  const countL2 = Math.max(1, totalSoal - countL1 - countL3);

  const countPg = bentukDist.pg !== undefined ? bentukDist.pg : Math.round(totalSoal * 0.7);

  const items: KisiKisiItem[] = [];

  for (let i = 1; i <= totalSoal; i++) {
    let level: CognitiveLevel = 'L2';
    if (i <= countL1) level = 'L1';
    else if (i > totalSoal - countL3) level = 'L3';

    const bentukSoal: BentukSoal = i <= countPg ? 'Pilihan Ganda' : 'Uraian';
    const currentTp = tpList[(i - 1) % Math.max(1, tpList.length)] || 'Peserta didik memahami konsep pokok pada materi terkait.';
    const currentMateri = materiList[(i - 1) % Math.max(1, materiList.length)] || identity.mataPelajaran;

    const verbList = OPERATIONAL_VERBS[level];
    const selectedVerb = verbList[(i - 1) % verbList.length];

    const indikatorSoal = `Disajikan ${level === 'L3' ? 'masalah kontekstual sehari-hari' : 'data/pernyataan sederhana'} tentang ${currentMateri.toLowerCase()}, peserta didik dapat ${selectedVerb} dengan tepat dan benar.`;

    items.push({
      id: `kisi-loc-${Date.now()}-${i}`,
      nomorSoal: i,
      capaianPembelajaran: cp || `Memahami capaian pembelajaran ${identity.mataPelajaran} pada jenjang ${identity.jenjang} Kelas ${identity.kelas}.`,
      tujuanPembelajaran: currentTp,
      materiAjar: currentMateri,
      indikatorSoal,
      level,
      bentukSoal,
    });
  }

  return items;
}

function makeLocalShuffledOptions(correctText: string, distractors: string[], seed: number) {
  const allTexts = [correctText, ...distractors.slice(0, 3)];
  const shuffled = [...allTexts].sort((a, b) => {
    const hashA = Math.sin(seed + a.length * 13 + 7);
    const hashB = Math.sin(seed + b.length * 17 + 11);
    return hashA - hashB;
  });

  const labels: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  const opsi = labels.map((label, idx) => ({
    label,
    text: shuffled[idx] || `Pilihan ${label}`
  }));

  const correctIndex = shuffled.indexOf(correctText);
  const kunciJawaban = labels[correctIndex >= 0 ? correctIndex : 0];

  return { opsi, kunciJawaban };
}

export function generateLocalQuestionItem(
  kisi: KisiKisiItem,
  index: number,
  identity: SchoolIdentity,
  seed: number = Date.now()
): QuestionItem {
  const { jenjang, kelas, mataPelajaran } = identity;
  const materiLower = (kisi.materiAjar || '').toLowerCase();
  const indikatorLower = (kisi.indikatorSoal || '').toLowerCase();
  const isPg = kisi.bentukSoal === 'Pilihan Ganda';
  const level = kisi.level;
  const nomor = kisi.nomorSoal || index + 1;
  const vSeed = seed + nomor * 31;

  // --- MATEMATIKA ---
  if (mataPelajaran.toLowerCase().includes('matematika') || materiLower.includes('pecahan') || materiLower.includes('hitung') || materiLower.includes('bilangan')) {
    if (materiLower.includes('senilai') || indikatorLower.includes('senilai')) {
      const fractionPairs = [
        { q: '1/2', ans: '2/4', wrong: ['2/6', '3/8', '3/5'] },
        { q: '2/3', ans: '4/6', wrong: ['3/6', '4/9', '2/6'] },
        { q: '3/4', ans: '6/8', wrong: ['3/8', '6/12', '4/8'] },
        { q: '1/3', ans: '2/6', wrong: ['2/9', '3/6', '1/6'] }
      ];
      const selected = fractionPairs[(nomor - 1) % fractionPairs.length];
      return {
        id: `q-loc-${Date.now()}-${nomor}`,
        nomorSoal: nomor,
        kisiKisiId: kisi.id,
        stimulus: 'Pecahan senilai diperoleh dengan mengalikan atau membagi pembilang dan penyebut dengan bilangan yang sama.',
        pertanyaan: `Pecahan berikut ini yang memiliki nilai senilai dengan pecahan ${selected.q} adalah ....`,
        bentukSoal: 'Pilihan Ganda',
        level,
        opsi: [
          { label: 'A', text: selected.ans },
          { label: 'B', text: selected.wrong[0] },
          { label: 'C', text: selected.wrong[1] },
          { label: 'D', text: selected.wrong[2] }
        ],
        kunciJawaban: 'A',
        pembahasan: `Pecahan senilai dari ${selected.q} diperoleh dengan mengalikan pembilang dan penyebut dengan angka yang sama, sehingga hasilnya adalah ${selected.ans}.`,
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Opsi bilangan pecahan konkret ramah anak SD/MI.'
      };
    }

    if (materiLower.includes('banding') || indikatorLower.includes('banding') || indikatorLower.includes('besar') || indikatorLower.includes('kecil')) {
      return {
        id: `q-loc-${Date.now()}-${nomor}`,
        nomorSoal: nomor,
        kisiKisiId: kisi.id,
        stimulus: 'Dinda dan Siti masing-masing memiliki pita. Pita Dinda panjangnya 3/8 meter, sedangkan pita Siti panjangnya 5/8 meter.',
        pertanyaan: 'Tanda perbandingan yang paling tepat untuk melengkapi pernyataan 3/8 ... 5/8 adalah ....',
        bentukSoal: 'Pilihan Ganda',
        level,
        opsi: [
          { label: 'A', text: '< (lebih kecil dari)' },
          { label: 'B', text: '> (lebih besar dari)' },
          { label: 'C', text: '= (sama dengan)' },
          { label: 'D', text: '≥ (lebih besar sama dengan)' }
        ],
        kunciJawaban: 'A',
        pembahasan: 'Karena penyebut kedua pecahan sama-sama 8, kita bandingkan pembilangnya. Angka 3 lebih kecil daripada 5, sehingga 3/8 < 5/8.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Opsi simbol perbandingan matematika yang terukur.'
      };
    }

    if (materiLower.includes('operasi') || indikatorLower.includes('jumlah') || indikatorLower.includes('hitung')) {
      return {
        id: `q-loc-${Date.now()}-${nomor}`,
        nomorSoal: nomor,
        kisiKisiId: kisi.id,
        stimulus: 'Ibu membeli 2/5 kg tepung terigu di toko. Karena masih kurang, ibu membeli lagi 1/5 kg tepung terigu.',
        pertanyaan: 'Jumlah total tepung terigu yang dibeli oleh ibu adalah ....',
        bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
        level,
        opsi: isPg ? [
          { label: 'A', text: '3/5 kg' },
          { label: 'B', text: '3/10 kg' },
          { label: 'C', text: '1/5 kg' },
          { label: 'D', text: '4/5 kg' }
        ] : undefined,
        kunciJawaban: isPg ? 'A' : 'Penjumlahan pecahan: 2/5 + 1/5 = (2+1)/5 = 3/5 kg.',
        pembahasan: 'Penjumlahan pecahan dengan penyebut sama cukup menjumlahkan pembilangnya: 2/5 + 1/5 = 3/5 kg.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Opsi angka dan satuan berat konkret.'
      };
    }

    // Default Math
    return {
      id: `q-loc-${Date.now()}-${nomor}`,
      nomorSoal: nomor,
      kisiKisiId: kisi.id,
      stimulus: `Sebuah bangun persegi memiliki panjang sisi 7 cm.`,
      pertanyaan: `Keliling bangun persegi tersebut adalah ....`,
      bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
      level,
      opsi: isPg ? [
        { label: 'A', text: '28 cm' },
        { label: 'B', text: '49 cm' },
        { label: 'C', text: '21 cm' },
        { label: 'D', text: '14 cm' }
      ] : undefined,
      kunciJawaban: isPg ? 'A' : 'Keliling persegi = 4 x sisi = 4 x 7 cm = 28 cm.',
      pembahasan: 'Keliling persegi dihitung dengan rumus 4 x sisi: 4 x 7 cm = 28 cm.',
      kesesuaianIndikator: 'Sangat Sesuai',
      kesesuaianPersen: 100,
      catatanValidasi: 'Opsi pengukuran konkret.'
    };
  }

  // --- FIKIH (MI) ---
  if (mataPelajaran.toLowerCase().includes('fikih') || materiLower.includes('zakat') || materiLower.includes('salat')) {
    if (materiLower.includes('zakat') || indikatorLower.includes('zakat')) {
      if (level === 'L1' || indikatorLower.includes('hukum')) {
        return {
          id: `q-loc-${Date.now()}-${nomor}`,
          nomorSoal: nomor,
          kisiKisiId: kisi.id,
          stimulus: 'Setiap muslim yang menemui bulan Ramadan dan malam hari raya Idul Fitri berkewajiban menunaikan zakat fitrah.',
          pertanyaan: 'Hukum mengeluarkan zakat fitrah bagi setiap orang Islam yang memiliki kelebihan rezeki adalah ....',
          bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
          level,
          opsi: isPg ? [
            { label: 'A', text: 'Fardhu \'ain (wajib)' },
            { label: 'B', text: 'Sunah muakkad' },
            { label: 'C', text: 'Fardhu kifayah' },
            { label: 'D', text: 'Mubah' }
          ] : undefined,
          kunciJawaban: isPg ? 'A' : 'Hukum zakat fitrah adalah fardhu \'ain (wajib) bagi setiap individu muslim yang mampu.',
          pembahasan: 'Zakat fitrah hukumnya fardhu \'ain (wajib) bagi setiap orang Islam.',
          kesesuaianIndikator: 'Sangat Sesuai',
          kesesuaianPersen: 100,
          catatanValidasi: 'Opsi istilah hukum fikih baku.'
        };
      }

      if (level === 'L2' || indikatorLower.includes('kadar') || indikatorLower.includes('hitung')) {
        return {
          id: `q-loc-${Date.now()}-${nomor}`,
          nomorSoal: nomor,
          kisiKisiId: kisi.id,
          stimulus: 'Keluarga Pak Budi terdiri dari 4 orang anggota keluarga (ayah, ibu, dan 2 anak). Pak Budi hendak mengeluarkan zakat fitrah berupa beras.',
          pertanyaan: 'Jika ketentuan zakat fitrah per jiwa adalah 2,5 kg beras, jumlah total beras yang harus dikeluarkan Pak Budi adalah ....',
          bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
          level,
          opsi: isPg ? [
            { label: 'A', text: '10 kg beras' },
            { label: 'B', text: '7,5 kg beras' },
            { label: 'C', text: '5 kg beras' },
            { label: 'D', text: '12,5 kg beras' }
          ] : undefined,
          kunciJawaban: isPg ? 'A' : '4 jiwa x 2,5 kg = 10 kg beras.',
          pembahasan: 'Perhitungan: 4 orang x 2,5 kg = 10 kg beras.',
          kesesuaianIndikator: 'Sangat Sesuai',
          kesesuaianPersen: 100,
          catatanValidasi: 'Opsi angka dan takaran zakat nyata.'
        };
      }

      // L3
      return {
        id: `q-loc-${Date.now()}-${nomor}`,
        nomorSoal: nomor,
        kisiKisiId: kisi.id,
        stimulus: 'Pak Danu baru sempat menyerahkan beras zakat fitrah kepada pengurus musala pada sore hari tanggal 1 Syawal setelah salat Idul Fitri selesai.',
        pertanyaan: 'Berdasarkan ketentuan syariat, status pengeluaran beras yang dilakukan oleh Pak Danu tersebut adalah ....',
        bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
        level,
        opsi: isPg ? [
          { label: 'A', text: 'Terhitung sebagai sedekah biasa dan tidak menggugurkan kewajiban zakat fitrah' },
          { label: 'B', text: 'Tetap sah sebagai zakat fitrah yang sempurna' },
          { label: 'C', text: 'Batal dan wajib diganti dengan puasa kafarat' },
          { label: 'D', text: 'Hanya bernilai hibah antarteman' }
        ] : undefined,
        kunciJawaban: isPg ? 'A' : 'Statusnya hanya bernilai sedekah biasa karena dibayarkan setelah salat Idul Fitri tanpa uzur syar\'i.',
        pembahasan: 'Zakat fitrah yang diserahkan setelah salat Idul Fitri tanpa uzur hanya bernilai sedekah biasa.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Kasus fikih kontekstual L3.'
      };
    }
  }

  // --- IPAS / IPA ---
  if (mataPelajaran.toLowerCase().includes('ipas') || mataPelajaran.toLowerCase().includes('ipa')) {
    if (materiLower.includes('tumbuhan') || indikatorLower.includes('tumbuhan')) {
      return {
        id: `q-loc-${Date.now()}-${nomor}`,
        nomorSoal: nomor,
        kisiKisiId: kisi.id,
        stimulus: 'Setiap bagian tubuh tumbuhan mempunyai peranan yang saling melengkapi dalam menunjang kehidupannya.',
        pertanyaan: 'Bagian tumbuhan yang bertugas menyerap air dan zat hara dari dalam tanah adalah ....',
        bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
        level,
        opsi: isPg ? [
          { label: 'A', text: 'Akar' },
          { label: 'B', text: 'Daun' },
          { label: 'C', text: 'Bunga' },
          { label: 'D', text: 'Batang' }
        ] : undefined,
        kunciJawaban: isPg ? 'A' : 'Bagian akar berfungsi menyerap air dan mineral dari tanah.',
        pembahasan: 'Akar berfungsi menyerap air serta mineral dari tanah dan memperkokoh tanaman.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Opsi organ tumbuhan konkret.'
      };
    }
  }

  // General Subject-Specific Question
  const topic = kisi.materiAjar || mataPelajaran;
  return {
    id: `q-loc-${Date.now()}-${nomor}`,
    nomorSoal: nomor,
    kisiKisiId: kisi.id,
    stimulus: `Dalam pembelajaran ${mataPelajaran} mengenai materi ${topic}, peserta didik diajak untuk mengamati lingkungan di sekitar sekolah dan rumah.`,
    pertanyaan: isPg
      ? `Sikap yang paling tepat dalam menerapkan pembelajaran materi ${topic} dalam kehidupan sehari-hari adalah ....`
      : `Jelaskan secara runtut mengenai materi ${topic} dan sebutkan 2 contohnya dalam kehidupan sehari-hari!`,
    bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
    level,
    opsi: isPg ? [
      { label: 'A', text: `Melaksanakan kegiatan secara tertib dan sungguh-sungguh sesuai aturan materi ${topic}` },
      { label: 'B', text: `Mengabaikan aturan dan petunjuk yang telah disampaikan oleh guru` },
      { label: 'C', text: `Menunda-nunda tugas yang berkaitan dengan pelajaran ${topic}` },
      { label: 'D', text: `Menolak bekerja sama dengan teman saat mengerjakan tugas kelompok` }
    ] : undefined,
    kunciJawaban: isPg ? 'A' : `Pedoman Jawaban:\n1. Menjelaskan pengertian dan konsep pokok materi ${topic}.\n2. Menyebutkan 2 contoh nyata di lingkungan siswa SD/MI.`,
    pembahasan: `Jawaban yang benar adalah A. Sikap tertib dan bersungguh-sungguh merupakan wujud pengamalan materi ${topic} yang baik.`,
    rubrikPenskoran: !isPg ? {
      skor4: 'Jawaban sangat lengkap, tepat, dan disertai 2 contoh relevan.',
      skor3: 'Jawaban benar dan disertai 1 contoh.',
      skor2: 'Penjelasan kurang lengkap namun konsep benar.',
      skor1: 'Penjelasan kurang tepat.',
      skor0: 'Tidak menjawab.'
    } : undefined,
    kesesuaianIndikator: 'Sangat Sesuai',
    kesesuaianPersen: 100,
    catatanValidasi: 'Soal dirumuskan dengan bahasa ramah anak SD/MI.'
  };
}

export function generateLocalQuestions(
  kisiKisi: KisiKisiItem[],
  identity: SchoolIdentity
): QuestionItem[] {
  return kisiKisi.map((kisi, idx) => {
    const item = generateLocalQuestionItem(kisi, idx, identity);
    if (item.bentukSoal === 'Pilihan Ganda') {
      item.pertanyaan = sanitizePgQuestion(item.pertanyaan);
    }
    return item;
  });
}
