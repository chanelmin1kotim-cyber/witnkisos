export type Jenjang = 'SD' | 'MI';
export type CognitiveLevel = 'L1' | 'L2' | 'L3';
export type BentukSoal = 
  | 'Pilihan Ganda' 
  | 'Pilihan Ganda Kompleks' 
  | 'Benar/Salah' 
  | 'Menjodohkan' 
  | 'Isian' 
  | 'Uraian';

export interface SchoolIdentity {
  namaMadrasah: string;
  mataPelajaran: string;
  jenjang: Jenjang;
  kelas: number; // 1 - 6
  semester: 1 | 2;
  tahunPelajaran: string;
  namaGuru: string;
  nipGuru: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  alokasiWaktu: string;
  kurikulum: string;
  penyusun: string; // "Disusun By Witno"
}

export interface KisiKisiItem {
  id: string;
  nomorSoal: number;
  capaianPembelajaran: string;
  tujuanPembelajaran: string;
  materiAjar: string;
  indikatorSoal: string;
  level: CognitiveLevel;
  bentukSoal: BentukSoal;
}

export interface QuestionOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuestionItem {
  id: string;
  nomorSoal: number;
  kisiKisiId: string;
  stimulus?: string;
  pertanyaan: string;
  bentukSoal: BentukSoal;
  level: CognitiveLevel;
  opsi?: QuestionOption[]; // for PG
  kunciJawaban: string;
  opsiKompleks?: { label: string; text: string; benar: boolean }[]; // for PG Kompleks
  pasanganMenjodohkan?: { premis: string; respon: string }[]; // for Menjodohkan
  pembahasan: string;
  rubrikPenskoran?: {
    skor4?: string;
    skor3?: string;
    skor2?: string;
    skor1?: string;
    skor0?: string;
  };
  kesesuaianIndikator: 'Sangat Sesuai' | 'Sesuai' | 'Perlu Revisi' | 'Tidak Sesuai';
  kesesuaianPersen: number;
  catatanValidasi?: string;
}

export interface AssessmentProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  identity: SchoolIdentity;
  kisiKisi: KisiKisiItem[];
  questions: QuestionItem[];
}

export interface QualityCheckItem {
  id: string;
  title: string;
  passed: boolean;
  notes: string;
}
