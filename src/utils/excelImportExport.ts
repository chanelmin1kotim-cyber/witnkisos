import { KisiKisiItem } from '../types/assessment';

export function exportKisiKisiToCSV(items: KisiKisiItem[], filename = 'kisi-kisi-sd-mi.csv') {
  const headers = [
    'No.',
    'Capaian Pembelajaran',
    'Tujuan Pembelajaran',
    'Materi Ajar',
    'Indikator Soal',
    'Level',
    'Bentuk Soal',
    'Nomor Soal'
  ];

  const rows = items.map((item) => [
    item.nomorSoal,
    `"${(item.capaianPembelajaran || '').replace(/"/g, '""')}"`,
    `"${(item.tujuanPembelajaran || '').replace(/"/g, '""')}"`,
    `"${(item.materiAjar || '').replace(/"/g, '""')}"`,
    `"${(item.indikatorSoal || '').replace(/"/g, '""')}"`,
    item.level,
    `"${item.bentukSoal}"`,
    item.nomorSoal
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSVToKisiKisi(csvText: string): Partial<KisiKisiItem>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  // Simple CSV parser supporting quoted cells
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const results: Partial<KisiKisiItem>[] = [];
  // Skip header if line 0 is header
  const startIndex = lines[0].toLowerCase().includes('capaian') || lines[0].toLowerCase().includes('indikator') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.length >= 5) {
      const nomor = parseInt(cells[0]) || (results.length + 1);
      const cp = cells[1] || '';
      const tp = cells[2] || '';
      const materi = cells[3] || '';
      const indikator = cells[4] || '';
      const level = (cells[5] as any) === 'L1' || (cells[5] as any) === 'L3' ? cells[5] as any : 'L2';
      const bentuk = (cells[6] as any) || 'Pilihan Ganda';

      results.push({
        id: `kisi-import-${Date.now()}-${nomor}`,
        nomorSoal: nomor,
        capaianPembelajaran: cp,
        tujuanPembelajaran: tp,
        materiAjar: materi,
        indikatorSoal: indikator,
        level,
        bentukSoal: bentuk,
      });
    }
  }

  return results;
}
