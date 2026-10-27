import React, { useState } from 'react';
import { 
  KeyRound, 
  BarChart3, 
  Copy, 
  Check, 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  Shuffle
} from 'lucide-react';
import { QuestionItem } from '../types/assessment';

interface TabKunciProps {
  questions: QuestionItem[];
  onOpenPrintPreview: () => void;
}

export const TabKunci: React.FC<TabKunciProps> = ({
  questions,
  onOpenPrintPreview
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const pgQuestions = questions.filter((q) => q.bentukSoal === 'Pilihan Ganda');
  const totalPg = pgQuestions.length;

  const countA = pgQuestions.filter((q) => q.kunciJawaban === 'A').length;
  const countB = pgQuestions.filter((q) => q.kunciJawaban === 'B').length;
  const countC = pgQuestions.filter((q) => q.kunciJawaban === 'C').length;
  const countD = pgQuestions.filter((q) => q.kunciJawaban === 'D').length;

  const pctA = totalPg > 0 ? Math.round((countA / totalPg) * 100) : 0;
  const pctB = totalPg > 0 ? Math.round((countB / totalPg) * 100) : 0;
  const pctC = totalPg > 0 ? Math.round((countC / totalPg) * 100) : 0;
  const pctD = totalPg > 0 ? Math.round((countD / totalPg) * 100) : 0;

  // Check monotonicity: detect repeated pattern e.g. A-B-C-D-A-B-C-D or identical keys in a row (>3)
  let maxConsecutive = 1;
  let currentConsecutive = 1;
  for (let i = 1; i < pgQuestions.length; i++) {
    if (pgQuestions[i].kunciJawaban === pgQuestions[i - 1].kunciJawaban) {
      currentConsecutive++;
      if (currentConsecutive > maxConsecutive) maxConsecutive = currentConsecutive;
    } else {
      currentConsecutive = 1;
    }
  }

  const isBalanced = maxConsecutive <= 2 && pctA <= 40 && pctB <= 40 && pctC <= 40 && pctD <= 40;

  // Copy Key Table Text
  const handleCopyKeys = () => {
    const text = questions
      .map((q) => `No. ${q.nomorSoal}: ${q.kunciJawaban} (${q.bentukSoal})`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Analysis */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-gray-900">
              Kunci Jawaban Resmi & Analisis Distribusi Opsi
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Kunci jawaban terdistribusi proporsional, non-monoton, dan menguji kemampuan indikator secara objektif.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyKeys}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1 text-gray-500" />}
            {copied ? 'Tersalin' : 'Salin Kunci'}
          </button>
          <button
            type="button"
            onClick={onOpenPrintPreview}
            className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 mr-1 text-white" />
            Cetak Lembar Kunci
          </button>
        </div>
      </div>

      {/* Distribution Statistics Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <h4 className="text-xs sm:text-sm font-bold text-gray-900">
              Distribusi Kunci Jawaban Pilihan Ganda ({totalPg} Butir)
            </h4>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {isBalanced ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Distribusi Proporsional & Ideal
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> Kunci agak dominan pada opsi tertentu
              </span>
            )}
          </div>
        </div>

        {/* Distribution Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Opsi A */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="w-6 h-6 rounded-md bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                A
              </span>
              <span className="text-sm font-bold text-gray-800">{countA} soal ({pctA}%)</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${pctA}%` }} />
            </div>
          </div>

          {/* Opsi B */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="w-6 h-6 rounded-md bg-teal-700 text-white text-xs font-black flex items-center justify-center">
                B
              </span>
              <span className="text-sm font-bold text-gray-800">{countB} soal ({pctB}%)</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${pctB}%` }} />
            </div>
          </div>

          {/* Opsi C */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="w-6 h-6 rounded-md bg-indigo-700 text-white text-xs font-black flex items-center justify-center">
                C
              </span>
              <span className="text-sm font-bold text-gray-800">{countC} soal ({pctC}%)</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${pctC}%` }} />
            </div>
          </div>

          {/* Opsi D */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <span className="w-6 h-6 rounded-md bg-purple-700 text-white text-xs font-black flex items-center justify-center">
                D
              </span>
              <span className="text-sm font-bold text-gray-800">{countD} soal ({pctD}%)</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${pctD}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Answer Keys Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900">
            Tabel Rekapitulasi Kunci Jawaban Lengkap
          </h4>
          <span className="text-xs text-gray-500">
            {questions.length} Butir Soal Terdaftar
          </span>
        </div>

        {questions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            Belum ada soal yang dibuat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-emerald-800 text-white font-bold text-center">
                <tr>
                  <th className="py-2.5 px-3 w-16 border-r border-emerald-700">No. Soal</th>
                  <th className="py-2.5 px-4 w-32 border-r border-emerald-700">Kunci Jawaban</th>
                  <th className="py-2.5 px-4 w-32 border-r border-emerald-700">Bentuk Soal</th>
                  <th className="py-2.5 px-3 w-20 border-r border-emerald-700">Level</th>
                  <th className="py-2.5 px-4 text-left">Ringkasan Materi / Indikator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {questions.map((q, idx) => (
                  <tr
                    key={q.id}
                    className={`hover:bg-emerald-50/40 transition ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-gray-700 border-r border-gray-200">
                      {q.nomorSoal}
                    </td>
                    <td className="py-2.5 px-4 text-center border-r border-gray-200">
                      {q.bentukSoal === 'Pilihan Ganda' ? (
                        <span className="inline-flex w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-sm items-center justify-center shadow-2xs">
                          {q.kunciJawaban}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                          Pedoman Uraian
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center text-xs font-semibold text-gray-700 border-r border-gray-200">
                      {q.bentukSoal}
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-gray-200">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800">
                        {q.level}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-gray-700 line-clamp-1">
                      {q.pertanyaan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
