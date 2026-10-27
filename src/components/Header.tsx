import React from 'react';
import { 
  FileText, 
  BookOpen, 
  Printer, 
  Download, 
  FolderOpen, 
  PlusCircle, 
  Save, 
  Sparkles,
  Award
} from 'lucide-react';
import { AssessmentProject } from '../types/assessment';

interface HeaderProps {
  currentProject: AssessmentProject;
  onNewProject: () => void;
  onOpenBankSoal: () => void;
  onSaveProject: () => void;
  onExportWord: () => void;
  onOpenPrintPreview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  onNewProject,
  onOpenBankSoal,
  onSaveProject,
  onExportWord,
  onOpenPrintPreview
}) => {
  return (
    <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-lg sticky top-0 z-40 border-b border-emerald-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 text-emerald-950 flex items-center justify-center shadow-md font-black text-xl shrink-0 ring-2 ring-amber-200/40">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  KISI-SOAL AI SD/MI
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  <Sparkles className="w-3 h-3 mr-1 inline" /> Merdeka & Kemenag
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium flex items-center gap-2">
                <span>Generator Kisi-Kisi & Soal Otomatis Berbasis Indikator</span>
                <span className="text-amber-300 font-semibold text-xs bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-600/50 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> Disusun By Witno
                </span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onNewProject}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-emerald-50 transition border border-emerald-600/60 shadow-sm"
              title="Buat Proyek Baru"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1 text-emerald-200" />
              Baru
            </button>

            <button
              onClick={onOpenBankSoal}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-emerald-50 transition border border-emerald-600/60 shadow-sm"
              title="Bank Soal & Proyek Tersimpan"
            >
              <FolderOpen className="w-3.5 h-3.5 mr-1 text-amber-300" />
              Bank Soal
            </button>

            <button
              onClick={onSaveProject}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-emerald-50 transition border border-emerald-600/60 shadow-sm"
              title="Simpan Proyek Sekarang"
            >
              <Save className="w-3.5 h-3.5 mr-1 text-emerald-200" />
              Simpan
            </button>

            <div className="h-5 w-px bg-emerald-600/60 mx-1 hidden sm:block" />

            <button
              onClick={onExportWord}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-emerald-950 transition shadow-md hover:shadow-amber-500/20"
              title="Export Dokumen Word (.doc) Lengkap dengan Kop & Tabel"
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-emerald-950" />
              Export Word
            </button>

            <button
              onClick={onOpenPrintPreview}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 text-white transition border border-white/20 shadow-sm"
              title="Cetak Naskah Ujian / Simpan PDF"
            >
              <Printer className="w-3.5 h-3.5 mr-1 text-white" />
              Cetak / PDF
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
