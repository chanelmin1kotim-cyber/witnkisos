import { AssessmentProject } from '../types/assessment';

export interface ExportWordOptions {
  includeKunci: boolean;
  includePembahasan: boolean;
  includeRubrik: boolean;
  includeKisiKisi: boolean;
}

export function exportAssessmentToWord(
  project: AssessmentProject,
  options: ExportWordOptions = {
    includeKunci: true,
    includePembahasan: true,
    includeRubrik: true,
    includeKisiKisi: true,
  }
) {
  const { identity, kisiKisi, questions } = project;

  // Build HTML table for Kisi-Kisi
  let kisiKisiTableHtml = '';
  if (options.includeKisiKisi && kisiKisi.length > 0) {
    const rowsHtml = kisiKisi
      .map(
        (item) => `
      <tr>
        <td style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10pt;">${item.nomorSoal}</td>
        <td style="border: 1px solid #000; padding: 6px; font-size: 10pt;">${item.capaianPembelajaran}</td>
        <td style="border: 1px solid #000; padding: 6px; font-size: 10pt;">${item.tujuanPembelajaran}</td>
        <td style="border: 1px solid #000; padding: 6px; font-size: 10pt;">${item.materiAjar}</td>
        <td style="border: 1px solid #000; padding: 6px; font-size: 10pt;">${item.indikatorSoal}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10pt;">${item.level}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10pt;">${item.bentukSoal}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 10pt;">${item.nomorSoal}</td>
      </tr>
    `
      )
      .join('');

    kisiKisiTableHtml = `
      <h3 style="text-align: center; margin-top: 24pt; margin-bottom: 8pt; font-family: 'Times New Roman', serif;">KISI-KISI PENULISAN SOAL ASESMEN</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24pt; font-family: 'Times New Roman', serif;" border="1">
        <thead>
          <tr style="background-color: #f2f2f2; text-align: center; font-weight: bold;">
            <th style="border: 1px solid #000; padding: 6px; font-size: 10pt; width: 4%;">No.</th>
            <th style="border: 1px solid #000; padding: 6px; font-size: 10pt; width: 16%;">Capaian Pembelajaran</th>
            <th style="border: 1px solid #000; padding: 6px; font-size: 10pt; width: 18%;">Tujuan Pembelajaran</th>
            <th style="border: 1px solid #000; padding: 6px; font-size: 10pt; width: 14%;">Materi Ajar</th>
            <th style="border: 1px solid #000; padding: 6px; font-size: 10pt; width: 26%;">Indikator Soal</th>
            <th style="border: 1px solid #000; padding: 6px; font-size: 10pt; width: 6%;">Level</th>
            <th style="border: 1px solid #000; padding: 6px; font-size: 10pt; width: 10%;">Bentuk Soal</th>
            <th style="border: 1px solid #000; padding: 6px; font-size: 10pt; width: 6%;">Nomor Soal</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div style="page-break-after: always;"></div>
    `;
  }

  // Build Questions HTML
  const questionsHtml = questions
    .map((q) => {
      let optionsHtml = '';
      if (q.bentukSoal === 'Pilihan Ganda' && q.opsi && q.opsi.length > 0) {
        optionsHtml = `
          <table style="width: 100%; margin-top: 4pt; margin-bottom: 8pt; font-family: 'Times New Roman', serif; font-size: 11pt;">
            ${q.opsi
              .map(
                (op) => `
              <tr>
                <td style="width: 25px; vertical-align: top; font-weight: bold;">${op.label}.</td>
                <td style="vertical-align: top;">${op.text}</td>
              </tr>
            `
              )
              .join('')}
          </table>
        `;
      }

      return `
        <div style="margin-bottom: 14pt; font-family: 'Times New Roman', serif; font-size: 11pt; page-break-inside: avoid;">
          <table style="width: 100%;">
            <tr>
              <td style="width: 30px; vertical-align: top; font-weight: bold;">${q.nomorSoal}.</td>
              <td style="vertical-align: top;">
                ${q.stimulus ? `<p style="margin: 0 0 4pt 0; font-style: italic;">${q.stimulus}</p>` : ''}
                <p style="margin: 0 0 4pt 0;">${q.pertanyaan}</p>
                ${optionsHtml}
              </td>
            </tr>
          </table>
        </div>
      `;
    })
    .join('');

  // Build Answer Keys HTML
  let keysHtml = '';
  if (options.includeKunci && questions.length > 0) {
    const keyRows = questions
      .map(
        (q) => `
      <tr>
        <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">${q.nomorSoal}</td>
        <td style="border: 1px solid #000; padding: 4px 8px; text-align: center; font-weight: bold;">${q.kunciJawaban}</td>
        <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">${q.bentukSoal}</td>
        <td style="border: 1px solid #000; padding: 4px 8px; text-align: center;">${q.level}</td>
      </tr>
    `
      )
      .join('');

    keysHtml = `
      <div style="page-break-before: always;"></div>
      <h3 style="text-align: center; margin-top: 18pt; margin-bottom: 8pt; font-family: 'Times New Roman', serif;">KUNCI JAWABAN</h3>
      <table style="width: 60%; margin: 0 auto 20pt auto; border-collapse: collapse; font-family: 'Times New Roman', serif; font-size: 10pt;" border="1">
        <thead>
          <tr style="background-color: #f2f2f2; font-weight: bold;">
            <th style="border: 1px solid #000; padding: 5px;">Nomor Soal</th>
            <th style="border: 1px solid #000; padding: 5px;">Kunci Jawaban</th>
            <th style="border: 1px solid #000; padding: 5px;">Bentuk Soal</th>
            <th style="border: 1px solid #000; padding: 5px;">Level</th>
          </tr>
        </thead>
        <tbody>
          ${keyRows}
        </tbody>
      </table>
    `;
  }

  // Build Explanations & Rubrics HTML
  let pembahasanHtml = '';
  if (options.includePembahasan && questions.length > 0) {
    const items = questions
      .map((q) => {
        let rubrikContent = '';
        if (q.rubrikPenskoran && options.includeRubrik) {
          rubrikContent = `
            <div style="margin-top: 4pt; padding: 6pt; background-color: #fafafa; border: 1px solid #e0e0e0; font-size: 9.5pt;">
              <strong>Rubrik Penskoran:</strong>
              <ul style="margin: 3pt 0 0 16pt; padding: 0;">
                ${q.rubrikPenskoran.skor4 ? `<li><strong>Skor 4:</strong> ${q.rubrikPenskoran.skor4}</li>` : ''}
                ${q.rubrikPenskoran.skor3 ? `<li><strong>Skor 3:</strong> ${q.rubrikPenskoran.skor3}</li>` : ''}
                ${q.rubrikPenskoran.skor2 ? `<li><strong>Skor 2:</strong> ${q.rubrikPenskoran.skor2}</li>` : ''}
                ${q.rubrikPenskoran.skor1 ? `<li><strong>Skor 1:</strong> ${q.rubrikPenskoran.skor1}</li>` : ''}
                ${q.rubrikPenskoran.skor0 ? `<li><strong>Skor 0:</strong> ${q.rubrikPenskoran.skor0}</li>` : ''}
              </ul>
            </div>
          `;
        }

        return `
        <div style="margin-bottom: 12pt; page-break-inside: avoid; font-family: 'Times New Roman', serif;">
          <p style="margin: 0; font-size: 10.5pt;"><strong>Soal Nomor ${q.nomorSoal}</strong> (Kunci: ${q.kunciJawaban})</p>
          <p style="margin: 2pt 0 4pt 0; font-size: 10pt; color: #333;"><strong>Pembahasan:</strong> ${q.pembahasan}</p>
          ${rubrikContent}
        </div>
      `;
      })
      .join('');

    pembahasanHtml = `
      <div style="page-break-before: always;"></div>
      <h3 style="text-align: center; margin-top: 18pt; margin-bottom: 12pt; font-family: 'Times New Roman', serif;">PEMBAHASAN & PEDOMAN PENSKORAN</h3>
      ${items}
    `;
  }

  // Full Word Document HTML Template with XML Header
  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${project.title || 'Naskah Asesmen SD-MI'}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 21.0cm 29.7cm; /* A4 */
          margin: 2.0cm 2.0cm 2.0cm 2.0cm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 11pt;
          line-height: 1.3;
          color: #000;
        }
        p { margin: 0 0 6pt 0; }
        .kop-header {
          text-align: center;
          border-bottom: 3px double #000;
          padding-bottom: 8pt;
          margin-bottom: 14pt;
        }
        .kop-instansi {
          font-size: 13pt;
          font-weight: bold;
          margin: 0;
          text-transform: uppercase;
        }
        .kop-sekolah {
          font-size: 15pt;
          font-weight: bold;
          margin: 2pt 0;
          text-transform: uppercase;
        }
        .kop-alamat {
          font-size: 9pt;
          margin: 0;
          font-style: italic;
        }
        .info-table td {
          padding: 2pt 4pt;
          font-size: 10.5pt;
        }
      </style>
    </head>
    <body>
      <!-- KOP RESMI -->
      <div class="kop-header">
        <p class="kop-instansi">${identity.jenjang === 'MI' ? 'KEMENTERIAN AGAMA REPUBLIK INDONESIA' : 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}</p>
        <p class="kop-sekolah">${identity.namaMadrasah || 'MADRASAH IBTIDAIYAH / SEKOLAH DASAR'}</p>
        <p class="kop-alamat">Alamat: Jl. Pendidikan No. 01 | Tahun Ajaran: ${identity.tahunPelajaran} | Kurikulum: ${identity.kurikulum || 'Kurikulum Merdeka'}</p>
      </div>

      <!-- IDENTITAS UJIAN -->
      <table class="info-table" style="width: 100%; margin-bottom: 14pt; border: none;">
        <tr>
          <td style="width: 18%; font-weight: bold;">Mata Pelajaran</td>
          <td style="width: 32%;">: ${identity.mataPelajaran}</td>
          <td style="width: 18%; font-weight: bold;">Kelas / Semester</td>
          <td style="width: 32%;">: ${identity.jenjang} Kelas ${identity.kelas} / Semester ${identity.semester}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Tahun Pelajaran</td>
          <td>: ${identity.tahunPelajaran}</td>
          <td style="font-weight: bold;">Alokasi Waktu</td>
          <td>: ${identity.alokasiWaktu || '60 Menit'}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Guru Penyusun</td>
          <td>: ${identity.namaGuru || 'Guru Kelas'}</td>
          <td style="font-weight: bold;">Identitas Sistem</td>
          <td>: ${identity.penyusun || 'Disusun By Witno'}</td>
        </tr>
      </table>

      <!-- KISI-KISI SECTION -->
      ${kisiKisiTableHtml}

      <!-- NASKAH SOAL SECTION -->
      <div style="text-align: center; margin-top: 14pt; margin-bottom: 12pt;">
        <h3 style="margin: 0; font-size: 13pt; text-transform: uppercase;">NASKAH SOAL ASESMEN</h3>
        <p style="font-size: 9.5pt; margin-top: 2pt; font-style: italic;">Petunjuk: Bacalah setiap soal dengan teliti dan pilihlah atau tuliskan jawaban yang paling tepat!</p>
      </div>

      <div class="soal-container">
        ${questionsHtml}
      </div>

      <!-- LEMBAR TANDA TANGAN -->
      <table style="width: 100%; margin-top: 30pt; page-break-inside: avoid; text-align: center; font-size: 11pt;">
        <tr>
          <td style="width: 50%;">
            Mengetahui,<br/>
            Kepala Sekolah / Madrasah<br/><br/><br/><br/>
            <strong><u>${identity.kepalaSekolah || '...........................................'}</u></strong><br/>
            NIP. ${identity.nipKepalaSekolah || '...........................................'}
          </td>
          <td style="width: 50%;">
            Guru Mata Pelajaran<br/><br/><br/><br/><br/>
            <strong><u>${identity.namaGuru || '...........................................'}</u></strong><br/>
            NIP. ${identity.nipGuru || '...........................................'}
          </td>
        </tr>
      </table>

      <!-- KUNCI JAWABAN SECTION -->
      ${keysHtml}

      <!-- PEMBAHASAN SECTION -->
      ${pembahasanHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', docHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  const sanitizedTitle = (project.title || 'Asesmen_SD_MI')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, 40);
  downloadLink.href = url;
  downloadLink.download = `${sanitizedTitle}.doc`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
