import React, { useState } from 'react';
import { 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  Award, 
  Copy, 
  Check, 
  Printer, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';
import { QuestionItem } from '../types/assessment';

interface TabPembahasanProps {
  questions: QuestionItem[];
  onOpenPrintPreview: () => void;
}

export const TabPembahasan: React.FC<TabPembahasanProps> = ({
  questions,
  onOpenPrintPreview
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySingle = (q: QuestionItem) => {
    let t = `Pembahasan Soal Nomor ${q.nomorSoal} (Kunci: ${q.kunciJawaban}):\n${q.pembahasan}\n`;
    if (q.rubrikPenskoran) {
      t += `\nRubrik Penskoran:\n- Skor 4: ${q.rubrikPenskoran.skor4}\n- Skor 3: ${q.rubrikPenskoran.skor3}\n- Skor 2: ${q.rubrikPenskoran.skor2}\n- Skor 1: ${q.rubrikPenskoran.skor1}\n- Skor 0: ${q.rubrikPenskoran.skor0}\n`;
    }
    navigator.clipboard.writeText(t);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-gray-900">
              Pembahasan Edukatif & Rubrik Penskoran Bertingkat
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Dirancang dengan bahasa ramah anak, menjelaskan proses mendapatkan jawaban secara runut dan logis.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPrintPreview}
          className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 mr-1 text-white" />
          Cetak Pembahasan
        </button>
      </div>

      {/* Items List */}
      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 text-gray-500 text-xs">
          Belum ada data pembahasan soal.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl shadow-xs border border-emerald-100 p-4 sm:p-5 transition hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
                    {q.nomorSoal}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-gray-900 mr-2">
                      Soal Nomor {q.nomorSoal}
                    </span>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Kunci: {q.kunciJawaban}
                    </span>
                    <span className="ml-2 text-[11px] text-gray-500">
                      ({q.bentukSoal} — Level {q.level})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopySingle(q)}
                  className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-gray-200 transition text-xs flex items-center gap-1"
                  title="Salin Pembahasan"
                >
                  {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copiedId === q.id ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>

              {/* Soal Ringkas */}
              <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                {q.pertanyaan}
              </p>

              {/* Pembahasan Box */}
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 leading-relaxed mb-3">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Alur Berpikir & Pembahasan:
                </div>
                {q.pembahasan}
              </div>

              {/* Rubrik Penskoran jika Uraian */}
              {q.rubrikPenskoran && (
                <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-2">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Rubrik Penskoran Uraian (Skor Maksimal = 4):
                  </div>
                  <div className="space-y-1.5 text-gray-800">
                    {q.rubrikPenskoran.skor4 && (
                      <div className="flex items-start gap-2">
                        <span className="w-14 font-bold text-emerald-800 shrink-0">Skor 4:</span>
                        <span>{q.rubrikPenskoran.skor4}</span>
                      </div>
                    )}
                    {q.rubrikPenskoran.skor3 && (
                      <div className="flex items-start gap-2">
                        <span className="w-14 font-bold text-teal-800 shrink-0">Skor 3:</span>
                        <span>{q.rubrikPenskoran.skor3}</span>
                      </div>
                    )}
                    {q.rubrikPenskoran.skor2 && (
                      <div className="flex items-start gap-2">
                        <span className="w-14 font-bold text-amber-800 shrink-0">Skor 2:</span>
                        <span>{q.rubrikPenskoran.skor2}</span>
                      </div>
                    )}
                    {q.rubrikPenskoran.skor1 && (
                      <div className="flex items-start gap-2">
                        <span className="w-14 font-bold text-orange-800 shrink-0">Skor 1:</span>
                        <span>{q.rubrikPenskoran.skor1}</span>
                      </div>
                    )}
                    {q.rubrikPenskoran.skor0 && (
                      <div className="flex items-start gap-2">
                        <span className="w-14 font-bold text-rose-800 shrink-0">Skor 0:</span>
                        <span>{q.rubrikPenskoran.skor0}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
