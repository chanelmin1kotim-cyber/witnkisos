import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Check, 
  Layers, 
  KeyRound, 
  BookOpen 
} from 'lucide-react';
import { AssessmentProject } from '../types/assessment';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: AssessmentProject;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [includeKisiKisi, setIncludeKisiKisi] = useState<boolean>(true);
  const [includeKunci, setIncludeKunci] = useState<boolean>(true);
  const [includePembahasan, setIncludePembahasan] = useState<boolean>(true);

  if (!isOpen) return null;

  const { identity, kisiKisi, questions } = project;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:static print:bg-white">
      {/* Outer Modal Container */}
      <div className="bg-slate-100 rounded-2xl max-w-5xl w-full h-[95vh] shadow-2xl flex flex-col overflow-hidden print:h-auto print:max-w-none print:shadow-none print:rounded-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-white px-5 py-3.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Pratinjau Dokumen Naskah Asesmen SD/MI (Siap Cetak A4 / PDF)
              </h3>
              <p className="text-[11px] text-gray-500">
                Format resmi berstandar Kop Sekolah/Madrasah, margin A4 presisi, dan tata letak rapi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggles */}
            <div className="hidden sm:flex items-center gap-2.5 text-xs font-semibold text-gray-700">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeKisiKisi}
                  onChange={(e) => setIncludeKisiKisi(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Kisi-Kisi
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeKunci}
                  onChange={(e) => setIncludeKunci(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Kunci Jawaban
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePembahasan}
                  onChange={(e) => setIncludePembahasan(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Pembahasan
              </label>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/70 print:p-0 print:bg-white">
          {/* A4 Paper Simulator */}
          <div className="bg-white max-w-[210mm] w-full p-8 sm:p-12 shadow-md rounded-lg print:shadow-none print:p-0 print:max-w-none print:rounded-none text-black font-serif leading-normal">
            
            {/* KOP RESMI */}
            <div className="text-center border-b-4 border-double border-black pb-3 mb-5">
              <p className="text-sm font-bold uppercase tracking-wider mb-0.5">
                {identity.jenjang === 'MI' ? 'KEMENTERIAN AGAMA REPUBLIK INDONESIA' : 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
              </p>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-1">
                {identity.namaMadrasah || 'MADRASAH IBTIDAIYAH / SEKOLAH DASAR'}
              </h2>
              <p className="text-xs italic text-gray-800">
                Alamat: Jl. Pendidikan No. 01 | Tahun Ajaran: {identity.tahunPelajaran} | Kurikulum: {identity.kurikulum || 'Kurikulum Merdeka'}
              </p>
            </div>

            {/* IDENTITAS PENILAIAN */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:text-sm mb-6 border-b border-gray-300 pb-3 font-sans">
              <div className="flex">
                <span className="w-28 font-bold">Mata Pelajaran</span>
                <span>: {identity.mataPelajaran}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold">Kelas / Semester</span>
                <span>: {identity.jenjang} Kelas {identity.kelas} / Semester {identity.semester}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold">Tahun Pelajaran</span>
                <span>: {identity.tahunPelajaran}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold">Alokasi Waktu</span>
                <span>: {identity.alokasiWaktu || '60 Menit'}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold">Guru Pengampu</span>
                <span>: {identity.namaGuru || 'Guru Kelas'}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold">Sistem Generator</span>
                <span className="italic">: {identity.penyusun || 'Disusun By Witno'}</span>
              </div>
            </div>

            {/* SECTION 1: KISI-KISI (IF SELECTED) */}
            {includeKisiKisi && kisiKisi.length > 0 && (
              <div className="mb-8 print:break-after-page">
                <h4 className="text-center font-bold text-sm uppercase tracking-wide mb-3 underline">
                  KISI-KISI PENULISAN SOAL ASESMEN
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-black text-[10px] leading-tight font-sans">
                    <thead>
                      <tr className="bg-gray-100 text-center font-bold">
                        <th className="border border-black p-1.5 w-7">No.</th>
                        <th className="border border-black p-1.5 text-left">Capaian Pembelajaran</th>
                        <th className="border border-black p-1.5 text-left">Tujuan Pembelajaran</th>
                        <th className="border border-black p-1.5 text-left">Materi Ajar</th>
                        <th className="border border-black p-1.5 text-left">Indikator Soal</th>
                        <th className="border border-black p-1.5 w-10">Level</th>
                        <th className="border border-black p-1.5 w-16">Bentuk</th>
                        <th className="border border-black p-1.5 w-8">No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kisiKisi.map((k) => (
                        <tr key={k.id}>
                          <td className="border border-black p-1 text-center font-bold">{k.nomorSoal}</td>
                          <td className="border border-black p-1">{k.capaianPembelajaran}</td>
                          <td className="border border-black p-1">{k.tujuanPembelajaran}</td>
                          <td className="border border-black p-1 font-semibold">{k.materiAjar}</td>
                          <td className="border border-black p-1 leading-snug">{k.indikatorSoal}</td>
                          <td className="border border-black p-1 text-center font-bold">{k.level}</td>
                          <td className="border border-black p-1 text-center">{k.bentukSoal}</td>
                          <td className="border border-black p-1 text-center font-bold">{k.nomorSoal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 2: NASKAH SOAL */}
            <div className="mb-8">
              <div className="text-center mb-4">
                <h3 className="font-bold text-base uppercase tracking-wider">
                  LEMBAR SOAL ASESMEN
                </h3>
                <p className="text-xs italic text-gray-700">
                  Petunjuk: Bacalah setiap soal dengan saksama dan pilihlah atau jawablah dengan benar!
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                {questions.map((q) => (
                  <div key={q.id} className="flex gap-2 items-start print:break-inside-avoid">
                    <span className="font-bold w-6 shrink-0">{q.nomorSoal}.</span>
                    <div className="flex-1">
                      {q.stimulus && (
                        <p className="italic text-gray-800 mb-1 leading-relaxed">
                          {q.stimulus}
                        </p>
                      )}
                      <p className="font-semibold text-black mb-2 leading-relaxed">
                        {q.pertanyaan}
                      </p>

                      {/* Options */}
                      {q.bentukSoal === 'Pilihan Ganda' && q.opsi && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 pl-2 font-sans text-xs">
                          {q.opsi.map((op) => (
                            <div key={op.label} className="flex items-start gap-2">
                              <span className="font-bold">{op.label}.</span>
                              <span>{op.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tanda Tangan Pengesahan */}
              <div className="mt-12 pt-6 grid grid-cols-2 text-center text-xs font-sans print:break-inside-avoid">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala Sekolah / Madrasah</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{identity.kepalaSekolah || '...........................................'}</p>
                  <p>NIP. {identity.nipKepalaSekolah || '...........................................'}</p>
                </div>
                <div>
                  <p>Kota / Kabupaten, .........................</p>
                  <p className="font-bold">Guru Mata Pelajaran</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{identity.namaGuru || '...........................................'}</p>
                  <p>NIP. {identity.nipGuru || '...........................................'}</p>
                </div>
              </div>
            </div>

            {/* SECTION 3: KUNCI JAWABAN (IF SELECTED) */}
            {includeKunci && questions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-300 print:break-before-page">
                <h4 className="text-center font-bold text-sm uppercase tracking-wide mb-3 underline">
                  LEMBAR KUNCI JAWABAN
                </h4>
                <div className="max-w-md mx-auto">
                  <table className="w-full border-collapse border border-black text-xs font-sans">
                    <thead>
                      <tr className="bg-gray-100 text-center font-bold">
                        <th className="border border-black p-1.5 w-16">No. Soal</th>
                        <th className="border border-black p-1.5">Kunci Jawaban</th>
                        <th className="border border-black p-1.5">Bentuk Soal</th>
                        <th className="border border-black p-1.5">Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((q) => (
                        <tr key={q.id}>
                          <td className="border border-black p-1 text-center font-bold">{q.nomorSoal}</td>
                          <td className="border border-black p-1 text-center font-bold">{q.kunciJawaban}</td>
                          <td className="border border-black p-1 text-center">{q.bentukSoal}</td>
                          <td className="border border-black p-1 text-center">{q.level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECTION 4: PEMBAHASAN (IF SELECTED) */}
            {includePembahasan && questions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-300 print:break-before-page text-xs font-sans">
                <h4 className="text-center font-bold text-sm uppercase tracking-wide mb-4 underline">
                  PEMBAHASAN & PEDOMAN PENSKORAN
                </h4>
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div key={q.id} className="p-3 bg-gray-50 border border-gray-200 rounded print:border-none print:bg-white print:p-0">
                      <p className="font-bold text-gray-900 mb-1">
                        Soal Nomor {q.nomorSoal} (Kunci: {q.kunciJawaban})
                      </p>
                      <p className="text-gray-700 leading-relaxed mb-1.5">
                        <strong>Pembahasan:</strong> {q.pembahasan}
                      </p>
                      {q.rubrikPenskoran && (
                        <div className="text-[11px] text-gray-600 pl-3 border-l-2 border-gray-300 mt-1">
                          <strong>Rubrik Penskoran:</strong>
                          {q.rubrikPenskoran.skor4 && <p>• Skor 4: {q.rubrikPenskoran.skor4}</p>}
                          {q.rubrikPenskoran.skor3 && <p>• Skor 3: {q.rubrikPenskoran.skor3}</p>}
                          {q.rubrikPenskoran.skor2 && <p>• Skor 2: {q.rubrikPenskoran.skor2}</p>}
                          {q.rubrikPenskoran.skor1 && <p>• Skor 1: {q.rubrikPenskoran.skor1}</p>}
                          {q.rubrikPenskoran.skor0 && <p>• Skor 0: {q.rubrikPenskoran.skor0}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
