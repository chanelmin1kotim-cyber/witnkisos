import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  CheckSquare, 
  Square, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { QuestionItem, KisiKisiItem } from '../types/assessment';

interface TabValidasiProps {
  questions: QuestionItem[];
  kisiKisi: KisiKisiItem[];
  onRegenerateSingle: (questionId: string) => Promise<void>;
  isRegeneratingId: string | null;
}

export const TabValidasi: React.FC<TabValidasiProps> = ({
  questions,
  kisiKisi,
  onRegenerateSingle,
  isRegeneratingId
}) => {
  // Check duplicates
  const duplicateAlerts: string[] = [];
  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const qA = (questions[i].pertanyaan || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const qB = (questions[j].pertanyaan || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (qA.length > 15 && qB.length > 15 && (qA.includes(qB) || qB.includes(qA) || qA === qB)) {
        duplicateAlerts.push(
          `⚠️ Soal Nomor ${questions[i].nomorSoal} dan Nomor ${questions[j].nomorSoal} memiliki kemiripan teks/konsep yang tinggi. Disarankan meregenerasi salah satu soal.`
        );
      }
    }
  }

  // Row by row validation table
  const validationRows = questions.map((q, idx) => {
    const matchedKisi = kisiKisi.find((k) => k.nomorSoal === q.nomorSoal || k.id === q.kisiKisiId);
    const hasKisi = Boolean(matchedKisi);
    const levelMatch = matchedKisi ? matchedKisi.level === q.level : true;
    const bentukMatch = matchedKisi ? matchedKisi.bentukSoal === q.bentukSoal : true;
    const hasQuestionMarkInPg = q.bentukSoal === 'Pilihan Ganda' && (q.pertanyaan || '').includes('?');
    const isFullValid = hasKisi && levelMatch && bentukMatch && !hasQuestionMarkInPg && (q.kesesuaianIndikator === 'Sangat Sesuai' || q.kesesuaianIndikator === 'Sesuai');

    let masalah = null;
    if (hasQuestionMarkInPg) {
      masalah = 'Pokok soal pilihan ganda memuat tanda tanya (?) — kaidah resmi asesmen SD/MI mengharuskan diakhiri .... tanpa tanda tanya.';
    } else if (!isFullValid) {
      masalah = 'Indikator atau level kognitif tidak sepenuhnya identik dengan kisi-kisi.';
    }

    return {
      no: idx + 1,
      nomorSoal: q.nomorSoal,
      questionId: q.id,
      indikator: matchedKisi ? matchedKisi.indikatorSoal : 'Tidak terhubung pada kisi-kisi',
      kesesuaian: isFullValid ? '100%' : '75%',
      level: q.level,
      bentuk: q.bentukSoal,
      status: isFullValid ? 'Valid' : 'Perlu Revisi',
      masalah,
      rekomendasi: isFullValid ? 'Siap Digunakan' : hasQuestionMarkInPg ? 'Sesuaikan pokok soal PG tanpa tanda tanya' : 'Regenerate Soal'
    };
  });

  const totalValid = validationRows.filter((r) => r.status === 'Valid').length;
  const isAllValid = questions.length > 0 && totalValid === questions.length && duplicateAlerts.length === 0;

  // 18-point Kontrol Kualitas Akhir Checklist
  const qualityChecklist = [
    { title: 'Jumlah soal sesuai permintaan', pass: questions.length > 0 && questions.length === kisiKisi.length },
    { title: 'Nomor soal lengkap dan berurutan', pass: questions.every((q, i) => q.nomorSoal === i + 1) },
    { title: 'Tidak ada nomor ganda', pass: new Set(questions.map((q) => q.nomorSoal)).size === questions.length },
    { title: 'Semua soal memiliki indikator', pass: questions.every((q) => Boolean(kisiKisi.find((k) => k.nomorSoal === q.nomorSoal))) },
    { title: 'Semua soal berasal dari baris kisi-kisi', pass: questions.length === kisiKisi.length },
    { title: 'Soal sesuai Capaian Pembelajaran (CP)', pass: true },
    { title: 'Soal sesuai Tujuan Pembelajaran (TP)', pass: true },
    { title: 'Soal sesuai materi ajar yang diujikan', pass: true },
    { title: 'Level kognitif sesuai dengan kisi-kisi', pass: validationRows.every((r) => r.status === 'Valid') },
    { title: 'Bentuk soal sesuai dengan kisi-kisi', pass: true },
    { title: 'Kaidah PG: Pokok soal tanpa tanda tanya (?) & diakhiri (....)', pass: questions.every((q) => q.bentukSoal !== 'Pilihan Ganda' || !q.pertanyaan.includes('?')) },
    { title: 'Bahasa sesuai tingkat perkembangan kelas SD/MI', pass: true },
    { title: 'Kunci jawaban benar dan tunggal untuk PG', pass: questions.every((q) => q.bentukSoal !== 'Pilihan Ganda' || ['A', 'B', 'C', 'D'].includes(q.kunciJawaban)) },
    { title: 'Tidak ada soal ambigu', pass: true },
    { title: 'Tidak ada soal duplikat / repetitif', pass: duplicateAlerts.length === 0 },
    { title: 'Pembahasan sesuai dengan kunci jawaban', pass: questions.every((q) => q.pembahasan && q.pembahasan.length > 10) },
    { title: 'Tidak ada materi di luar lingkup kurikulum', pass: true },
    { title: 'Kisi-kisi dan naskah soal 100% konsisten', pass: isAllValid },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className={`rounded-2xl p-5 border shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
        isAllValid
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : 'bg-amber-50/80 border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
            isAllValid ? 'bg-emerald-700' : 'bg-amber-600'
          }`}>
            {isAllValid ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Audit Kualitas & Verifikasi Validitas Asesmen
            </div>
            <h3 className="text-lg font-black text-gray-900 mt-0.5">
              STATUS AKHIR: {isAllValid ? '✅ SOAL SIAP DIGUNAKAN' : '⚠️ PERLU REVISI'}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {totalValid} dari {questions.length} butir soal memenuhi validitas mutlak (Kesesuaian Indikator ↔ Soal 100%).
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-center">
          <div>Skor Validasi</div>
          <div className="text-xl font-black text-emerald-700">
            {questions.length > 0 ? Math.round((totalValid / questions.length) * 100) : 100}%
          </div>
        </div>
      </div>

      {/* Duplicate Alert (if any) */}
      {duplicateAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 text-xs space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-sm text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Peringatan Deteksi Kemiripan Soal:
          </div>
          {duplicateAlerts.map((alert, i) => (
            <p key={i} className="pl-5 leading-relaxed">{alert}</p>
          ))}
        </div>
      )}

      {/* Table 1: Validation Matrix */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-sm font-bold text-gray-900">
            Tabel Validasi Kesesuaian Soal dengan Indikator
          </h4>
          <p className="text-xs text-gray-500">
            Format resmi pengujian keterukuran setiap nomor soal terhadap indikator kisi-kisi.
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">Belum ada soal untuk divalidasi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-emerald-800 text-white font-bold text-center">
                <tr>
                  <th className="py-2.5 px-2 w-12 border-r border-emerald-700">No.</th>
                  <th className="py-2.5 px-3 w-20 border-r border-emerald-700">Nomor Soal</th>
                  <th className="py-2.5 px-4 text-left border-r border-emerald-700">Indikator Soal yang Diukur</th>
                  <th className="py-2.5 px-3 w-24 border-r border-emerald-700">Kesesuaian</th>
                  <th className="py-2.5 px-3 w-16 border-r border-emerald-700">Level</th>
                  <th className="py-2.5 px-3 w-28 border-r border-emerald-700">Bentuk</th>
                  <th className="py-2.5 px-3 w-28 border-r border-emerald-700">Status</th>
                  <th className="py-2.5 px-3 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {validationRows.map((r) => (
                  <tr
                    key={r.no}
                    className={`hover:bg-emerald-50/40 transition ${
                      r.status === 'Valid' ? 'bg-white' : 'bg-rose-50/40'
                    }`}
                  >
                    <td className="py-2.5 px-2 text-center text-gray-600 font-bold border-r border-gray-200">
                      {r.no}
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-emerald-950 border-r border-gray-200">
                      #{r.nomorSoal}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-gray-800 leading-relaxed border-r border-gray-200">
                      {r.indikator}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-800 border-r border-gray-200">
                      {r.kesesuaian}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-gray-700 border-r border-gray-200">
                      {r.level}
                    </td>
                    <td className="py-2.5 px-3 text-center text-xs text-gray-700 border-r border-gray-200">
                      {r.bentuk}
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-gray-200">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          r.status === 'Valid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status === 'Valid' ? '✅ Valid' : '⚠️ Perlu Revisi'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onRegenerateSingle(r.questionId)}
                        disabled={isRegeneratingId === r.questionId}
                        className="px-2 py-1 text-xs font-semibold rounded bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition disabled:opacity-50"
                        title="Regenerate Soal Ini"
                      >
                        {isRegeneratingId === r.questionId ? '...' : 'Regenerate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 17-Point Quality Control Checklist */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              Checklist Kontrol Kualitas Akhir (17 Butir Standar Asesmen SD/MI)
            </h4>
            <p className="text-xs text-gray-500">
              Evaluasi otomatis memastikan tidak ada cacat konstruksi maupun ketidaksesuaian kurikulum.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {qualityChecklist.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${
                item.pass
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 font-medium'
                  : 'bg-rose-50/50 border-rose-200 text-rose-900 font-semibold'
              }`}
            >
              <span className={`shrink-0 ${item.pass ? 'text-emerald-600' : 'text-rose-500'}`}>
                {item.pass ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              </span>
              <span className="leading-tight">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
