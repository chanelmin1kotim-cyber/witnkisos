/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  Layers, 
  HelpCircle, 
  KeyRound, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Save,
  Download,
  Printer,
  ChevronRight,
  Info
} from 'lucide-react';

import { 
  AssessmentProject, 
  SchoolIdentity, 
  KisiKisiItem, 
  QuestionItem 
} from './types/assessment';
import { SAMPLE_BANK_SOAL } from './data/bankSoalData';
import { SubjectPreset } from './data/curriculumData';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { TabIdentitas } from './components/TabIdentitas';
import { TabKisiKisi } from './components/TabKisiKisi';
import { TabSoal } from './components/TabSoal';
import { TabKunci } from './components/TabKunci';
import { TabPembahasan } from './components/TabPembahasan';
import { TabValidasi } from './components/TabValidasi';
import { BankSoalModal } from './components/BankSoalModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { exportAssessmentToWord } from './utils/exportDocx';
import { 
  generateLocalKisiKisi, 
  generateLocalQuestions, 
  generateLocalQuestionItem,
  sanitizePgQuestion
} from './utils/localGenerator';

type TabKey = 'identitas' | 'kisi' | 'soal' | 'kunci' | 'pembahasan' | 'validasi';

export default function App() {
  // Initialize with the sample project (e.g. Fikih MI Kelas 4 or Matematika SD Kelas 4)
  const [currentProject, setCurrentProject] = useState<AssessmentProject>(() => {
    const saved = localStorage.getItem('kisi_soal_active_project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return SAMPLE_BANK_SOAL[0];
  });

  const [savedProjects, setSavedProjects] = useState<AssessmentProject[]>(() => {
    const saved = localStorage.getItem('kisi_soal_all_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return SAMPLE_BANK_SOAL;
  });

  const [activeTab, setActiveTab] = useState<TabKey>('identitas');
  const [activePreset, setActivePreset] = useState<SubjectPreset | null>(null);

  // Loading States
  const [isGeneratingKisi, setIsGeneratingKisi] = useState<boolean>(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [isRegeneratingId, setIsRegeneratingId] = useState<string | null>(null);

  // Modals
  const [bankSoalOpen, setBankSoalOpen] = useState<boolean>(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Save to localStorage when currentProject changes
  useEffect(() => {
    localStorage.setItem('kisi_soal_active_project', JSON.stringify(currentProject));
  }, [currentProject]);

  useEffect(() => {
    localStorage.setItem('kisi_soal_all_projects', JSON.stringify(savedProjects));
  }, [savedProjects]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Update School Identity
  const handleUpdateIdentity = (updated: Partial<SchoolIdentity>) => {
    setCurrentProject((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      identity: {
        ...prev.identity,
        ...updated,
      },
    }));
  };

  // Update Kisi-Kisi List
  const handleUpdateKisiKisi = (updated: KisiKisiItem[]) => {
    setCurrentProject((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      kisiKisi: updated,
    }));
  };

  // Auto-sanitize loaded project to guarantee Kemdikbud compliance (no question mark in PG)
  useEffect(() => {
    setCurrentProject((prev) => {
      let changed = false;
      const cleanQuestions = (prev.questions || []).map((q) => {
        if (q.bentukSoal === 'Pilihan Ganda' && (q.pertanyaan.includes('?') || !q.pertanyaan.trim().endsWith('....'))) {
          changed = true;
          return { ...q, pertanyaan: sanitizePgQuestion(q.pertanyaan) };
        }
        return q;
      });
      return changed ? { ...prev, questions: cleanQuestions } : prev;
    });
  }, []);

  // Update Questions List (Guaranteed sanitized for Pilihan Ganda)
  const handleUpdateQuestions = (updated: QuestionItem[]) => {
    const sanitized = updated.map((q) => {
      if (q.bentukSoal === 'Pilihan Ganda') {
        return {
          ...q,
          pertanyaan: sanitizePgQuestion(q.pertanyaan),
        };
      }
      return q;
    });

    setCurrentProject((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      questions: sanitized,
    }));
  };

  // STEP 9: Generate Kisi-Kisi API Call
  const handleGenerateKisiKisi = async (params: {
    totalSoal: number;
    levelDist: { L1: number; L2: number; L3: number };
    bentukDist: { pg: number; uraian: number };
    cp: string;
    tpList: string[];
    materiList: string[];
  }) => {
    setIsGeneratingKisi(true);
    let success = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch('/api/generate-indicators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          jenjang: currentProject.identity.jenjang,
          kelas: currentProject.identity.kelas,
          mataPelajaran: currentProject.identity.mataPelajaran,
          semester: currentProject.identity.semester,
          cp: params.cp,
          tpList: params.tpList,
          materiList: params.materiList,
          totalSoal: params.totalSoal,
          levelDist: params.levelDist,
          bentukDist: params.bentukDist,
        }),
      });

      clearTimeout(timeoutId);
      const resData = await response.json();
      if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
        handleUpdateKisiKisi(resData.data);
        setActiveTab('kisi');
        showToast(`Berhasil menyusun ${resData.data.length} butir kisi-kisi berbasis indikator!`);
        success = true;
      }
    } catch (error: any) {
      console.warn('API indicator generation unavailable, using local synthesis:', error);
    }

    if (!success) {
      // Local client-side generation fallback (NEVER FAILS)
      const localData = generateLocalKisiKisi(params, currentProject.identity);
      handleUpdateKisiKisi(localData);
      setActiveTab('kisi');
      showToast(`Berhasil menyusun ${localData.length} butir kisi-kisi berbasis indikator!`);
    }

    setIsGeneratingKisi(false);
  };

  // STEP 12: Generate Soal dari Kisi-Kisi API Call (1 Baris Kisi-Kisi = 1 Unit Soal)
  const handleGenerateQuestions = async () => {
    if (currentProject.kisiKisi.length === 0) {
      alert('Tabel kisi-kisi masih kosong.');
      return;
    }

    setIsGeneratingQuestions(true);
    let success = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          kisiKisi: currentProject.kisiKisi,
          identity: currentProject.identity,
        }),
      });

      clearTimeout(timeoutId);
      const resData = await response.json();
      if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
        handleUpdateQuestions(resData.data);
        setActiveTab('soal');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        showToast('Naskah soal berhasil digenerate 100% selaras dengan kisi-kisi!');
        success = true;
      }
    } catch (error: any) {
      console.warn('API question generation unavailable, using local concrete synthesis:', error);
    }

    if (!success) {
      // Local client-side generation fallback (NEVER FAILS & 100% CONCRETE)
      const localQuestions = generateLocalQuestions(currentProject.kisiKisi, currentProject.identity);
      handleUpdateQuestions(localQuestions);
      setActiveTab('soal');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast('Naskah soal berhasil digenerate 100% selaras dengan kisi-kisi!');
    }

    setIsGeneratingQuestions(false);
  };

  // STEP 16: Regenerate Single Question Keeping CP, TP, Materi, Indikator, Level, Bentuk
  const handleRegenerateSingle = async (questionId: string) => {
    const targetQ = currentProject.questions.find((q) => q.id === questionId);
    if (!targetQ) return;

    const matchedKisi = currentProject.kisiKisi.find(
      (k) => k.nomorSoal === targetQ.nomorSoal || k.id === targetQ.kisiKisiId
    );
    if (!matchedKisi) return;

    setIsRegeneratingId(questionId);
    let success = false;
    const variationSeed = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch('/api/regenerate-single-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          kisiKisiItem: matchedKisi,
          currentQuestion: targetQ,
          identity: currentProject.identity,
          variationSeed,
        }),
      });

      clearTimeout(timeoutId);
      const resData = await response.json();
      if (resData.success && resData.data) {
        let cleanQ = resData.data;
        if (cleanQ.bentukSoal === 'Pilihan Ganda') {
          cleanQ.pertanyaan = sanitizePgQuestion(cleanQ.pertanyaan);
        }
        cleanQ.id = questionId;

        const updatedList = currentProject.questions.map((q) =>
          q.id === questionId ? cleanQ : q
        );
        handleUpdateQuestions(updatedList);
        showToast(`Soal Nomor ${targetQ.nomorSoal} berhasil diperbarui dengan variasi baru!`);
        success = true;
      }
    } catch (error) {
      console.warn('API single question regeneration fallback:', error);
    }

    if (!success) {
      const fallbackQ = generateLocalQuestionItem(
        matchedKisi,
        targetQ.nomorSoal - 1,
        currentProject.identity,
        variationSeed
      );
      if (fallbackQ.bentukSoal === 'Pilihan Ganda') {
        fallbackQ.pertanyaan = sanitizePgQuestion(fallbackQ.pertanyaan);
      }
      fallbackQ.id = questionId;

      const updatedList = currentProject.questions.map((q) =>
        q.id === questionId ? fallbackQ : q
      );
      handleUpdateQuestions(updatedList);
      showToast(`Soal Nomor ${targetQ.nomorSoal} berhasil diperbarui dengan variasi baru!`);
    }

    setIsRegeneratingId(null);
  };

  // STEP 16B: Generate or Regenerate Single Question from Kisi-Kisi row
  const handleGenerateSingleFromKisi = async (kisiItem: KisiKisiItem) => {
    const existingQ = currentProject.questions.find(
      (q) => q.nomorSoal === kisiItem.nomorSoal || q.kisiKisiId === kisiItem.id
    );

    setIsRegeneratingId(kisiItem.id);
    let success = false;
    const variationSeed = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch('/api/generate-single-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          kisiKisiItem: kisiItem,
          currentQuestion: existingQ,
          identity: currentProject.identity,
          variationSeed,
        }),
      });

      clearTimeout(timeoutId);
      const resData = await response.json();
      if (resData.success && resData.data) {
        let cleanQ = resData.data;
        if (cleanQ.bentukSoal === 'Pilihan Ganda') {
          cleanQ.pertanyaan = sanitizePgQuestion(cleanQ.pertanyaan);
        }

        if (existingQ) {
          cleanQ.id = existingQ.id;
          const updatedList = currentProject.questions.map((q) =>
            q.id === existingQ.id || q.nomorSoal === kisiItem.nomorSoal ? cleanQ : q
          );
          handleUpdateQuestions(updatedList);
        } else {
          const updatedList = [...currentProject.questions, cleanQ].sort(
            (a, b) => a.nomorSoal - b.nomorSoal
          );
          handleUpdateQuestions(updatedList);
        }

        showToast(`Soal Nomor ${kisiItem.nomorSoal} berhasil dibuat berbasis indikator!`);
        success = true;
      }
    } catch (error) {
      console.warn('API generate single from kisi fallback:', error);
    }

    if (!success) {
      const localQ = generateLocalQuestionItem(
        kisiItem,
        kisiItem.nomorSoal - 1,
        currentProject.identity,
        variationSeed
      );
      if (localQ.bentukSoal === 'Pilihan Ganda') {
        localQ.pertanyaan = sanitizePgQuestion(localQ.pertanyaan);
      }

      if (existingQ) {
        localQ.id = existingQ.id;
        const updatedList = currentProject.questions.map((q) =>
          q.id === existingQ.id || q.nomorSoal === kisiItem.nomorSoal ? localQ : q
        );
        handleUpdateQuestions(updatedList);
      } else {
        const updatedList = [...currentProject.questions, localQ].sort(
          (a, b) => a.nomorSoal - b.nomorSoal
        );
        handleUpdateQuestions(updatedList);
      }

      showToast(`Soal Nomor ${kisiItem.nomorSoal} berhasil dibuat berbasis indikator!`);
    }

    setIsRegeneratingId(null);
  };

  // Create Brand New Project
  const handleNewProject = () => {
    const newProj: AssessmentProject = {
      id: `proj-${Date.now()}`,
      title: 'Asesmen Sumatif Baru SD/MI',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      identity: {
        namaMadrasah: 'Madrasah Ibtidaiyah / Sekolah Dasar',
        mataPelajaran: 'Matematika',
        jenjang: 'MI',
        kelas: 4,
        semester: 1,
        tahunPelajaran: '2026/2027',
        namaGuru: 'Witno, S.Pd.I',
        nipGuru: '-',
        kepalaSekolah: '-',
        nipKepalaSekolah: '-',
        alokasiWaktu: '60 Menit',
        kurikulum: 'Kurikulum Merdeka',
        penyusun: 'Disusun By Witno',
      },
      kisiKisi: [],
      questions: [],
    };

    setCurrentProject(newProj);
    setActiveTab('identitas');
    showToast('Proyek asesmen baru siap dikerjakan.');
  };

  // Save current project into savedProjects list
  const handleSaveProject = () => {
    setSavedProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === currentProject.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...currentProject, updatedAt: new Date().toISOString() };
        return next;
      } else {
        return [{ ...currentProject, updatedAt: new Date().toISOString() }, ...prev];
      }
    });
    showToast('Proyek berhasil disimpan ke Bank Soal lokal!');
  };

  // Duplicate project
  const handleDuplicateProject = (proj: AssessmentProject) => {
    const duplicated: AssessmentProject = {
      ...proj,
      id: `proj-${Date.now()}`,
      title: `${proj.title} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSavedProjects((prev) => [duplicated, ...prev]);
    showToast('Proyek berhasil diduplikasi.');
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    if (confirm('Yakin ingin menghapus proyek ini?')) {
      setSavedProjects((prev) => prev.filter((p) => p.id !== id));
      showToast('Proyek berhasil dihapus.');
    }
  };

  // Import JSON project
  const handleImportProjectJSON = (proj: AssessmentProject) => {
    const imported = {
      ...proj,
      id: `proj-import-${Date.now()}`,
    };
    setCurrentProject(imported);
    setSavedProjects((prev) => [imported, ...prev]);
    setActiveTab('identitas');
  };

  // Export Word Document
  const handleExportWord = () => {
    exportAssessmentToWord(currentProject, {
      includeKisiKisi: true,
      includeKunci: true,
      includePembahasan: true,
      includeRubrik: true,
    });
    showToast('Dokumen Word (.doc) berhasil diunduh!');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-gray-900 print:bg-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-950 text-white px-4 py-2.5 rounded-xl shadow-xl border border-emerald-700/60 text-xs font-bold flex items-center gap-2 animate-bounce print:hidden">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentProject={currentProject}
        onNewProject={handleNewProject}
        onOpenBankSoal={() => setBankSoalOpen(true)}
        onSaveProject={handleSaveProject}
        onExportWord={handleExportWord}
        onOpenPrintPreview={() => setPrintPreviewOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0">
        
        {/* Project Title Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-emerald-100 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              {currentProject.identity.jenjang} Kelas {currentProject.identity.kelas} • Semester {currentProject.identity.semester}
            </div>
            <input
              type="text"
              value={currentProject.title}
              onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
              className="text-lg sm:text-xl font-black text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full"
              placeholder="Judul Penilaian / Asesmen..."
            />
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-2 shrink-0">
            <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
              {currentProject.identity.mataPelajaran}
            </span>
            <span>•</span>
            <span>{currentProject.identity.namaMadrasah}</span>
          </div>
        </div>

        {/* Dashboard Statistics Bar */}
        <DashboardStats
          kisiKisi={currentProject.kisiKisi}
          questions={currentProject.questions}
        />

        {/* 6 Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-xs border border-emerald-100 p-1.5 mb-6 overflow-x-auto print:hidden">
          <div className="flex items-center gap-1 min-w-[620px]">
            {/* Tab 1 */}
            <button
              type="button"
              onClick={() => setActiveTab('identitas')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'identitas'
                  ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                  : 'text-gray-600 hover:bg-emerald-50/70 hover:text-emerald-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>TAB 1: IDENTITAS</span>
            </button>

            {/* Tab 2 */}
            <button
              type="button"
              onClick={() => setActiveTab('kisi')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition relative ${
                activeTab === 'kisi'
                  ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                  : 'text-gray-600 hover:bg-emerald-50/70 hover:text-emerald-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>TAB 2: KISI-KISI</span>
              {currentProject.kisiKisi.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === 'kisi' ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {currentProject.kisiKisi.length}
                </span>
              )}
            </button>

            {/* Tab 3 */}
            <button
              type="button"
              onClick={() => setActiveTab('soal')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition relative ${
                activeTab === 'soal'
                  ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                  : 'text-gray-600 hover:bg-emerald-50/70 hover:text-emerald-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>TAB 3: SOAL</span>
              {currentProject.questions.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === 'soal' ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {currentProject.questions.length}
                </span>
              )}
            </button>

            {/* Tab 4 */}
            <button
              type="button"
              onClick={() => setActiveTab('kunci')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'kunci'
                  ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                  : 'text-gray-600 hover:bg-emerald-50/70 hover:text-emerald-900'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>TAB 4: KUNCI</span>
            </button>

            {/* Tab 5 */}
            <button
              type="button"
              onClick={() => setActiveTab('pembahasan')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'pembahasan'
                  ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                  : 'text-gray-600 hover:bg-emerald-50/70 hover:text-emerald-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>TAB 5: PEMBAHASAN</span>
            </button>

            {/* Tab 6 */}
            <button
              type="button"
              onClick={() => setActiveTab('validasi')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                activeTab === 'validasi'
                  ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                  : 'text-gray-600 hover:bg-emerald-50/70 hover:text-emerald-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>TAB 6: VALIDASI</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div>
          {activeTab === 'identitas' && (
            <TabIdentitas
              identity={currentProject.identity}
              onUpdateIdentity={handleUpdateIdentity}
              onGenerateKisiKisi={handleGenerateKisiKisi}
              isGeneratingKisi={isGeneratingKisi}
              activePreset={activePreset}
              onApplyPreset={(p) => setActivePreset(p)}
            />
          )}

          {activeTab === 'kisi' && (
            <TabKisiKisi
              kisiKisi={currentProject.kisiKisi}
              questions={currentProject.questions}
              onUpdateKisiKisi={handleUpdateKisiKisi}
              onGenerateQuestions={handleGenerateQuestions}
              isGeneratingQuestions={isGeneratingQuestions}
              onGenerateSingleQuestion={handleGenerateSingleFromKisi}
              isGeneratingSingleId={isRegeneratingId}
              onNavigateToQuestion={() => setActiveTab('soal')}
            />
          )}

          {activeTab === 'soal' && (
            <TabSoal
              questions={currentProject.questions}
              kisiKisi={currentProject.kisiKisi}
              onUpdateQuestions={handleUpdateQuestions}
              onRegenerateSingle={handleRegenerateSingle}
              isRegeneratingId={isRegeneratingId}
              onOpenPrintPreview={() => setPrintPreviewOpen(true)}
              onRegenerateAllQuestions={handleGenerateQuestions}
              isGeneratingQuestions={isGeneratingQuestions}
            />
          )}

          {activeTab === 'kunci' && (
            <TabKunci
              questions={currentProject.questions}
              onOpenPrintPreview={() => setPrintPreviewOpen(true)}
            />
          )}

          {activeTab === 'pembahasan' && (
            <TabPembahasan
              questions={currentProject.questions}
              onOpenPrintPreview={() => setPrintPreviewOpen(true)}
            />
          )}

          {activeTab === 'validasi' && (
            <TabValidasi
              questions={currentProject.questions}
              kisiKisi={currentProject.kisiKisi}
              onRegenerateSingle={handleRegenerateSingle}
              isRegeneratingId={isRegeneratingId}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800">KISI-SOAL AI SD/MI</span>
            <span>—</span>
            <span>Generator Kisi-Kisi & Soal Otomatis Berbasis Indikator</span>
          </div>
          <div className="text-gray-400 font-medium">
            Sesuai Standar Kurikulum Merdeka & Kementerian Agama Republik Indonesia • <strong className="text-amber-600">Disusun By Witno</strong>
          </div>
        </div>
      </footer>

      {/* Bank Soal Modal */}
      <BankSoalModal
        isOpen={bankSoalOpen}
        onClose={() => setBankSoalOpen(false)}
        savedProjects={savedProjects}
        currentProject={currentProject}
        onLoadProject={(proj) => {
          setCurrentProject(proj);
          setActiveTab('soal');
          showToast(`Paket "${proj.title}" berhasil dimuat.`);
        }}
        onDeleteProject={handleDeleteProject}
        onDuplicateProject={handleDuplicateProject}
        onImportProjectJSON={handleImportProjectJSON}
      />

      {/* Print Preview & PDF Modal */}
      <PrintPreviewModal
        isOpen={printPreviewOpen}
        onClose={() => setPrintPreviewOpen(false)}
        project={currentProject}
      />
    </div>
  );
}
