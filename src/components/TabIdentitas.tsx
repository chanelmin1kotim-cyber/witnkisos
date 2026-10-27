import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  BookMarked, 
  Calendar, 
  User, 
  Clock, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle,
  HelpCircle,
  Layers,
  Wand2,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { SchoolIdentity, Jenjang, BentukSoal } from '../types/assessment';
import { CURRICULUM_PRESETS, SubjectPreset } from '../data/curriculumData';

interface TabIdentitasProps {
  identity: SchoolIdentity;
  onUpdateIdentity: (updated: Partial<SchoolIdentity>) => void;
  onGenerateKisiKisi: (params: {
    totalSoal: number;
    levelDist: { L1: number; L2: number; L3: number };
    bentukDist: { pg: number; uraian: number };
    cp: string;
    tpList: string[];
    materiList: string[];
  }) => void;
  isGeneratingKisi: boolean;
  activePreset: SubjectPreset | null;
  onApplyPreset: (preset: SubjectPreset) => void;
}

export const TabIdentitas: React.FC<TabIdentitasProps> = ({
  identity,
  onUpdateIdentity,
  onGenerateKisiKisi,
  isGeneratingKisi,
  activePreset,
  onApplyPreset
}) => {
  // Local state for configuration
  const [totalSoal, setTotalSoal] = useState<number>(10);
  const [customSoal, setCustomSoal] = useState<string>('15');
  const [selectedSoalType, setSelectedSoalType] = useState<'10' | '20' | '25' | '30' | '40' | '50' | 'custom'>('10');

  // Cognitive distribution percentages
  const [distL1, setDistL1] = useState<number>(30); // 30% L1
  const [distL2, setDistL2] = useState<number>(50); // 50% L2
  const [distL3, setDistL3] = useState<number>(20); // 20% L3

  // Shapes
  const [selectedBentuk, setSelectedBentuk] = useState<BentukSoal[]>([
    'Pilihan Ganda',
    'Uraian'
  ]);
  const [pgCount, setPgCount] = useState<number>(7);

  // CP, TP, Materi Lists
  const [cpText, setCpText] = useState<string>(
    identity.mataPelajaran === 'Fikih'
      ? 'Peserta didik memahami ketentuan zakat fitrah, infak, dan sedekah serta mempraktikkannya sebagai wujud ketaatan kepada Allah Swt. dan kepedulian sosial terhadap sesama.'
      : 'Peserta didik dapat memahami dan melakukan operasi hitung bilangan cacah sampai 10.000, menentukan pecahan senilai, membandingkan dan mengurutkan pecahan serta menyelesaikan masalah kontekstual.'
  );

  const [tpList, setTpList] = useState<string[]>([
    'Peserta didik mampu membandingkan dan mengurutkan pecahan dengan penyebut sama dan berbeda.',
    'Peserta didik mampu menentukan pecahan senilai menggunakan gambar dan pembagian silang.',
    'Peserta didik mampu menyelesaikan masalah sehari-hari yang berkaitan dengan pecahan.'
  ]);
  const [newTpInput, setNewTpInput] = useState<string>('');

  const [materiList, setMateriList] = useState<string[]>([
    'Membandingkan Pecahan',
    'Pecahan Senilai',
    'Masalah Kontekstual Pecahan'
  ]);
  const [newMateriInput, setNewMateriInput] = useState<string>('');

  // Handle Preset Selection
  const handleSelectPreset = (preset: SubjectPreset) => {
    onApplyPreset(preset);
    setCpText(preset.cp);
    setTpList([...preset.tpList]);
    setMateriList([...preset.materiList]);
    onUpdateIdentity({
      mataPelajaran: preset.mataPelajaran,
      kelas: preset.kelas[0] || identity.kelas,
      semester: preset.semester || identity.semester,
      jenjang: preset.jenjang.includes(identity.jenjang) ? identity.jenjang : preset.jenjang[0]
    });
  };

  const handleAddTp = () => {
    if (newTpInput.trim()) {
      setTpList([...tpList, newTpInput.trim()]);
      setNewTpInput('');
    }
  };

  const handleRemoveTp = (idx: number) => {
    if (tpList.length > 1) {
      setTpList(tpList.filter((_, i) => i !== idx));
    }
  };

  const handleAddMateri = () => {
    if (newMateriInput.trim()) {
      setMateriList([...materiList, newMateriInput.trim()]);
      setNewMateriInput('');
    }
  };

  const handleRemoveMateri = (idx: number) => {
    if (materiList.length > 1) {
      setMateriList(materiList.filter((_, i) => i !== idx));
    }
  };

  const handleTotalSoalChange = (val: string) => {
    if (val === 'custom') {
      setSelectedSoalType('custom');
      const num = parseInt(customSoal) || 10;
      setTotalSoal(num);
      setPgCount(Math.round(num * 0.7));
    } else {
      setSelectedSoalType(val as any);
      const num = parseInt(val);
      setTotalSoal(num);
      setPgCount(Math.round(num * 0.7));
    }
  };

  const handleTriggerGenerate = () => {
    onGenerateKisiKisi({
      totalSoal,
      levelDist: { L1: distL1, L2: distL2, L3: distL3 },
      bentukDist: { pg: pgCount, uraian: Math.max(0, totalSoal - pgCount) },
      cp: cpText,
      tpList,
      materiList
    });
  };

  return (
    <div className="space-y-8">
      {/* Step 1 & 2: Identitas Lembaga & Jenjang */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 sm:p-7">
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Langkah 1 & 2 — Identitas Lembaga, Jenjang & Mata Pelajaran
            </h3>
            <p className="text-xs text-gray-500">
              Pilih jenjang SD atau MI, kelas, semester, dan data administrasi penilaian resmi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Jenjang */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Jenjang Pendidikan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateIdentity({ jenjang: 'SD' })}
                className={`py-2 px-3 text-sm font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                  identity.jenjang === 'SD'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Sekolah Dasar (SD)
              </button>
              <button
                type="button"
                onClick={() => onUpdateIdentity({ jenjang: 'MI' })}
                className={`py-2 px-3 text-sm font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                  identity.jenjang === 'MI'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300/40'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Madrasah (MI)
              </button>
            </div>
          </div>

          {/* Kelas */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Kelas Peserta Didik <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => onUpdateIdentity({ kelas: k })}
                  className={`py-2 text-sm font-bold rounded-lg border transition ${
                    identity.kelas === k
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Fase: {identity.kelas <= 2 ? 'Fase A (Kelas 1-2)' : identity.kelas <= 4 ? 'Fase B (Kelas 3-4)' : 'Fase C (Kelas 5-6)'}
            </p>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Semester <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdateIdentity({ semester: s as 1 | 2 })}
                  className={`py-2 px-3 text-sm font-bold rounded-xl border transition ${
                    identity.semester === s
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  Semester {s} ({s === 1 ? 'Ganjil' : 'Genap'})
                </button>
              ))}
            </div>
          </div>

          {/* Nama Madrasah/Sekolah */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Nama Madrasah / Sekolah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={identity.namaMadrasah}
              onChange={(e) => onUpdateIdentity({ namaMadrasah: e.target.value })}
              placeholder="Contoh: MIN 1 Kotawaringin Timur / SDN Percobaan 1"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
            />
          </div>

          {/* Mata Pelajaran */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Mata Pelajaran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={identity.mataPelajaran}
              onChange={(e) => onUpdateIdentity({ mataPelajaran: e.target.value })}
              placeholder="Contoh: Matematika, Fikih, IPAS"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-bold text-emerald-900"
            />
          </div>

          {/* Tahun Pelajaran */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Tahun Pelajaran
            </label>
            <input
              type="text"
              value={identity.tahunPelajaran}
              onChange={(e) => onUpdateIdentity({ tahunPelajaran: e.target.value })}
              placeholder="2026/2027"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Nama Guru */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Nama Guru Pengampu
            </label>
            <input
              type="text"
              value={identity.namaGuru}
              onChange={(e) => onUpdateIdentity({ namaGuru: e.target.value })}
              placeholder="Nama Lengkap & Gelar Guru"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Alokasi Waktu */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Alokasi Waktu
            </label>
            <input
              type="text"
              value={identity.alokasiWaktu}
              onChange={(e) => onUpdateIdentity({ alokasiWaktu: e.target.value })}
              placeholder="60 Menit / 90 Menit"
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>

        {/* Quick Presets Picker */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Pilih Bank Template Kurikulum Merdeka (1-Klik Auto-Isi CP, TP & Materi):
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CURRICULUM_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1"
              >
                <span>{preset.mataPelajaran}</span>
                <span className="text-[10px] text-emerald-600 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                  {preset.jenjang.join('/')} Kls {preset.kelas.join(',')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 3, 4, 5: Capaian Pembelajaran, TP & Materi */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 sm:p-7">
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <BookMarked className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Langkah 3, 4 & 5 — Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP) & Materi Ajar
            </h3>
            <p className="text-xs text-gray-500">
              Setiap baris kisi-kisi dan butir soal akan diturunkan secara mutlak dari CP, TP, dan Materi ini.
            </p>
          </div>
        </div>

        {/* Capaian Pembelajaran */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
            <span>Capaian Pembelajaran (CP)</span>
            <span className="text-emerald-700 text-[11px] font-semibold">Dapat diedit atau diketik manual</span>
          </label>
          <textarea
            rows={3}
            value={cpText}
            onChange={(e) => setCpText(e.target.value)}
            placeholder="Tuliskan Capaian Pembelajaran (CP) di sini..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm leading-relaxed"
          />
        </div>

        {/* Tujuan Pembelajaran (TP) */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-800 mb-1.5">
            Tujuan Pembelajaran (TP) — Terdaftar ({tpList.length})
          </label>
          <div className="space-y-2 mb-3">
            {tpList.map((tp, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={tp}
                  onChange={(e) => {
                    const updated = [...tpList];
                    updated[idx] = e.target.value;
                    setTpList(updated);
                  }}
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm font-medium text-gray-800 focus:ring-0 p-0"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTp(idx)}
                  className="text-gray-400 hover:text-rose-500 transition p-1"
                  title="Hapus TP"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTpInput}
              onChange={(e) => setNewTpInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTp())}
              placeholder="Tambahkan Tujuan Pembelajaran baru..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
            />
            <button
              type="button"
              onClick={handleAddTp}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah TP
            </button>
          </div>
        </div>

        {/* Materi Ajar */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1.5">
            Materi Ajar yang Diujikan ({materiList.length})
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {materiList.map((materi, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold"
              >
                <span>{materi}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMateri(idx)}
                  className="text-amber-700 hover:text-rose-600"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMateriInput}
              onChange={(e) => setNewMateriInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMateri())}
              placeholder="Contoh: Pecahan Senilai, Bagian Tumbuhan, dsb."
              className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
            />
            <button
              type="button"
              onClick={handleAddMateri}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Materi
            </button>
          </div>
        </div>
      </div>

      {/* Step 6, 7, 8: Jumlah Soal, Distribusi Level & Bentuk Soal */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 sm:p-7">
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Langkah 6, 7 & 8 — Jumlah Soal, Distribusi Level Kognitif & Bentuk Soal
            </h3>
            <p className="text-xs text-gray-500">
              Atur taksonomi kognitif L1, L2, L3 dan kombinasi soal Pilihan Ganda serta Uraian.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Jumlah Soal */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-2">
              Jumlah Butir Soal
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['10', '20', '25', '30', '40', '50'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleTotalSoalChange(num)}
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    selectedSoalType === num
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {num} Soal
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleTotalSoalChange('custom')}
                className={`px-3 py-2 text-xs font-bold rounded-lg border transition ${
                  selectedSoalType === 'custom'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                Custom:
              </button>
              <input
                type="number"
                min="1"
                max="100"
                value={customSoal}
                onChange={(e) => {
                  setCustomSoal(e.target.value);
                  if (selectedSoalType === 'custom') {
                    const n = parseInt(e.target.value) || 10;
                    setTotalSoal(n);
                    setPgCount(Math.round(n * 0.7));
                  }
                }}
                className="w-20 px-2 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-center"
              />
              <span className="text-xs text-gray-500">soal</span>
            </div>
          </div>

          {/* Distribusi Level */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-2">
              Distribusi Level Kognitif ({distL1}% / {distL2}% / {distL3}%)
            </label>
            <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <div className="flex justify-between text-xs font-bold text-blue-900 mb-1">
                  <span>L1 (Pengetahuan/Pemahaman)</span>
                  <span>{Math.round((totalSoal * distL1) / 100)} butir ({distL1}%)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={distL1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setDistL1(val);
                    setDistL2(Math.max(10, 100 - val - distL3));
                  }}
                  className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-indigo-900 mb-1">
                  <span>L2 (Aplikasi & Perhitungan)</span>
                  <span>{Math.round((totalSoal * distL2) / 100)} butir ({distL2}%)</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="70"
                  value={distL2}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setDistL2(val);
                    setDistL3(Math.max(10, 100 - val - distL1));
                  }}
                  className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-purple-900 mb-1">
                  <span>L3 (Penalaran & Analisis HOTS)</span>
                  <span>{Math.round((totalSoal * distL3) / 100)} butir ({distL3}%)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={distL3}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setDistL3(val);
                    setDistL2(Math.max(10, 100 - val - distL1));
                  }}
                  className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Bentuk Soal */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-2">
              Bentuk Soal & Proporsi
            </label>
            <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Pilihan Ganda (PG):</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max={totalSoal}
                    value={pgCount}
                    onChange={(e) => setPgCount(Math.min(totalSoal, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-14 px-2 py-1 text-xs font-bold text-center rounded border border-gray-300"
                  />
                  <span className="text-xs text-gray-500">butir</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Uraian / Esai:</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {Math.max(0, totalSoal - pgCount)} butir
                </span>
              </div>

              <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                Total Soal: <strong className="text-gray-900">{totalSoal} butir</strong> (PG: {pgCount}, Uraian: {Math.max(0, totalSoal - pgCount)})
              </p>
            </div>
          </div>
        </div>

        {/* Generate Kisi-Kisi Button */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              AI membaca <strong>CP + TP + Materi + Level (L1/L2/L3)</strong> untuk menyusun indikator soal operasional.
            </span>
          </div>

          <button
            type="button"
            onClick={handleTriggerGenerate}
            disabled={isGeneratingKisi}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
          >
            {isGeneratingKisi ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyusun Indikator Kisi-Kisi...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-amber-300" />
                <span>GENERATE KISI-KISI SEKARANG</span>
                <ChevronRight className="w-4 h-4 text-emerald-200" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
