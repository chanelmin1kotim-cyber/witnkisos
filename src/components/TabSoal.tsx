import React, { useState } from 'react';
import { 
  RefreshCw, 
  Copy, 
  Edit3, 
  Check, 
  Shuffle, 
  Printer, 
  Sparkles, 
  Link2, 
  Layers, 
  BookOpen, 
  AlertCircle,
  HelpCircle,
  X,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { QuestionItem, KisiKisiItem, QuestionOption } from '../types/assessment';

interface TabSoalProps {
  questions: QuestionItem[];
  kisiKisi: KisiKisiItem[];
  onUpdateQuestions: (updated: QuestionItem[]) => void;
  onRegenerateSingle: (questionId: string) => Promise<void>;
  isRegeneratingId: string | null;
  onOpenPrintPreview: () => void;
  onRegenerateAllQuestions?: () => void;
  isGeneratingQuestions?: boolean;
}

export const TabSoal: React.FC<TabSoalProps> = ({
  questions,
  kisiKisi,
  onUpdateQuestions,
  onRegenerateSingle,
  isRegeneratingId,
  onOpenPrintPreview,
  onRegenerateAllQuestions,
  isGeneratingQuestions = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'L1' | 'L2' | 'L3'>('ALL');
  const [filterBentuk, setFilterBentuk] = useState<'ALL' | 'Pilihan Ganda' | 'Uraian'>('ALL');

  // Detect if any question has illogical/abstract options
  const hasAbstractOptions = questions.some((q) =>
    q.opsi?.some((op) =>
      /penerapan konsep|tindakan yang bertentangan|alternatif yang tidak|contoh yang kurang/i.test(op.text || '')
    )
  );

  // Copy single question to clipboard
  const handleCopyQuestion = (q: QuestionItem) => {
    let text = `${q.nomorSoal}. ${q.stimulus ? q.stimulus + '\n' : ''}${q.pertanyaan}\n`;
    if (q.opsi && q.opsi.length > 0) {
      q.opsi.forEach((op) => {
        text += `${op.label}. ${op.text}\n`;
      });
    }
    text += `\nKunci: ${q.kunciJawaban}\nPembahasan: ${q.pembahasan}\n`;

    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all questions to clipboard
  const handleCopyAll = () => {
    const fullText = questions
      .map((q) => {
        let t = `${q.nomorSoal}. ${q.stimulus ? q.stimulus + '\n' : ''}${q.pertanyaan}\n`;
        if (q.opsi) {
          q.opsi.forEach((op) => {
            t += `${op.label}. ${op.text}\n`;
          });
        }
        return t;
      })
      .join('\n\n');

    navigator.clipboard.writeText(fullText);
    alert('Seluruh naskah soal berhasil disalin ke clipboard!');
  };

  // Randomize options for all multiple choice questions
  const handleRandomizeOptions = () => {
    const updated = questions.map((q) => {
      if (q.bentukSoal !== 'Pilihan Ganda' || !q.opsi || q.opsi.length < 2) return q;

      // Find the correct text before shuffling
      const correctOption = q.opsi.find((o) => o.label === q.kunciJawaban);
      const correctText = correctOption ? correctOption.text : q.opsi[0].text;

      // Shuffle options text
      const shuffledTexts = [...q.opsi.map((o) => o.text)].sort(() => Math.random() - 0.5);

      const labels: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
      const newOpsi: QuestionOption[] = shuffledTexts.map((txt, idx) => ({
        label: labels[idx],
        text: txt,
      }));

      // Find new key label
      const newKeyOption = newOpsi.find((o) => o.text === correctText);
      const newKey = newKeyOption ? newKeyOption.label : 'A';

      return {
        ...q,
        opsi: newOpsi,
        kunciJawaban: newKey,
      };
    });

    onUpdateQuestions(updated);
    alert('Opsi pilihan ganda dan kunci jawaban berhasil diacak secara proporsional!');
  };

  // Save manual edit on question
  const handleSaveEditQuestion = () => {
    if (!editingQuestion) return;
    const updated = questions.map((q) => (q.id === editingQuestion.id ? editingQuestion : q));
    onUpdateQuestions(updated);
    setEditingQuestion(null);
  };

  // Filtered view
  const filteredQuestions = questions.filter((q) => {
    if (filterLevel !== 'ALL' && q.level !== filterLevel) return false;
    if (filterBentuk !== 'ALL' && q.bentukSoal !== filterBentuk) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-base font-bold text-gray-900">
              Naskah Soal Asesmen SD/MI (Sistem Traceability Aktif)
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Setiap butir soal memiliki trace badge langsung ke baris dan indikator kisi-kisi asalnya.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sempurnakan Opsi Button */}
          {onRegenerateAllQuestions && (
            <button
              type="button"
              onClick={onRegenerateAllQuestions}
              disabled={isGeneratingQuestions}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 transition shadow-sm disabled:opacity-50"
              title="Sempurnakan seluruh opsi jawaban agar 100% konkret, logis, dan ramah anak SD/MI"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-950" />
              {isGeneratingQuestions ? 'Menyempurnakan...' : 'Sempurnakan Opsi (Logis SD/MI)'}
            </button>
          )}

          {/* Randomize Options Button */}
          <button
            type="button"
            onClick={handleRandomizeOptions}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition shadow-sm"
            title="Acak Opsi Pilihan Ganda & Perbarui Kunci Otomatis"
          >
            <Shuffle className="w-3.5 h-3.5 mr-1 text-purple-600" />
            Acak Opsi
          </button>

          {/* Copy All */}
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition"
            title="Salin Naskah Lengkap"
          >
            <Copy className="w-3.5 h-3.5 mr-1 text-gray-500" />
            Salin Semua
          </button>

          {/* Print Preview */}
          <button
            type="button"
            onClick={onOpenPrintPreview}
            className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
            title="Lihat Pratinjau Naskah Cetak"
          >
            <Printer className="w-3.5 h-3.5 mr-1 text-white" />
            Pratinjau Cetak
          </button>
        </div>
      </div>

      {/* Warning Alert if Abstract Options Detected */}
      {hasAbstractOptions && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-900">Perhatian: Terdeteksi Opsi Jawaban Bersifat Abstrak / Belum Logis untuk Anak SD/MI</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Klik tombol di samping untuk menyempurnakan otomatis seluruh opsi menjadi konkret (angka, istilah nyata, atau frasa langsung).
              </p>
            </div>
          </div>
          {onRegenerateAllQuestions && (
            <button
              type="button"
              onClick={onRegenerateAllQuestions}
              disabled={isGeneratingQuestions}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sempurnakan Sekarang
            </button>
          )}
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-200/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Filter Level:</span>
          {(['ALL', 'L1', 'L2', 'L3'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filterLevel === lvl
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {lvl === 'ALL' ? 'Semua Level' : lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Filter Bentuk:</span>
          {(['ALL', 'Pilihan Ganda', 'Uraian'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setFilterBentuk(b)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filterBentuk === b
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {b === 'ALL' ? 'Semua Bentuk' : b}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 text-gray-500">
          <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h4 className="font-bold text-gray-800 text-base">Belum Ada Naskah Soal</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Buka <strong>Tab Kisi-Kisi</strong> dan klik tombol{' '}
            <span className="text-emerald-700 font-bold">GENERATE SOAL DARI KISI-KISI</span> untuk mulai merumuskan soal berbasis indikator.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const matchedKisi = kisiKisi.find((k) => k.nomorSoal === q.nomorSoal || k.id === q.kisiKisiId);

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl shadow-xs border border-emerald-100 overflow-hidden transition hover:shadow-md"
              >
                {/* Traceability Header Bar */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white px-4 py-2.5 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {q.nomorSoal}
                    </span>
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                      Trace: Baris Kisi-Kisi #{matchedKisi?.nomorSoal || q.nomorSoal}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        q.level === 'L1'
                          ? 'bg-blue-100 text-blue-800'
                          : q.level === 'L2'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {q.level}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px] font-semibold">
                      {q.bentukSoal}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Regenerate Button */}
                    <button
                      type="button"
                      onClick={() => onRegenerateSingle(q.id)}
                      disabled={isRegeneratingId === q.id}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition shadow-2xs disabled:opacity-50"
                      title="Regenerate stimulus & redaksi baru dengan mempertahankan indikator"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 text-amber-700 ${isRegeneratingId === q.id ? 'animate-spin' : ''}`} />
                      {isRegeneratingId === q.id ? 'Regenerating...' : 'Regenerate'}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(q)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition"
                      title="Edit Soal & Opsi"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyQuestion(q)}
                      className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition"
                      title="Salin Butir Soal"
                    >
                      {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Sub-bar: Indikator yang diukur */}
                {matchedKisi && (
                  <div className="px-4 py-1.5 bg-amber-50/60 border-b border-amber-100 text-[11px] text-amber-900 font-medium flex items-start gap-1.5">
                    <span className="font-bold text-amber-950 shrink-0">Indikator Kisi-Kisi:</span>
                    <span>{matchedKisi.indikatorSoal}</span>
                  </div>
                )}

                {/* Question Body */}
                <div className="p-4 sm:p-5 text-gray-900">
                  {/* Stimulus */}
                  {q.stimulus && (
                    <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                      {q.stimulus}
                    </div>
                  )}

                  {/* Pertanyaan */}
                  <p className="text-sm sm:text-base font-semibold leading-relaxed mb-4 text-gray-900">
                    {q.pertanyaan}
                  </p>

                  {/* Multiple Choice Options */}
                  {q.bentukSoal === 'Pilihan Ganda' && q.opsi && (
                    <div className="space-y-2 mb-4">
                      {q.opsi.map((op) => {
                        const isCorrect = op.label === q.kunciJawaban;
                        return (
                          <div
                            key={op.label}
                            className={`flex items-start gap-3 p-2.5 rounded-xl border transition ${
                              isCorrect
                                ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/40 text-emerald-950'
                                : 'bg-gray-50/60 border-gray-200/80 text-gray-800'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'bg-white text-gray-700 border border-gray-300'
                              }`}
                            >
                              {op.label}
                            </span>
                            <span className="text-xs sm:text-sm leading-relaxed">{op.text}</span>
                            {isCorrect && (
                              <span className="ml-auto text-[11px] font-bold text-emerald-700 flex items-center gap-1 shrink-0 bg-emerald-100 px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Kunci
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Essay rubric summary */}
                  {q.bentukSoal === 'Uraian' && (
                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 mb-3 text-xs">
                      <div className="font-bold text-amber-900 mb-1">Pedoman Kunci Jawaban:</div>
                      <div className="whitespace-pre-line text-amber-950">{q.kunciJawaban}</div>
                    </div>
                  )}

                  {/* Pembahasan Preview */}
                  <div className="pt-3 border-t border-gray-100 text-xs text-gray-600">
                    <strong className="text-emerald-900">Pembahasan:</strong> {q.pembahasan}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                Edit Naskah Soal Nomor {editingQuestion.nomorSoal}
              </h4>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Stimulus / Teks Pengantar (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={editingQuestion.stimulus || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, stimulus: e.target.value })}
                  placeholder="Cerita, ilustrasi, teks bacaan..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Kalimat Pertanyaan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.pertanyaan}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, pertanyaan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-semibold text-xs sm:text-sm"
                />
              </div>

              {/* Options for PG */}
              {editingQuestion.bentukSoal === 'Pilihan Ganda' && editingQuestion.opsi && (
                <div className="space-y-2">
                  <label className="block font-bold text-gray-700">
                    Opsi Pilihan Jawaban & Kunci
                  </label>
                  {editingQuestion.opsi.map((op, i) => (
                    <div key={op.label} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center shrink-0">
                        {op.label}
                      </span>
                      <input
                        type="text"
                        value={op.text}
                        onChange={(e) => {
                          const updatedOpsi = [...(editingQuestion.opsi || [])];
                          updatedOpsi[i].text = e.target.value;
                          setEditingQuestion({ ...editingQuestion, opsi: updatedOpsi });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 text-xs"
                      />
                      <label className="flex items-center gap-1 text-xs font-bold text-emerald-900 cursor-pointer">
                        <input
                          type="radio"
                          name="kunciJawabanRadio"
                          checked={editingQuestion.kunciJawaban === op.label}
                          onChange={() => setEditingQuestion({ ...editingQuestion, kunciJawaban: op.label })}
                          className="accent-emerald-600"
                        />
                        Kunci
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Uraian Key */}
              {editingQuestion.bentukSoal === 'Uraian' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Kunci / Pedoman Jawaban Uraian
                  </label>
                  <textarea
                    rows={3}
                    value={editingQuestion.kunciJawaban}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, kunciJawaban: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Pembahasan Jawaban
                </label>
                <textarea
                  rows={2}
                  value={editingQuestion.pembahasan}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, pembahasan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEditQuestion}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
