import React, { useState } from 'react';
import { 
  X, 
  FolderOpen, 
  Download, 
  Upload, 
  Trash2, 
  Copy, 
  Calendar, 
  Check, 
  Building2, 
  BookOpen, 
  Sparkles,
  FileCode
} from 'lucide-react';
import { AssessmentProject } from '../types/assessment';
import { SAMPLE_BANK_SOAL } from '../data/bankSoalData';

interface BankSoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: AssessmentProject[];
  currentProject: AssessmentProject;
  onLoadProject: (proj: AssessmentProject) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (proj: AssessmentProject) => void;
  onImportProjectJSON: (proj: AssessmentProject) => void;
}

export const BankSoalModal: React.FC<BankSoalModalProps> = ({
  isOpen,
  onClose,
  savedProjects,
  currentProject,
  onLoadProject,
  onDeleteProject,
  onDuplicateProject,
  onImportProjectJSON,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'curated'>('saved');

  if (!isOpen) return null;

  // Handle Export Project JSON
  const handleExportJSON = (project: AssessmentProject) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title || 'Asesmen'}.kisisoal.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle Import Project JSON
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const obj = JSON.parse(event.target?.result as string);
        if (obj && obj.identity && Array.isArray(obj.kisiKisi)) {
          onImportProjectJSON(obj);
          alert('Proyek berhasil diimpor!');
        } else {
          alert('Format file JSON tidak sesuai dengan standar KISI-SOAL.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-emerald-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Bank Soal & Pengelola Proyek Asesmen SD/MI
              </h3>
              <p className="text-xs text-gray-500">
                Kelola paket soal yang tersimpan di perangkat atau jelajahi bank paket kurikulum siap pakai.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Import button */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'saved'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Proyek Tersimpan Anda ({savedProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('curated')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'curated'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bank Soal Resmi ({SAMPLE_BANK_SOAL.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Import File JSON
              <input type="file" accept=".json" onChange={handleFileInput} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => handleExportJSON(currentProject)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition"
              title="Backup Proyek Aktif Sekarang"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-gray-500" />
              Backup Proyek Aktif
            </button>
          </div>
        </div>

        {/* Project Lists Container */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'saved' ? (
            savedProjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">Belum ada proyek yang disimpan.</p>
                <p className="text-gray-400 mt-1">
                  Klik tombol <strong>"Simpan"</strong> di bilah atas untuk menyimpan asesmen Anda ke penyimpanan lokal.
                </p>
              </div>
            ) : (
              savedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    proj.id === currentProject.id
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                      : 'bg-white border-gray-200 hover:border-emerald-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900">{proj.title}</h4>
                      {proj.id === currentProject.id && (
                        <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                      <span>{proj.identity.namaMadrasah}</span>
                      <span>•</span>
                      <span>{proj.identity.jenjang} Kelas {proj.identity.kelas}</span>
                      <span>•</span>
                      <span>{proj.identity.mataPelajaran}</span>
                      <span>•</span>
                      <span>{proj.kisiKisi.length} Kisi-Kisi / {proj.questions.length} Soal</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadProject(proj);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition"
                    >
                      Buka
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateProject(proj)}
                      className="p-1.5 text-gray-500 hover:text-emerald-700 rounded-lg border border-gray-200"
                      title="Duplikasi Proyek"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportJSON(proj)}
                      className="p-1.5 text-gray-500 hover:text-blue-700 rounded-lg border border-gray-200"
                      title="Download JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {savedProjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg border border-gray-200"
                        title="Hapus Proyek"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            SAMPLE_BANK_SOAL.map((sample) => (
              <div
                key={sample.id}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-amber-100 text-amber-800">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">{sample.title}</h4>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                    <span>{sample.identity.jenjang} Kelas {sample.identity.kelas}</span>
                    <span>•</span>
                    <span>{sample.identity.mataPelajaran}</span>
                    <span>•</span>
                    <span>{sample.kisiKisi.length} Kisi-Kisi</span>
                    <span>•</span>
                    <span>{sample.questions.length} Butir Soal</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadProject(sample);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs"
                  >
                    Gunakan Paket Ini
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
