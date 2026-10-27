import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Download, 
  Upload, 
  Layers, 
  HelpCircle,
  FileSpreadsheet,
  Check,
  X,
  Wand2
} from 'lucide-react';
import { KisiKisiItem, CognitiveLevel, BentukSoal } from '../types/assessment';
import { exportKisiKisiToCSV, parseCSVToKisiKisi } from '../utils/excelImportExport';

interface TabKisiKisiProps {
  kisiKisi: KisiKisiItem[];
  onUpdateKisiKisi: (updated: KisiKisiItem[]) => void;
  onGenerateQuestions: () => void;
  isGeneratingQuestions: boolean;
}

export const TabKisiKisi: React.FC<TabKisiKisiProps> = ({
  kisiKisi,
  onUpdateKisiKisi,
  onGenerateQuestions,
  isGeneratingQuestions,
}) => {
  // Modal / Inline Edit state
  const [editingItem, setEditingItem] = useState<KisiKisiItem | null>(null);
  const [validationModalOpen, setValidationModalOpen] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    issues: string[];
  }>({ isValid: true, issues: [] });

  // Add new row
  const handleAddRow = () => {
    const nextNomor = kisiKisi.length + 1;
    const newItem: KisiKisiItem = {
      id: `kisi-${Date.now()}-${nextNomor}`,
      nomorSoal: nextNomor,
      capaianPembelajaran: kisiKisi[0]?.capaianPembelajaran || 'Capaian Pembelajaran',
      tujuanPembelajaran: kisiKisi[0]?.tujuanPembelajaran || 'Tujuan Pembelajaran',
      materiAjar: kisiKisi[0]?.materiAjar || 'Materi Pokok',
      indikatorSoal: 'Disajikan stimulus, peserta didik dapat menyelesaikan permasalahan terkait materi dengan tepat.',
      level: 'L2',
      bentukSoal: 'Pilihan Ganda',
    };
    onUpdateKisiKisi([...kisiKisi, newItem]);
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    const filtered = kisiKisi.filter((k) => k.id !== id);
    // Renumber sequentially 1, 2, 3...
    const renumbered = filtered.map((item, idx) => ({
      ...item,
      nomorSoal: idx + 1,
    }));
    onUpdateKisiKisi(renumbered);
  };

  // Duplicate row
  const handleDuplicateRow = (item: KisiKisiItem) => {
    const index = kisiKisi.findIndex((k) => k.id === item.id);
    const duplicated: KisiKisiItem = {
      ...item,
      id: `kisi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nomorSoal: item.nomorSoal + 1,
    };
    const newList = [...kisiKisi];
    newList.splice(index + 1, 0, duplicated);
    // Renumber
    const renumbered = newList.map((it, idx) => ({
      ...it,
      nomorSoal: idx + 1,
    }));
    onUpdateKisiKisi(renumbered);
  };

  // Move row up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newList = [...kisiKisi];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    const renumbered = newList.map((it, idx) => ({
      ...it,
      nomorSoal: idx + 1,
    }));
    onUpdateKisiKisi(renumbered);
  };

  // Move row down
  const handleMoveDown = (index: number) => {
    if (index >= kisiKisi.length - 1) return;
    const newList = [...kisiKisi];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;
    const renumbered = newList.map((it, idx) => ({
      ...it,
      nomorSoal: idx + 1,
    }));
    onUpdateKisiKisi(renumbered);
  };

  // Save edit
  const handleSaveEdit = () => {
    if (!editingItem) return;
    const updated = kisiKisi.map((k) => (k.id === editingItem.id ? editingItem : k));
    onUpdateKisiKisi(updated);
    setEditingItem(null);
  };

  // Validate Kisi-Kisi
  const handleValidateKisiKisi = () => {
    const issues: string[] = [];

    if (kisiKisi.length === 0) {
      issues.push('Tabel kisi-kisi belum memiliki data baris.');
    }

    // Check duplicate numbers
    const numMap = new Map<number, number>();
    kisiKisi.forEach((k) => {
      numMap.set(k.nomorSoal, (numMap.get(k.nomorSoal) || 0) + 1);
      if (!k.capaianPembelajaran || k.capaianPembelajaran.trim().length < 5) {
        issues.push(`Baris No. ${k.nomorSoal}: Capaian Pembelajaran belum lengkap.`);
      }
      if (!k.tujuanPembelajaran || k.tujuanPembelajaran.trim().length < 5) {
        issues.push(`Baris No. ${k.nomorSoal}: Tujuan Pembelajaran belum lengkap.`);
      }
      if (!k.materiAjar || k.materiAjar.trim().length < 2) {
        issues.push(`Baris No. ${k.nomorSoal}: Materi ajar belum diisi.`);
      }
      if (!k.indikatorSoal || k.indikatorSoal.trim().length < 10) {
        issues.push(`Baris No. ${k.nomorSoal}: Indikator soal terlalu singkat / belum operasional.`);
      }
    });

    numMap.forEach((count, num) => {
      if (count > 1) {
        issues.push(`Ditemukan nomor soal ganda: Nomor ${num} muncul ${count} kali.`);
      }
    });

    const isValid = issues.length === 0;
    setValidationResult({ isValid, issues });
    setValidationModalOpen(true);
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCSVToKisiKisi(text);
        if (parsed.length > 0) {
          const filled: KisiKisiItem[] = parsed.map((p, idx) => ({
            id: p.id || `kisi-imp-${Date.now()}-${idx + 1}`,
            nomorSoal: idx + 1,
            capaianPembelajaran: p.capaianPembelajaran || 'CP',
            tujuanPembelajaran: p.tujuanPembelajaran || 'TP',
            materiAjar: p.materiAjar || 'Materi',
            indikatorSoal: p.indikatorSoal || 'Indikator',
            level: p.level || 'L2',
            bentukSoal: p.bentukSoal || 'Pilihan Ganda',
          }));
          onUpdateKisiKisi(filled);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-bold text-gray-900">
              Format Tabel Kisi-Kisi Resmi (Standar Kemendikbud & Kemenag)
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Total terdaftar: <strong className="text-emerald-800">{kisiKisi.length} butir kisi-kisi</strong>. Setiap baris wajib mengukur satu indikator spesifik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Validate Button */}
          <button
            type="button"
            onClick={handleValidateKisiKisi}
            className="inline-flex items-center px-3 py-2 text-xs font-bold rounded-xl bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100 transition shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
            VALIDASI KISI-KISI
          </button>

          {/* Add Row Button */}
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center px-3 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Tambah Baris
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={() => exportKisiKisiToCSV(kisiKisi)}
            className="inline-flex items-center px-2.5 py-2 text-xs font-semibold rounded-xl bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition"
            title="Download CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-gray-500" />
            CSV
          </button>

          {/* Import CSV */}
          <label className="inline-flex items-center px-2.5 py-2 text-xs font-semibold rounded-xl bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5 mr-1 text-gray-500" />
            Import
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* GENERATE QUESTIONS BUTTON */}
          <button
            type="button"
            onClick={onGenerateQuestions}
            disabled={isGeneratingQuestions || kisiKisi.length === 0}
            className="inline-flex items-center px-4 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition disabled:opacity-60 cursor-pointer"
          >
            {isGeneratingQuestions ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                <span>Membuat Soal dari Kisi-Kisi...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                <span>GENERATE SOAL DARI KISI-KISI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Table with Horizontal Scroll for Mobile */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-emerald-800 text-white font-bold border-b border-emerald-900 text-center text-xs">
                <th className="py-3 px-2 w-12 border-r border-emerald-700/60">No.</th>
                <th className="py-3 px-3 w-48 text-left border-r border-emerald-700/60">Capaian Pembelajaran</th>
                <th className="py-3 px-3 w-52 text-left border-r border-emerald-700/60">Tujuan Pembelajaran</th>
                <th className="py-3 px-3 w-40 text-left border-r border-emerald-700/60">Materi Ajar</th>
                <th className="py-3 px-3 min-w-[280px] text-left border-r border-emerald-700/60">Indikator Soal</th>
                <th className="py-3 px-2 w-16 border-r border-emerald-700/60">Level</th>
                <th className="py-3 px-2 w-28 border-r border-emerald-700/60">Bentuk Soal</th>
                <th className="py-3 px-2 w-16 border-r border-emerald-700/60">Nomor Soal</th>
                <th className="py-3 px-2 w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {kisiKisi.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="font-semibold">Belum ada baris kisi-kisi.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Silakan kembali ke <strong>Tab Identitas</strong> lalu klik <em>Generate Kisi-Kisi</em> atau klik <em>Tambah Baris</em> di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                kisiKisi.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-emerald-50/50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                    }`}
                  >
                    {/* No. */}
                    <td className="py-3 px-2 text-center font-bold text-gray-600 border-r border-gray-200/80">
                      {item.nomorSoal}
                    </td>

                    {/* CP */}
                    <td className="py-3 px-3 text-xs text-gray-700 line-clamp-3 border-r border-gray-200/80">
                      {item.capaianPembelajaran}
                    </td>

                    {/* TP */}
                    <td className="py-3 px-3 text-xs text-gray-700 border-r border-gray-200/80">
                      {item.tujuanPembelajaran}
                    </td>

                    {/* Materi Ajar */}
                    <td className="py-3 px-3 font-semibold text-emerald-950 border-r border-gray-200/80">
                      <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-900 border border-emerald-200 text-xs inline-block">
                        {item.materiAjar}
                      </span>
                    </td>

                    {/* Indikator Soal */}
                    <td className="py-3 px-3 text-xs leading-relaxed font-medium text-gray-900 border-r border-gray-200/80 bg-amber-50/30">
                      {item.indikatorSoal}
                    </td>

                    {/* Level */}
                    <td className="py-3 px-2 text-center border-r border-gray-200/80">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          item.level === 'L1'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : item.level === 'L2'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {item.level}
                      </span>
                    </td>

                    {/* Bentuk Soal */}
                    <td className="py-3 px-2 text-center border-r border-gray-200/80 text-xs font-semibold">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                        {item.bentukSoal}
                      </span>
                    </td>

                    {/* Nomor Soal */}
                    <td className="py-3 px-2 text-center font-black text-emerald-900 border-r border-gray-200/80">
                      {item.nomorSoal}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="p-1 rounded text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Baris Ini"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(item)}
                          className="p-1 rounded text-teal-600 hover:bg-teal-50 transition"
                          title="Duplikasi Baris"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20"
                          title="Pindah Naik"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === kisiKisi.length - 1}
                          className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20"
                          title="Pindah Turun"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(item.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 transition"
                          title="Hapus Baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Row Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                Edit Baris Kisi-Kisi Nomor {editingItem.nomorSoal}
              </h4>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Capaian Pembelajaran (CP)</label>
                <textarea
                  rows={2}
                  value={editingItem.capaianPembelajaran}
                  onChange={(e) => setEditingItem({ ...editingItem, capaianPembelajaran: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tujuan Pembelajaran (TP)</label>
                <input
                  type="text"
                  value={editingItem.tujuanPembelajaran}
                  onChange={(e) => setEditingItem({ ...editingItem, tujuanPembelajaran: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Materi Ajar</label>
                  <input
                    type="text"
                    value={editingItem.materiAjar}
                    onChange={(e) => setEditingItem({ ...editingItem, materiAjar: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nomor Soal</label>
                  <input
                    type="number"
                    value={editingItem.nomorSoal}
                    onChange={(e) => setEditingItem({ ...editingItem, nomorSoal: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 text-xs text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Indikator Soal (Acuan Mutlak Soal)
                </label>
                <textarea
                  rows={3}
                  value={editingItem.indikatorSoal}
                  onChange={(e) => setEditingItem({ ...editingItem, indikatorSoal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 focus:ring-2 focus:ring-emerald-500 text-xs bg-emerald-50/30 font-medium"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Tips: Gunakan rumusan operasional (contoh: <em>Disajikan ..., peserta didik dapat menentukan ... dengan tepat</em>).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Level Kognitif</label>
                  <select
                    value={editingItem.level}
                    onChange={(e) => setEditingItem({ ...editingItem, level: e.target.value as CognitiveLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
                  >
                    <option value="L1">L1 — Pengetahuan / Pemahaman</option>
                    <option value="L2">L2 — Aplikasi</option>
                    <option value="L3">L3 — Penalaran (HOTS)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bentuk Soal</label>
                  <select
                    value={editingItem.bentukSoal}
                    onChange={(e) => setEditingItem({ ...editingItem, bentukSoal: e.target.value as BentukSoal })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
                  >
                    <option value="Pilihan Ganda">Pilihan Ganda</option>
                    <option value="Uraian">Uraian</option>
                    <option value="Pilihan Ganda Kompleks">Pilihan Ganda Kompleks</option>
                    <option value="Benar/Salah">Benar/Salah</option>
                    <option value="Menjodohkan">Menjodohkan</option>
                    <option value="Isian">Isian</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Result Modal */}
      {validationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                  validationResult.isValid ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
              >
                {validationResult.isValid ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Hasil Validasi Kisi-Kisi
                </h4>
                <div
                  className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                    validationResult.isValid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Status: {validationResult.isValid ? '✅ VALID' : '⚠️ PERLU PERBAIKAN'}
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-600 space-y-2 mb-5">
              {validationResult.isValid ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                  <p className="font-bold">Kisi-kisi lengkap dan memenuhi seluruh kaidah:</p>
                  <ul className="list-disc ml-4 mt-1.5 space-y-1 text-emerald-800">
                    <li>Semua baris memiliki CP, TP, dan Materi Ajar.</li>
                    <li>Indikator soal operasional dan terukur.</li>
                    <li>Nomor soal berurutan tanpa duplikasi.</li>
                    <li>Distribusi level L1, L2, L3 dan bentuk soal terstruktur.</li>
                  </ul>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900">
                  <p className="font-bold mb-1">Catatan perbaikan yang perlu diperhatikan:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    {validationResult.issues.map((iss, i) => (
                      <li key={i}>{iss}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setValidationModalOpen(false)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
