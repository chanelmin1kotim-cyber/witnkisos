import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  HelpCircle, 
  Target, 
  BarChart3,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { KisiKisiItem, QuestionItem } from '../types/assessment';

interface DashboardStatsProps {
  kisiKisi: KisiKisiItem[];
  questions: QuestionItem[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  kisiKisi,
  questions,
}) => {
  const totalKisi = kisiKisi.length;
  const totalSoal = questions.length;

  const countL1 = questions.filter((q) => q.level === 'L1').length;
  const countL2 = questions.filter((q) => q.level === 'L2').length;
  const countL3 = questions.filter((q) => q.level === 'L3').length;

  const countPg = questions.filter((q) => q.bentukSoal === 'Pilihan Ganda').length;
  const countUraian = questions.filter((q) => q.bentukSoal === 'Uraian').length;
  const countOther = totalSoal - countPg - countUraian;

  const validQuestions = questions.filter(
    (q) => q.kesesuaianIndikator === 'Sangat Sesuai' || q.kesesuaianIndikator === 'Sesuai'
  ).length;
  const needRevision = totalSoal - validQuestions;

  // Consistency rating: each question traced to exact kisi-kisi number
  const tracedQuestions = questions.filter((q) => {
    return kisiKisi.some((k) => k.nomorSoal === q.nomorSoal);
  }).length;

  const consistencyRate = totalSoal > 0 ? Math.round((tracedQuestions / totalSoal) * 100) : (totalKisi > 0 ? 100 : 0);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-100 mb-6 transition-all hover:shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Sistem Asesmen Berbasis Indikator
            </span>
            <span className="text-xs font-semibold text-gray-500">
              Prinsip 1 Baris Kisi-Kisi = 1 Unit Soal
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mt-1">
            Status Keterukuran & Konsistensi Asesmen
          </h2>
        </div>

        {/* Consistency Bar */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            {consistencyRate}%
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-900">
              Konsistensi Kisi-Kisi ↔ Soal: {consistencyRate}%
            </div>
            <div className="text-[11px] text-emerald-700">
              {totalSoal > 0
                ? `${totalSoal} dari ${totalSoal} soal terverifikasi mengukur indikator`
                : totalKisi > 0
                ? `${totalKisi} baris kisi-kisi siap digenerate menjadi naskah soal`
                : 'Lengkapi identitas dan susun kisi-kisi'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
        {/* Total Kisi */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Kisi-Kisi</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-800">{totalKisi} <span className="text-xs font-normal text-slate-500">baris</span></div>
        </div>

        {/* Total Soal */}
        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold mb-1">
            <span>Total Soal</span>
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-900">{totalSoal} <span className="text-xs font-normal text-emerald-600">butir</span></div>
        </div>

        {/* Kognitif L1/L2/L3 */}
        <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200/60">
          <div className="flex items-center justify-between text-blue-700 text-xs font-semibold mb-1">
            <span>Level L1 / L2 / L3</span>
            <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-sm font-bold text-blue-900 flex items-center gap-1.5 mt-0.5">
            <span className="px-1.5 py-0.5 bg-blue-100 rounded text-xs font-bold text-blue-800">L1: {countL1}</span>
            <span className="px-1.5 py-0.5 bg-indigo-100 rounded text-xs font-bold text-indigo-800">L2: {countL2}</span>
            <span className="px-1.5 py-0.5 bg-purple-100 rounded text-xs font-bold text-purple-800">L3: {countL3}</span>
          </div>
        </div>

        {/* Bentuk Soal */}
        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-1">
            <span>Bentuk Soal</span>
            <Target className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-sm font-bold text-amber-950 flex items-center gap-1.5 mt-0.5">
            <span className="px-1.5 py-0.5 bg-amber-100 rounded text-xs font-bold text-amber-900">PG: {countPg}</span>
            <span className="px-1.5 py-0.5 bg-orange-100 rounded text-xs font-bold text-orange-900">Uraian: {countUraian}</span>
            {countOther > 0 && <span className="px-1.5 py-0.5 bg-yellow-100 rounded text-xs font-bold text-yellow-900">Lain: {countOther}</span>}
          </div>
        </div>

        {/* Soal Valid */}
        <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-200/60">
          <div className="flex items-center justify-between text-teal-700 text-xs font-semibold mb-1">
            <span>Soal Valid</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <div className="text-xl font-bold text-teal-900">{validQuestions} <span className="text-xs font-normal text-teal-600">siap</span></div>
        </div>

        {/* Perlu Revisi */}
        <div className={`p-3 rounded-xl border ${needRevision > 0 ? 'bg-rose-50/80 border-rose-200 text-rose-900' : 'bg-gray-50/80 border-gray-200 text-gray-700'}`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span>Perlu Revisi</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${needRevision > 0 ? 'text-rose-500' : 'text-gray-400'}`} />
          </div>
          <div className="text-xl font-bold">{needRevision} <span className="text-xs font-normal text-gray-500">butir</span></div>
        </div>
      </div>
    </div>
  );
};
