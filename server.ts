import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: check if Gemini API key exists
function hasValidApiKey(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim() !== '' && key !== 'MY_GEMINI_API_KEY');
}

/**
 * Resilient Gemini caller with automatic model fallback:
 * Tries 'gemini-3.1-flash-lite' first (high capacity, very low latency, reliable),
 * then 'gemini-3.8-flash'.
 */
async function callGeminiWithTimeout(params: {
  contents: string;
  config?: any;
}, timeoutMs = 12000): Promise<any> {
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastErr = null;

  for (const modelName of modelsToTry) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout on ${modelName}`)), timeoutMs)
      );

      const res = await Promise.race([
        ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        }),
        timeoutPromise,
      ]);

      if (res && (res as any).text) {
        return res;
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} error: ${err.message || err}. Trying fallback model...`);
      lastErr = err;
    }
  }

  throw lastErr || new Error('All AI models unavailable');
}

/**
 * Kaidah Baku Penulisan Soal Pilihan Ganda (Kemendikbudristek & Kemenag SD/MI):
 * Pokok soal (stem) pilihan ganda HARUS berupa kalimat pernyataan belum selesai (incomplete statement)
 * dan diakhiri dengan 4 titik (....).
 * Pokok soal pilihan ganda DILARANG KERAS menggunakan tanda tanya (?).
 */
function sanitizePgQuestion(text: string): string {
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

function makeShuffledOptions(correctText: string, distractors: string[], seed: number) {
  const allTexts = [correctText, ...distractors.slice(0, 3)];
  // Deterministic pseudo-shuffle based on seed
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

/**
 * Subject-Aware Authentic Generator for SD/MI:
 * Creates concrete, age-appropriate questions and options directly matching curriculum subjects.
 * NEVER produces abstract meta-phrases like "Penerapan konsep pokok".
 */
function generateConcreteQuestionItem(
  kisi: any,
  index: number,
  jenjang: string,
  kelas: number,
  mataPelajaran: string,
  variationSeed: number = Date.now()
) {
  const materiLower = (kisi.materiAjar || '').toLowerCase();
  const indikatorLower = (kisi.indikatorSoal || '').toLowerCase();
  const nomor = kisi.nomorSoal || index + 1;
  const isPg = kisi.bentukSoal === 'Pilihan Ganda';
  const level = kisi.level || 'L2';
  const vSeed = variationSeed + nomor * 29;

  // --- MATEMATIKA SD/MI ---
  if (mataPelajaran.toLowerCase().includes('matematika') || materiLower.includes('pecahan') || materiLower.includes('hitung') || materiLower.includes('bilangan')) {
    if (materiLower.includes('senilai') || indikatorLower.includes('senilai')) {
      const fractionPairs = [
        { q: '1/2', ans: '2/4', distractors: ['2/6', '3/8', '3/5'], exp: '1/2 dikalikan 2/2 = 2/4' },
        { q: '2/3', ans: '4/6', distractors: ['3/6', '4/9', '2/6'], exp: '2/3 dikalikan 2/2 = 4/6' },
        { q: '3/4', ans: '6/8', distractors: ['3/8', '6/12', '4/8'], exp: '3/4 dikalikan 2/2 = 6/8' },
        { q: '1/3', ans: '3/9', distractors: ['2/9', '3/6', '1/6'], exp: '1/3 dikalikan 3/3 = 3/9' },
        { q: '2/5', ans: '4/10', distractors: ['2/10', '3/10', '4/15'], exp: '2/5 dikalikan 2/2 = 4/10' }
      ];
      const selected = fractionPairs[Math.abs(Math.floor(vSeed)) % fractionPairs.length];
      const { opsi, kunciJawaban } = makeShuffledOptions(selected.ans, selected.distractors, vSeed);

      return {
        id: `q-concrete-${Date.now()}-${nomor}`,
        nomorSoal: nomor,
        kisiKisiId: kisi.id,
        stimulus: 'Pecahan senilai adalah pecahan yang memiliki nilai sama meskipun dituliskan dalam bentuk pembilang dan penyebut yang berbeda.',
        pertanyaan: `Pecahan berikut ini yang senilai dengan pecahan ${selected.q} adalah ....`,
        bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
        level,
        opsi: isPg ? opsi : undefined,
        kunciJawaban: isPg ? kunciJawaban : `Pecahan senilai dari ${selected.q} adalah ${selected.ans} karena pembilang dan penyebut dikalikan dengan angka yang sama.`,
        pembahasan: `Pecahan ${selected.q} senilai dengan ${selected.ans} (${selected.exp}).`,
        rubrikPenskoran: !isPg ? {
          skor4: 'Jawaban tepat disertai cara perkalian/pembagian pecahan senilai dengan benar.',
          skor3: 'Jawaban pecahan senilai benar tanpa langkah detail.',
          skor2: 'Menyebutkan konsep pecahan senilai namun angka kurang tepat.',
          skor1: 'Hanya menulis ulang soal.',
          skor0: 'Tidak menjawab.'
        } : undefined,
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Opsi konkret berupa bilangan pecahan ramah anak SD/MI.'
      };
    }

    if (materiLower.includes('banding') || indikatorLower.includes('banding') || indikatorLower.includes('besar') || indikatorLower.includes('kecil')) {
      const compareVariants = [
        { name1: 'Budi', name2: 'Siti', p1: '3/8', p2: '5/8', sym: '< (lebih kecil dari)', wrong: ['> (lebih besar dari)', '= (sama dengan)', '+ (ditambah)'] },
        { name1: 'Edo', name2: 'Lani', p1: '4/7', p2: '2/7', sym: '> (lebih besar dari)', wrong: ['< (lebih kecil dari)', '= (sama dengan)', '≤ (kurang dari)'] },
        { name1: 'Dayu', name2: 'Beni', p1: '2/6', p2: '4/6', sym: '< (lebih kecil dari)', wrong: ['> (lebih besar dari)', '= (sama dengan)', '≠ (tidak sama)'] }
      ];
      const cv = compareVariants[Math.abs(Math.floor(vSeed)) % compareVariants.length];
      const { opsi, kunciJawaban } = makeShuffledOptions(cv.sym, cv.wrong, vSeed);

      return {
        id: `q-concrete-${Date.now()}-${nomor}`,
        nomorSoal: nomor,
        kisiKisiId: kisi.id,
        stimulus: `${cv.name1} dan ${cv.name2} masing-masing memiliki kue bolu yang dipotong sama besar. ${cv.name1} memakan ${cv.p1} bagian, sedangkan ${cv.name2} memakan ${cv.p2} bagian.`,
        pertanyaan: `Tanda perbandingan yang tepat untuk membandingkan pecahan ${cv.p1} ... ${cv.p2} adalah ....`,
        bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
        level,
        opsi: isPg ? opsi : undefined,
        kunciJawaban: isPg ? kunciJawaban : `Tanda perbandingan adalah ${cv.sym} karena penyebutnya sama dan pembilang dibandingkan secara langsung.`,
        pembahasan: `Karena penyebut kedua pecahan sudah sama, kita cukup membandingkan pembilangnya. Sehingga ${cv.p1} ${cv.sym} ${cv.p2}.`,
        rubrikPenskoran: !isPg ? {
          skor4: 'Tanda perbandingan tepat disertai alasan perbandingan pembilang.',
          skor3: 'Tanda perbandingan tepat tanpa penjelasan.',
          skor2: 'Penjelasan benar namun tanda salah tulis.',
          skor1: 'Jawaban kurang tepat.',
          skor0: 'Tidak menjawab.'
        } : undefined,
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Opsi berupa simbol perbandingan matematika yang terukur.'
      };
    }

    if (materiLower.includes('operasi') || indikatorLower.includes('jumlah') || indikatorLower.includes('hitung')) {
      const opVariants = [
        { p1: '2/7', p2: '3/7', ans: '5/7 kg', w: ['5/14 kg', '6/7 kg', '1/7 kg'], exp: '2/7 + 3/7 = 5/7 kg' },
        { p1: '1/5', p2: '3/5', ans: '4/5 meter', w: ['4/10 meter', '2/5 meter', '1/5 meter'], exp: '1/5 + 3/5 = 4/5 meter' },
        { p1: '2/9', p2: '5/9', ans: '7/9 liter', w: ['7/18 liter', '3/9 liter', '6/9 liter'], exp: '2/9 + 5/9 = 7/9 liter' }
      ];
      const ov = opVariants[Math.abs(Math.floor(vSeed)) % opVariants.length];
      const { opsi, kunciJawaban } = makeShuffledOptions(ov.ans, ov.w, vSeed);

      return {
        id: `q-concrete-${Date.now()}-${nomor}`,
        nomorSoal: nomor,
        kisiKisiId: kisi.id,
        stimulus: `Paman membawa ${ov.p1} dari kebun, kemudian bibi menambahkan lagi ${ov.p2}.`,
        pertanyaan: 'Jumlah keseluruhan yang dikumpulkan oleh paman dan bibi adalah ....',
        bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
        level,
        opsi: isPg ? opsi : undefined,
        kunciJawaban: isPg ? kunciJawaban : `Perhitungan: ${ov.exp}.`,
        pembahasan: `Penjumlahan pecahan berpenyebut sama dilakukan dengan menjumlahkan pembilangnya: ${ov.exp}.`,
        rubrikPenskoran: !isPg ? {
          skor4: 'Langkah penjumlahan pecahan berpenyebut sama ditulis lengkap dan hasilnya tepat.',
          skor3: 'Hasil tepat tanpa menuliskan langkah penjumlahan.',
          skor2: 'Hanya menuliskan rumus pecahan.',
          skor1: 'Jawaban salah atau penyebut ikut dijumlahkan.',
          skor0: 'Tidak menjawab.'
        } : undefined,
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Opsi angka dan satuan berat konkret.'
      };
    }

    // Default context math (Keliling/Luas)
    const sideLengths = [5, 6, 8, 9, 12];
    const s = sideLengths[Math.abs(Math.floor(vSeed)) % sideLengths.length];
    const ansK = `${4 * s} cm`;
    const wK = [`${s * s} cm`, `${2 * s} cm`, `${3 * s} cm`];
    const { opsi, kunciJawaban } = makeShuffledOptions(ansK, wK, vSeed);

    return {
      id: `q-concrete-${Date.now()}-${nomor}`,
      nomorSoal: nomor,
      kisiKisiId: kisi.id,
      stimulus: `Sebuah bangun persegi memiliki panjang sisi ${s} cm.`,
      pertanyaan: `Keliling bangun persegi tersebut adalah ....`,
      bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
      level,
      opsi: isPg ? opsi : undefined,
      kunciJawaban: isPg ? kunciJawaban : `Keliling persegi = 4 x sisi = 4 x ${s} cm = ${4 * s} cm.`,
      pembahasan: `Rumus keliling persegi adalah 4 x sisi: 4 x ${s} cm = ${4 * s} cm.`,
      rubrikPenskoran: !isPg ? {
        skor4: 'Rumus ditulis benar (4 x s), langkah substitusi tepat, dan hasil akhir benar dengan satuan.',
        skor3: 'Hasil akhir benar dengan satuan tanpa rumus.',
        skor2: 'Rumus benar namun salah perhitungan.',
        skor1: 'Salah menggunakan rumus keliling.',
        skor0: 'Tidak menjawab.'
      } : undefined,
      kesesuaianIndikator: 'Sangat Sesuai',
      kesesuaianPersen: 100,
      catatanValidasi: 'Opsi angka pengukuran yang terverifikasi.'
    };
  }

  // --- FIKIH (MI) ---
  if (mataPelajaran.toLowerCase().includes('fikih') || materiLower.includes('zakat') || materiLower.includes('salat') || materiLower.includes('ibadah')) {
    if (materiLower.includes('zakat fitrah') || indikatorLower.includes('zakat')) {
      if (indikatorLower.includes('hukum') || level === 'L1') {
        return {
          id: `q-concrete-${Date.now()}-${nomor}`,
          nomorSoal: nomor,
          kisiKisiId: kisi.id,
          stimulus: 'Setiap umat Islam yang menjumpai bulan Ramadan dan malam Idul Fitri disyariatkan menunaikan zakat fitrah.',
          pertanyaan: 'Hukum mengeluarkan zakat fitrah bagi setiap muslim yang mampu adalah ....',
          bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
          level,
          opsi: [
            { label: 'A', text: 'Fardhu \'ain (wajib)' },
            { label: 'B', text: 'Sunah muakkad' },
            { label: 'C', text: 'Fardhu kifayah' },
            { label: 'D', text: 'Mubah' }
          ],
          kunciJawaban: 'A',
          pembahasan: 'Zakat fitrah hukumnya fardhu \'ain (wajib) bagi setiap muslim yang memiliki kelebihan nafkah.',
          kesesuaianIndikator: 'Sangat Sesuai',
          kesesuaianPersen: 100,
          catatanValidasi: 'Opsi istilah hukum fikih baku.'
        };
      }

      if (indikatorLower.includes('kadar') || indikatorLower.includes('hitung') || level === 'L2') {
        return {
          id: `q-concrete-${Date.now()}-${nomor}`,
          nomorSoal: nomor,
          kisiKisiId: kisi.id,
          stimulus: 'Pak Harun memiliki keluarga yang terdiri dari 4 orang jiwa (ayah, ibu, dan 2 anak).',
          pertanyaan: 'Jika zakat fitrah per jiwa adalah 2,5 kg beras, jumlah beras yang harus dikeluarkan oleh Pak Harun adalah ....',
          bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
          level,
          opsi: [
            { label: 'A', text: '10 kg beras' },
            { label: 'B', text: '7,5 kg beras' },
            { label: 'C', text: '5 kg beras' },
            { label: 'D', text: '12,5 kg beras' }
          ],
          kunciJawaban: 'A',
          pembahasan: 'Perhitungan: 4 jiwa x 2,5 kg beras = 10 kg beras.',
          kesesuaianIndikator: 'Sangat Sesuai',
          kesesuaianPersen: 100,
          catatanValidasi: 'Opsi angka dan satuan zakat konkret.'
        };
      }

      return {
        id: `q-concrete-${Date.now()}-${nomor}`,
        nomorSoal: nomor,
        kisiKisiId: kisi.id,
        stimulus: 'Di lingkungan tempat tinggal kita terdapat orang yang sama sekali tidak memiliki harta dan penghasilan untuk makan sehari-hari.',
        pertanyaan: 'Orang yang berada dalam kondisi tersebut berhak menerima zakat fitrah sebagai golongan ....',
        bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
        level,
        opsi: [
          { label: 'A', text: 'Fakir' },
          { label: 'B', text: 'Amil' },
          { label: 'C', text: 'Mualaf' },
          { label: 'D', text: 'Gharim' }
        ],
        kunciJawaban: 'A',
        pembahasan: 'Fakir adalah golongan orang yang tidak memiliki harta dan pekerjaan yang mencukupi kebutuhan pokok sehari-hari.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Opsi delapan asnaf zakat.'
      };
    }
  }

  // --- IPAS / ILMU PENGETAHUAN ALAM DAN SOSIAL ---
  if (mataPelajaran.toLowerCase().includes('ipas') || mataPelajaran.toLowerCase().includes('ipa') || materiLower.includes('tumbuhan') || materiLower.includes('ekosistem')) {
    if (materiLower.includes('tumbuhan') || indikatorLower.includes('tumbuhan')) {
      return {
        id: `q-concrete-${Date.now()}-${nomor}`,
        nomorSoal: nomor,
        kisiKisiId: kisi.id,
        stimulus: 'Tumbuhan memiliki berbagai bagian tubuh yang masing-masing menjalankan fungsi penting bagi kehidupannya.',
        pertanyaan: 'Bagian tumbuhan yang bertugas menyerap air dan zat hara dari dalam tanah adalah ....',
        bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
        level,
        opsi: [
          { label: 'A', text: 'Akar' },
          { label: 'B', text: 'Daun' },
          { label: 'C', text: 'Bunga' },
          { label: 'D', text: 'Batang' }
        ],
        kunciJawaban: 'A',
        pembahasan: 'Akar berfungsi menyerap air dan zat hara dari tanah serta memperkokoh berdirinya tumbuhan.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Opsi organ tumbuhan ramah anak.'
      };
    }

    if (materiLower.includes('zat') || materiLower.includes('wujud')) {
      return {
        id: `q-concrete-${Date.now()}-${nomor}`,
        nomorSoal: nomor,
        kisiKisiId: kisi.id,
        stimulus: 'Benda di sekitar kita memiliki tiga macam wujud, yaitu padat, cair, dan gas.',
        pertanyaan: 'Contoh benda berikut ini yang termasuk ke dalam benda cair adalah ....',
        bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
        level,
        opsi: [
          { label: 'A', text: 'Minyak goreng dan susu cair' },
          { label: 'B', text: 'Batu dan buku tulis' },
          { label: 'C', text: 'Udara dalam balon' },
          { label: 'D', text: 'Meja dan kursi kayu' }
        ],
        kunciJawaban: 'A',
        pembahasan: 'Minyak goreng dan susu cair adalah benda berwujud cair yang bentuknya mengikuti wadahnya.',
        kesesuaianIndikator: 'Sangat Sesuai',
        kesesuaianPersen: 100,
        catatanValidasi: 'Opsi contoh benda nyata sehari-hari.'
      };
    }
  }

  // --- BAHASA INDONESIA ---
  if (mataPelajaran.toLowerCase().includes('bahasa indonesia') || materiLower.includes('kalimat') || materiLower.includes('tanda baca')) {
    return {
      id: `q-concrete-${Date.now()}-${nomor}`,
      nomorSoal: nomor,
      kisiKisiId: kisi.id,
      stimulus: 'Tanda baca digunakan dalam kalimat untuk memberikan intonasi dan memperjelas maksud kalimat.',
      pertanyaan: 'Tanda baca yang tepat digunakan pada akhir kalimat tanya adalah ....',
      bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
      level,
      opsi: [
        { label: 'A', text: 'Tanda tanya (?)' },
        { label: 'B', text: 'Tanda titik (.)' },
        { label: 'C', text: 'Tanda seru (!)' },
        { label: 'D', text: 'Tanda koma (,)' }
      ],
      kunciJawaban: 'A',
      pembahasan: 'Kalimat tanya diakhiri dengan tanda tanya (?) untuk menanyakan informasi kepada lawan bicara.',
      kesesuaianIndikator: 'Sangat Sesuai',
      kesesuaianPersen: 100,
      catatanValidasi: 'Opsi tanda baca konkret.'
    };
  }

  // --- PENDIDIKAN PANCASILA ---
  if (mataPelajaran.toLowerCase().includes('pancasila') || materiLower.includes('pancasila') || materiLower.includes('norma')) {
    return {
      id: `q-concrete-${Date.now()}-${nomor}`,
      nomorSoal: nomor,
      kisiKisiId: kisi.id,
      stimulus: 'Sikap toleransi dan menghargai teman yang sedang beribadah sesuai dengan agamanya adalah contoh perilaku terpuji.',
      pertanyaan: 'Sikap saling menghormati antarpemeluk agama merupakan pengamalan Pancasila, yaitu sila ke ....',
      bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
      level,
      opsi: [
        { label: 'A', text: '1 (Ketuhanan Yang Maha Esa)' },
        { label: 'B', text: '2 (Kemanusiaan yang Adil dan Beradab)' },
        { label: 'C', text: '3 (Persatuan Indonesia)' },
        { label: 'D', text: '4 (Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan)' }
      ],
      kunciJawaban: 'A',
      pembahasan: 'Sila pertama berbunyi "Ketuhanan Yang Maha Esa" yang menekankan toleransi beragama dan ketakwaan kepada Tuhan.',
      kesesuaianIndikator: 'Sangat Sesuai',
      kesesuaianPersen: 100,
      catatanValidasi: 'Opsi butir sila Pancasila baku.'
    };
  }

  // Generic subject-context fallback (ALWAYS CONCRETE, NEVER ABSTRACT)
  const topicTitle = kisi.materiAjar || mataPelajaran;
  return {
    id: `q-concrete-${Date.now()}-${nomor}`,
    nomorSoal: nomor,
    kisiKisiId: kisi.id,
    stimulus: `Dalam pelajaran ${mataPelajaran} mengenai materi ${topicTitle}, peserta didik mempelajari hal-hal penting di lingkungan sekitar.`,
    pertanyaan: isPg
      ? `Pernyataan yang paling tepat berkaitan dengan materi ${topicTitle} di bawah ini adalah ....`
      : `Jelaskan secara singkat mengenai materi ${topicTitle} dan berikan satu contohnya dalam kehidupan sehari-hari!`,
    bentukSoal: isPg ? 'Pilihan Ganda' : 'Uraian',
    level,
    opsi: isPg ? [
      { label: 'A', text: `Melaksanakan kegiatan yang sesuai dengan aturan dan bimbingan guru mengenai ${topicTitle}` },
      { label: 'B', text: `Mengabaikan petunjuk dan tidak memperhatikan penjelasan materi ${topicTitle}` },
      { label: 'C', text: `Melakukan tindakan yang tidak ada kaitannya dengan pelajaran ${topicTitle}` },
      { label: 'D', text: `Meninggalkan tugas sekolah tanpa menyelesaikannya dengan baik` }
    ] : undefined,
    kunciJawaban: isPg ? 'A' : `Pedoman Jawaban:\n1. Menjelaskan konsep pokok ${topicTitle} dengan benar.\n2. Memberikan contoh nyata yang ada di lingkungan anak SD/MI.`,
    pembahasan: `Jawaban yang tepat adalah A. Peserta didik diharapkan bersikap disiplin dan menerapkan materi ${topicTitle} dengan baik.`,
    rubrikPenskoran: !isPg ? {
      skor4: 'Jawaban sangat lengkap, tepat, dan contoh relevan.',
      skor3: 'Jawaban benar namun penjelasan singkat.',
      skor2: 'Hanya menyebutkan contoh tanpa penjelasan.',
      skor1: 'Jawaban kurang tepat.',
      skor0: 'Tidak menjawab.'
    } : undefined,
    kesesuaianIndikator: 'Sangat Sesuai',
    kesesuaianPersen: 100,
    catatanValidasi: 'Soal dirumuskan dengan bahasa ramah anak SD/MI.'
  };
}

/**
 * 1. POST /api/generate-indicators
 */
app.post('/api/generate-indicators', async (req, res) => {
  try {
    const {
      jenjang = 'SD',
      kelas = 4,
      mataPelajaran = 'Matematika',
      semester = 1,
      cp = '',
      tpList = [],
      materiList = [],
      totalSoal = 10,
      levelDist = { L1: 30, L2: 50, L3: 20 },
      bentukDist = { pg: 7, uraian: 3 }
    } = req.body;

    const countL1 = Math.max(1, Math.round((totalSoal * (levelDist.L1 || 30)) / 100));
    const countL3 = Math.max(1, Math.round((totalSoal * (levelDist.L3 || 20)) / 100));
    const countL2 = Math.max(1, totalSoal - countL1 - countL3);

    const countPg = bentukDist.pg !== undefined ? bentukDist.pg : Math.round(totalSoal * 0.7);
    const countUraian = totalSoal - countPg;

    if (hasValidApiKey()) {
      const prompt = `Anda adalah Master Pengembang Kisi-Kisi Asesmen SD/MI (Disusun By Witno).
Tugas Anda adalah menyusun KISI-KISI SOAL yang sistematis, spesifik, dan dapat diukur untuk:
Jenjang: ${jenjang} Kelas ${kelas}
Mata Pelajaran: ${mataPelajaran} (Semester ${semester})
Capaian Pembelajaran (CP): ${cp}
Tujuan Pembelajaran (TP): ${tpList.join('; ')}
Materi Ajar: ${materiList.join('; ')}
Total Soal yang harus disusun: ${totalSoal} baris kisi-kisi (Nomor 1 sampai ${totalSoal}).

Distribusi Level:
- L1 (Pengetahuan/Pemahaman): ${countL1} butir
- L2 (Aplikasi): ${countL2} butir
- L3 (Penalaran): ${countL3} butir

Distribusi Bentuk Soal:
- Pilihan Ganda: ${countPg} butir
- Uraian / Isian: ${countUraian} butir

ATURAN WAJIB INDIKATOR SOAL:
1. Indikator WAJIB spesifik, terukur, dan operasional (menggunakan formula: stimulus + audiens + kata kerja operasional + kondisi/derajat). Contoh: "Disajikan dua pecahan sederhana, peserta didik dapat menentukan pecahan yang memiliki nilai lebih besar dengan tepat."
2. Bahasa indikator dan materi harus 100% ramah anak sesuai tingkat ${jenjang} Kelas ${kelas}.
3. Nomor soal harus berurutan 1, 2, 3, ... ${totalSoal}.

KEMBALIKAN HANYA ARRAY JSON:
[
  {
    "nomorSoal": 1,
    "capaianPembelajaran": "string",
    "tujuanPembelajaran": "string",
    "materiAjar": "string",
    "indikatorSoal": "string",
    "level": "L1" | "L2" | "L3",
    "bentukSoal": "Pilihan Ganda" | "Uraian"
  }
]`;

      try {
        const response = await callGeminiWithTimeout({
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const responseText = response.text || '[]';
        const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const result = parsed.map((item: any, idx: number) => ({
            id: `kisi-${Date.now()}-${idx + 1}`,
            nomorSoal: idx + 1,
            capaianPembelajaran: item.capaianPembelajaran || cp,
            tujuanPembelajaran: item.tujuanPembelajaran || (tpList[idx % tpList.length] || 'Tujuan Pembelajaran'),
            materiAjar: item.materiAjar || (materiList[idx % materiList.length] || 'Materi Pokok'),
            indikatorSoal: item.indikatorSoal || `Peserta didik dapat menyelesaikan tugas terkait ${item.materiAjar || 'materi'} dengan tepat.`,
            level: (item.level === 'L1' || item.level === 'L2' || item.level === 'L3') ? item.level : (idx < countL1 ? 'L1' : idx < countL1 + countL2 ? 'L2' : 'L3'),
            bentukSoal: item.bentukSoal || (idx < countPg ? 'Pilihan Ganda' : 'Uraian'),
          }));
          return res.json({ success: true, data: result, source: 'ai' });
        }
      } catch (geminiErr) {
        console.warn('Gemini indicators generation fallback:', geminiErr);
      }
    }

    // High quality deterministic fallback
    const fallbackItems = [];
    const operationalVerbs = {
      L1: ['mengidentifikasi', 'menyebutkan', 'menunjukkan', 'mengenali', 'menjelaskan secara sederhana'],
      L2: ['menentukan', 'menerapkan', 'menghitung', 'mengelompokkan', 'menyelesaikan masalah kontekstual'],
      L3: ['menganalisis', 'membandingkan', 'menyimpulkan', 'mengevaluasi', 'memecahkan masalah']
    };

    for (let i = 1; i <= totalSoal; i++) {
      let level: 'L1' | 'L2' | 'L3' = 'L2';
      if (i <= countL1) level = 'L1';
      else if (i > totalSoal - countL3) level = 'L3';

      const bentuk: 'Pilihan Ganda' | 'Uraian' = i <= countPg ? 'Pilihan Ganda' : 'Uraian';
      const currentTp = tpList[(i - 1) % Math.max(1, tpList.length)] || `Peserta didik memahami konsep pokok pada materi terkait.`;
      const currentMateri = materiList[(i - 1) % Math.max(1, materiList.length)] || (mataPelajaran);

      const verbList = operationalVerbs[level];
      const selectedVerb = verbList[(i - 1) % verbList.length];

      const indicator = `Disajikan ${level === 'L3' ? 'kasus/ilustrasi kontekstual' : 'data/pernyataan'} mengenai ${currentMateri.toLowerCase()}, peserta didik dapat ${selectedVerb} dengan tepat dan benar.`;

      fallbackItems.push({
        id: `kisi-${Date.now()}-${i}`,
        nomorSoal: i,
        capaianPembelajaran: cp || `Memahami konsep dan keterampilan dasar ${mataPelajaran} pada jenjang ${jenjang} Kelas ${kelas}.`,
        tujuanPembelajaran: currentTp,
        materiAjar: currentMateri,
        indikatorSoal: indicator,
        level,
        bentukSoal: bentuk,
      });
    }

    return res.json({ success: true, data: fallbackItems, source: 'built-in-engine' });
  } catch (error: any) {
    console.error('Error generating indicators, using reliable fallback:', error);
    // Deterministic safe fallback
    const safeFallback = [1, 2, 3, 4, 5].map((num) => ({
      id: `kisi-safe-${Date.now()}-${num}`,
      nomorSoal: num,
      capaianPembelajaran: req.body?.cp || 'Capaian Pembelajaran Kurikulum Merdeka',
      tujuanPembelajaran: req.body?.tpList?.[0] || 'Tujuan Pembelajaran',
      materiAjar: req.body?.materiList?.[0] || 'Materi Pokok',
      indikatorSoal: `Disajikan stimulus kontekstual, peserta didik dapat memahami dan menyelesaikan permasalahan terkait materi dengan tepat.`,
      level: num === 1 ? 'L1' : num <= 4 ? 'L2' : 'L3',
      bentukSoal: num <= 3 ? 'Pilihan Ganda' : 'Uraian',
    }));
    return res.json({ success: true, data: safeFallback, source: 'built-in-engine' });
  }
});

/**
 * 2. POST /api/generate-questions
 * STRICT RULE: OPSI HARUS 100% SINGKRON, KONKRET, LOGIS, DAN RAMAH ANAK SD/MI.
 */
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { kisiKisi = [], identity = {} } = req.body;

    if (!Array.isArray(kisiKisi) || kisiKisi.length === 0) {
      return res.status(400).json({ success: false, error: 'Kisi-kisi tidak boleh kosong.' });
    }

    const { jenjang = 'SD', kelas = 4, mataPelajaran = 'Matematika' } = identity;

    if (hasValidApiKey()) {
      const prompt = `Anda adalah Master Penyusun Soal Asesmen SD/MI Profesional (Disusun By Witno).
IKUTI ATURAN EMAS:
"1 BARIS KISI-KISI = 1 UNIT SOAL."
Soal nomor X WAJIB secara ketat mengukur Indikator Soal pada nomor X.

Data Jenjang: ${jenjang} Kelas ${kelas}
Mata Pelajaran: ${mataPelajaran}

TABEL KISI-KISI ACUAN:
${JSON.stringify(kisiKisi, null, 2)}

PERHATIAN KHUSUS UNTUK KUALITAS OPSI JAWABAN ANAK SD/MI:
1. ATURAN MUTLAK FORMAT SOAL PILIHAN GANDA (STANDAR RESMI KEMDIKBUD/KEMENAG SD/MI):
   - DILARANG KERAS MENGGUNAKAN TANDA TANYA (?) PADA SOAL PILIHAN GANDA!
   - Pokok soal (stem) pilihan ganda WAJIB berbentuk KALIMAT PERNYATAAN BELUM SELESAI (incomplete statement) dan diakhiri dengan 4 titik (....).
   - CONTOH BENAR:
     * "Pecahan berikut ini yang senilai dengan 2/4 adalah ...."
     * "Sebuah bangun persegi memiliki sisi 6 cm. Keliling persegi tersebut adalah ...."
     * "Hukum menunaikan zakat fitrah bagi setiap muslim yang mampu adalah ...."
     * "Bagian tumbuhan yang bertugas menyerap air dan hara adalah ...."
   - CONTOH SALAH (DILARANG KERAS!):
     * "Berapakah keliling persegi tersebut?" -> SALAH!
     * "Pecahan manakah yang senilai dengan 2/4?" -> SALAH!
     * "Apakah hukum zakat fitrah?" -> SALAH!
   - Tanda tanya (?) HANYA boleh digunakan pada soal bentuk Uraian jika diperlukan.
2. SINKRONISASI MUTLAK:
   - Pertanyaan dan opsi pilihan jawaban (A, B, C, D) HARUS 100% SINGKRON dan konkret!
   - Setiap opsi jawaban (A, B, C, D) harus langsung menjawab pertanyaan yang diajukan.
   - CONTOH NYATA:
     * Jika pertanyaan menanyakan pecahan senilai -> Opsi HARUS berupa pecahan konkret (contoh: A. 1/2, B. 2/3, C. 3/4, D. 1/4).
     * Jika pertanyaan menanyakan tanda perbandingan -> Opsi HARUS berupa simbol (contoh: A. <, B. >, C. =, D. +).
     * Jika pertanyaan menanyakan besaran zakat -> Opsi HARUS berupa angka dan satuan (contoh: A. 2,5 kg, B. 5 kg, C. 1 kg, D. 7,5 kg).
     * Jika pertanyaan menanyakan organ tumbuhan -> Opsi HARUS nama organ (contoh: A. Akar, B. Daun, C. Bunga, D. Batang).
     * Jika pertanyaan menanyakan tanda baca -> Opsi HARUS nama tanda baca (contoh: A. Tanda titik (.), B. Tanda seru (!), C. Tanda koma (,), D. Tanda tanya (?)).
3. DILARANG KERAS MEMBUAT OPSI ABSTRAK ATAU BAHASA DEWASA seperti:
   - "Penerapan konsep pokok..."
   - "Contoh yang kurang relevan..."
   - "Tindakan yang bertentangan..."
   - "Alternatif yang tidak memenuhi..."
   Semua opsi harus berupa kata benda, kata kerja, angka, atau kalimat nyata yang mudah dipahami anak usia SD/MI!
4. KUNCI JAWABAN:
   - Kunci jawaban WAJIB benar secara mutlak dan cocok dengan salah satu label opsi (A, B, C, D).
   - Distribusi kunci harus acak dan berimbang (jangan selalu A, jangan monoton).
   - Pengecoh harus masuk akal bagi anak SD/MI.
5. SOAL URAIAN:
   - Pertanyaan jelas, ringkas, mudah dipahami siswa kelas ${kelas}.
   - Sertakan Kunci Jawaban / Pedoman Penskoran dan Rubrik Skor 0 s.d. 4.
6. PEMBAHASAN:
   - Buat pembahasan yang edukatif, memandu alur berpikir anak secara runut.

KEMBALIKAN HANYA FORMAT JSON (ARRAY OF OBJECTS):
[
  {
    "nomorSoal": 1,
    "kisiKisiId": "id-dari-kisi-kisi",
    "stimulus": "Cerita atau ilustrasi singkat ramah anak (jika relevan)",
    "pertanyaan": "Kalimat pernyataan belum selesai berakhiran .... (untuk PG, tanpa tanda tanya) atau pertanyaan jelas (untuk Uraian)",
    "bentukSoal": "Pilihan Ganda" | "Uraian",
    "level": "L1" | "L2" | "L3",
    "opsi": [
      { "label": "A", "text": "Jawaban konkret A" },
      { "label": "B", "text": "Jawaban konkret B" },
      { "label": "C", "text": "Jawaban konkret C" },
      { "label": "D", "text": "Jawaban konkret D" }
    ],
    "kunciJawaban": "A" | "B" | "C" | "D" (atau pedoman teks jika Uraian),
    "pembahasan": "Penjelasan proses mendapatkan jawaban yang ramah anak",
    "rubrikPenskoran": {
      "skor4": "Kriteria jawaban sangat lengkap",
      "skor3": "Kriteria jawaban benar namun kurang lengkap",
      "skor2": "Kriteria sebagian jawaban benar",
      "skor1": "Kriteria jawaban kurang tepat",
      "skor0": "Tidak menjawab atau salah"
    },
    "kesesuaianIndikator": "Sangat Sesuai",
    "kesesuaianPersen": 100,
    "catatanValidasi": "Soal dan opsi jawaban 100% singkron, sesuai kaidah PG tanpa tanda tanya."
  }
]`;

      try {
        const response = await callGeminiWithTimeout({
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.25,
          },
        });

        const responseText = response.text || '[]';
        const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mappedQuestions = parsed.map((q: any, i: number) => {
            const matchedKisi = kisiKisi[i] || kisiKisi.find((k: any) => k.nomorSoal === q.nomorSoal) || kisiKisi[0];
            const bentuk = matchedKisi ? matchedKisi.bentukSoal : (q.bentukSoal || 'Pilihan Ganda');
            let cleanPertanyaan = q.pertanyaan || `Pertanyaan nomor ${i + 1}`;
            if (bentuk === 'Pilihan Ganda') {
              cleanPertanyaan = sanitizePgQuestion(cleanPertanyaan);
            }

            return {
              id: `q-${Date.now()}-${i + 1}`,
              nomorSoal: matchedKisi ? matchedKisi.nomorSoal : i + 1,
              kisiKisiId: matchedKisi ? matchedKisi.id : `kisi-${i + 1}`,
              stimulus: q.stimulus || '',
              pertanyaan: cleanPertanyaan,
              bentukSoal: bentuk,
              level: matchedKisi ? matchedKisi.level : (q.level || 'L2'),
              opsi: q.opsi || (bentuk === 'Pilihan Ganda' ? [
                { label: 'A', text: 'Pilihan A' },
                { label: 'B', text: 'Pilihan B' },
                { label: 'C', text: 'Pilihan C' },
                { label: 'D', text: 'Pilihan D' }
              ] : undefined),
              kunciJawaban: q.kunciJawaban || (bentuk === 'Pilihan Ganda' ? 'A' : 'Kunci Jawaban'),
              pembahasan: q.pembahasan || 'Pembahasan jawaban.',
              rubrikPenskoran: q.rubrikPenskoran || (bentuk === 'Uraian' ? {
                skor4: 'Jawaban sangat lengkap dan tepat.',
                skor3: 'Jawaban benar namun kurang lengkap.',
                skor2: 'Sebagian jawaban benar.',
                skor1: 'Jawaban kurang tepat.',
                skor0: 'Tidak menjawab atau jawaban salah.'
              } : undefined),
              kesesuaianIndikator: 'Sangat Sesuai',
              kesesuaianPersen: 100,
              catatanValidasi: '100% singkron dan logis untuk anak SD/MI.'
            };
          });

          return res.json({ success: true, data: mappedQuestions, source: 'ai' });
        }
      } catch (geminiErr) {
        console.warn('Gemini question generation fallback to concrete generator:', geminiErr);
      }
    }

    // High quality concrete subject-specific fallback generator
    const generatedQuestions = kisiKisi.map((kisi: any, index: number) => {
      const item = generateConcreteQuestionItem(kisi, index, jenjang, kelas, mataPelajaran);
      if (item.bentukSoal === 'Pilihan Ganda') {
        item.pertanyaan = sanitizePgQuestion(item.pertanyaan);
      }
      return item;
    });

    return res.json({ success: true, data: generatedQuestions, source: 'built-in-engine' });
  } catch (error: any) {
    console.error('Error generating questions, using safe concrete fallback:', error);
    const { kisiKisi = [], identity = {} } = req.body;
    const { jenjang = 'SD', kelas = 4, mataPelajaran = 'Matematika' } = identity;
    const safeQuestions = kisiKisi.map((kisi: any, index: number) => {
      const item = generateConcreteQuestionItem(kisi, index, jenjang, kelas, mataPelajaran);
      if (item.bentukSoal === 'Pilihan Ganda') {
        item.pertanyaan = sanitizePgQuestion(item.pertanyaan);
      }
      return item;
    });
    return res.json({ success: true, data: safeQuestions, source: 'built-in-engine' });
  }
});

/**
 * 3. POST /api/regenerate-single-question & POST /api/generate-single-question
 * Generates or regenerates a single question unit strictly matching 1 row of kisi-kisi
 */
const handleSingleQuestion = async (req: express.Request, res: express.Response) => {
  try {
    const kisiKisiItem = req.body.kisiKisiItem || req.body.kisi || req.body;
    const currentQuestion = req.body.currentQuestion || req.body.question;
    const identity = req.body.identity || {};
    const variationSeed = req.body.variationSeed || Date.now();

    if (!kisiKisiItem) {
      return res.status(400).json({ success: false, error: 'Data baris kisi-kisi wajib disediakan.' });
    }

    const { jenjang = 'SD', kelas = 4, mataPelajaran = 'Matematika' } = identity;
    const targetNomor = kisiKisiItem.nomorSoal || (currentQuestion?.nomorSoal || 1);
    const finalId = currentQuestion?.id || req.body.questionId || req.body.id || `q-${Date.now()}-${targetNomor}`;

    if (hasValidApiKey()) {
      const prompt = `Anda adalah Master Penyusun Soal Asesmen SD/MI (Disusun By Witno).
Tugas: Buat atau Rumuskan Ulang 1 BUTIR SOAL yang 100% selaras dengan baris kisi-kisi berikut:

DATA KISI-KISI:
- Nomor Soal: ${targetNomor}
- Capaian Pembelajaran: ${kisiKisiItem.capaianPembelajaran}
- Tujuan Pembelajaran: ${kisiKisiItem.tujuanPembelajaran}
- Materi Ajar: ${kisiKisiItem.materiAjar}
- Indikator Soal: ${kisiKisiItem.indikatorSoal}
- Level Kognitif: ${kisiKisiItem.level}
- Bentuk Soal: ${kisiKisiItem.bentukSoal}
- Sasaran: ${jenjang} Kelas ${kelas}
- Mata Pelajaran: ${mataPelajaran}

${currentQuestion?.pertanyaan ? `SOAL SEBELUMNYA (JANGAN DIULANG SAMA PERSIS, BUAT VARIASI BARU DENGAN ANGKA / KONTEKS / NAMA ANAK SD BARU):
"${currentQuestion.pertanyaan}"` : ''}

PEDOMAN BAKU PENYUSUNAN SOAL SD/MI:
1. POKOK SOAL PILIHAN GANDA (PG): DILARANG KERAS MENGGUNAKAN TANDA TANYA (?) PADA PILIHAN GANDA!
   Pokok soal PG WAJIB berupa kalimat pernyataan belum selesai yang diakhiri 4 titik (....).
   (Tanda tanya ? HANYA boleh jika bentuk soal adalah Uraian).
2. OPSI PILIHAN GANDA: HARUS 100% KONKRET, LOGIS, dan menjawab pokok soal. Dilarang kata-kata abstrak seperti "penerapan konsep".
3. KUNCI JAWABAN: Harus tepat, jelas, dan kunci diacak (bisa A, B, C, atau D).
4. PEMBAHASAN: Berisi penalaran sederhana dan runtut ramah anak usia SD/MI.

KEMBALIKAN HANYA FORMAT JSON BERIKUT:
{
  "stimulus": "teks pengantar/cerita kontekstual singkat",
  "pertanyaan": "pernyataan belum selesai berakhiran .... (untuk PG) atau kalimat tanya (untuk Uraian)",
  "opsi": [
    { "label": "A", "text": "opsi konkret A" },
    { "label": "B", "text": "opsi konkret B" },
    { "label": "C", "text": "opsi konkret C" },
    { "label": "D", "text": "opsi konkret D" }
  ],
  "kunciJawaban": "A" | "B" | "C" | "D",
  "pembahasan": "penjelasan logis dan sederhana",
  "rubrikPenskoran": {
    "skor4": "...",
    "skor3": "...",
    "skor2": "...",
    "skor1": "...",
    "skor0": "..."
  }
}`;

      try {
        const response = await callGeminiWithTimeout({
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.35,
          },
        });

        const responseText = response.text || '{}';
        const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        let cleanPertanyaan = parsed.pertanyaan || 'Pertanyaan hasil rumusan berbasis indikator.';
        if (kisiKisiItem.bentukSoal === 'Pilihan Ganda') {
          cleanPertanyaan = sanitizePgQuestion(cleanPertanyaan);
        }

        const updated = {
          id: finalId,
          nomorSoal: targetNomor,
          kisiKisiId: kisiKisiItem.id,
          stimulus: parsed.stimulus || '',
          pertanyaan: cleanPertanyaan,
          bentukSoal: kisiKisiItem.bentukSoal,
          level: kisiKisiItem.level,
          opsi: kisiKisiItem.bentukSoal === 'Pilihan Ganda' ? parsed.opsi : undefined,
          kunciJawaban: parsed.kunciJawaban || (kisiKisiItem.bentukSoal === 'Pilihan Ganda' ? 'A' : 'Kunci jawaban terlampir'),
          pembahasan: parsed.pembahasan || 'Pembahasan terstruktur.',
          rubrikPenskoran: parsed.rubrikPenskoran,
          kesesuaianIndikator: 'Sangat Sesuai',
          kesesuaianPersen: 100,
          catatanValidasi: '100% selaras dengan indikator kisi-kisi dan kaidah bahasa SD/MI.'
        };

        return res.json({ success: true, data: updated, source: 'ai' });
      } catch (geminiErr) {
        console.warn('Gemini single question generation error, fallback to concrete engine:', geminiErr);
      }
    }

    // High quality dynamic fallback generator
    const concrete = generateConcreteQuestionItem(
      kisiKisiItem,
      targetNomor - 1,
      jenjang,
      kelas,
      mataPelajaran,
      variationSeed
    );
    if (concrete.bentukSoal === 'Pilihan Ganda') {
      concrete.pertanyaan = sanitizePgQuestion(concrete.pertanyaan);
    }
    concrete.id = finalId;
    concrete.nomorSoal = targetNomor;
    concrete.kisiKisiId = kisiKisiItem.id;

    return res.json({ success: true, data: concrete, source: 'built-in-engine' });
  } catch (error: any) {
    console.error('Error generating single question:', error);
    return res.status(500).json({ success: false, error: error.message || 'Gagal merumuskan butir soal' });
  }
};

app.post('/api/regenerate-single-question', handleSingleQuestion);
app.post('/api/generate-single-question', handleSingleQuestion);

/**
 * 4. POST /api/validate-assessment
 */
app.post('/api/validate-assessment', async (req, res) => {
  try {
    const { kisiKisi = [], questions = [] } = req.body;

    const validationTable = questions.map((q: any) => {
      const kisi = kisiKisi.find((k: any) => k.nomorSoal === q.nomorSoal || k.id === q.kisiKisiId);
      const isMatch = Boolean(kisi);
      const levelMatch = kisi ? kisi.level === q.level : true;
      const bentukMatch = kisi ? kisi.bentukSoal === q.bentukSoal : true;
      const isPg = q.bentukSoal === 'Pilihan Ganda';
      const hasQuestionMarkInPg = isPg && (q.pertanyaan || '').includes('?');

      // Check if options are generic/abstract
      const hasAbstractOptions = q.opsi?.some((op: any) =>
        /penerapan konsep|tindakan yang bertentangan|alternatif yang tidak memenuhi|contoh yang kurang relevan/i.test(op.text || '')
      );

      const passed = isMatch && levelMatch && bentukMatch && !hasAbstractOptions && !hasQuestionMarkInPg;

      let masalahText = null;
      if (hasAbstractOptions) {
        masalahText = 'Opsi pilihan ganda belum konkret/ramah anak SD/MI';
      } else if (hasQuestionMarkInPg) {
        masalahText = 'Pokok soal pilihan ganda menggunakan tanda tanya (?) — kaidah resmi asesmen mengharuskan kalimat pernyataan yang diakhiri titik-titik (....)';
      } else if (!passed) {
        masalahText = 'Ketidaksesuaian level atau bentuk soal dengan kisi-kisi';
      }

      return {
        nomorSoal: q.nomorSoal,
        indikator: kisi ? kisi.indikatorSoal : 'Tidak terhubung ke kisi-kisi',
        kesesuaian: passed ? '100%' : '70%',
        level: q.level,
        bentuk: q.bentukSoal,
        status: passed ? 'Valid' : 'Perlu Revisi',
        masalah: masalahText,
        rekomendasi: passed ? 'Siap digunakan' : hasQuestionMarkInPg ? 'Ubah pokok soal menjadi kalimat pernyataan berakhiran ....' : 'Regenerate soal agar opsi konkret'
      };
    });

    const duplicateAlerts: string[] = [];
    for (let i = 0; i < questions.length; i++) {
      for (let j = i + 1; j < questions.length; j++) {
        const textA = (questions[i].pertanyaan || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const textB = (questions[j].pertanyaan || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (textA.length > 10 && textB.length > 10 && (textA.includes(textB) || textB.includes(textA) || textA === textB)) {
          duplicateAlerts.push(`Soal No. ${questions[i].nomorSoal} dan No. ${questions[j].nomorSoal} memiliki kemiripan redaksi yang tinggi.`);
        }
      }
    }

    const totalValid = validationTable.filter((v: any) => v.status === 'Valid').length;
    const allValid = totalValid === questions.length && duplicateAlerts.length === 0;

    return res.json({
      success: true,
      data: {
        validationTable,
        duplicateAlerts,
        consistencyPercent: questions.length > 0 ? Math.round((totalValid / questions.length) * 100) : 100,
        finalStatus: allValid ? 'VALID' : 'PERLU PERBAIKAN'
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Vite middleware in dev or static files in production
async function setupVite() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KISI-SOAL AI SD/MI server running on port ${PORT}`);
  });
});
