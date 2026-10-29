# 🚀 Panduan Lengkap Deploy & Hosting: KISI-SOAL AI SD/MI
> **Disusun By Witno**

Aplikasi **KISI-SOAL AI SD/MI** adalah aplikasi **Full-Stack** (Express.js backend + React 19 / Vite frontend). Karena memiliki backend Node.js untuk menangani proxy API Gemini AI secara aman, perakitan soal, dan ekspor dokumen, aplikasi ini membutuhkan hosting yang mendukung **Node.js Environment** atau **Docker**.

---

## 📋 Ringkasan Perintah & Spesifikasi

- **Runtime**: Node.js v20+ / Alpine
- **Build Command**: `npm run build` *(membangun file frontend `dist/` dan mengompilasi backend `server.js`)*
- **Start Command**: `npm start` *(menjalankan `node server.js`)*
- **Port Default**: `3000` (atau otomatis mengikuti variabel `process.env.PORT`)
- **Variabel Lingkungan (Environment Variables)**:
  - `NODE_ENV` = `production`
  - `PORT` = disesuaikan provider hosting (Render biasanya 10000, Railway/Cloud Run otomatis)
  - `GEMINI_API_KEY` = Kunci API dari Google AI Studio (Dapatkan di [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)).  
    *Catatan: Jika API key belum diisi atau habis kuotanya, aplikasi otomatis beralih ke mesin cerdas offline bawaan (offline fallback).*

---

## 🌟 Opsi 1: Render.com (Rekomendasi Terbaik & Gratis)

Render menyediakan paket gratis yang sangat cocok untuk aplikasi Node.js Full-Stack.

### Langkah-langkah:
1. **Push Proyek ke GitHub**:
   - Buat repositori baru di GitHub (misal: `kisi-soal-ai`).
   - Push seluruh file proyek ke repositori tersebut:
     ```bash
     git init
     git add .
     git commit -m "Initial commit KISI-SOAL AI SD/MI"
     git branch -M main
     git remote add origin https://github.com/USERNAME/kisi-soal-ai.git
     git push -u origin main
     ```
2. **Buka Render.com**:
   - Login / Daftar di [https://render.com](https://render.com).
   - Klik tombol **New +** lalu pilih **Web Service**.
   - Hubungkan akun GitHub Anda dan pilih repositori `kisi-soal-ai`.
3. **Pengaturan Konfigurasi**:
   - **Name**: `kisi-soal-ai` (atau nama pilihan Anda)
   - **Region**: Singapore (Southeast Asia) agar respon tercepat dari Indonesia
   - **Branch**: `main`
   - **Root Directory**: *(biarkan kosong)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. **Pengaturan Environment Variables**:
   - Gulir ke bagian **Environment Variables**, tambahkan:
     - Key: `NODE_ENV` | Value: `production`
     - Key: `GEMINI_API_KEY` | Value: `(masukkan API key Gemini Anda)`
5. **Deploy**:
   - Klik **Deploy Web Service**.
   - Tunggu proses build 1–2 menit hingga muncul status **Live**.
   - Anda akan mendapatkan URL HTTPS gratis (contoh: `https://kisi-soal-ai.onrender.com`).

---

## 🚂 Opsi 2: Railway.app (Sangat Cepat & Praktis)

1. Buka [https://railway.app](https://railway.app) dan login dengan GitHub.
2. Klik **New Project** → **Deploy from GitHub repo** → Pilih repositori Anda.
3. Railway akan otomatis mendeteksi `Dockerfile` atau `package.json`.
4. Masuk ke tab **Variables** di proyek Anda, tambahkan:
   - `GEMINI_API_KEY` = `(kunci API Anda)`
   - `NODE_ENV` = `production`
5. Masuk ke tab **Settings** → **Networking** → Klik **Generate Domain** untuk mendapatkan URL publik HTTPS.

---

## ☁️ Opsi 3: Google Cloud Run (Serverless Container)

Karena proyek sudah dilengkapi file `Dockerfile` multi-stage yang ringan, Anda dapat mendeploynya ke Google Cloud Run dengan satu perintah:

```bash
# Login ke Google Cloud CLI
gcloud auth login
gcloud config set project NAMA_PROJECT_GCP_ANDA

# Deploy container langsung dari direktori proyek
gcloud run deploy kisi-soal-ai \
  --source . \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="AIzaSy..."
```

---

## 🖥️ Opsi 4: VPS Ubuntu / Debian (Nginx + PM2)

Jika Anda memiliki VPS sendiri (seperti di DomaiNesia, Niagahoster, Biznet, IDCloudHost, AWS, atau DigitalOcean):

### 1. Install Node.js 20 & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm install -g pm2
```

### 2. Clone & Build Proyek
```bash
cd /var/www
sudo git clone https://github.com/USERNAME/kisi-soal-ai.git
cd kisi-soal-ai
sudo npm install
sudo npm run build
```

### 3. Buat File `.env`
```bash
sudo nano .env
```
Isi dengan:
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=kunci_gemini_anda_disini
```

### 4. Jalankan dengan PM2
```bash
pm2 start server.js --name "kisi-soal-ai"
pm2 save
pm2 startup
```

### 5. Konfigurasi Nginx Reverse Proxy
Edit file `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80;
    server_name domain-sekolah-anda.sch.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Muat ulang Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```
*(Opsional) Pasang SSL gratis Let's Encrypt:*
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d domain-sekolah-anda.sch.id
```

---

## 🔑 Cara Mendapatkan GEMINI_API_KEY Gratis

1. Kunjungi **[Google AI Studio](https://aistudio.google.com/)**.
2. Masuk menggunakan akun Google Anda.
3. Klik tombol **Get API key** di bilah navigasi kiri.
4. Klik **Create API key** di proyek Google Cloud yang dipilih / baru.
5. Salin string kunci yang berawalan `AIzaSy...`.
6. Tempelkan kunci tersebut ke Environment Variables di hosting Anda.

---

## 🛡️ Checklist Verifikasi Pasca-Deploy

- [x] Buka URL web di browser (desktop dan smartphone).
- [x] Cek apakah indikator koneksi di pojok kanan berstatus **AI Online** (hijau) atau **Engine Lokal** (oranye jika belum memasukkan key).
- [x] Lakukan uji coba:
  - Generate Kisi-Kisi otomatis.
  - Generate Soal dari kisi-kisi (perhatikan soal Pilihan Ganda tidak menggunakan tanda tanya dan berakhiran empat titik `....`).
  - Cek Tab Validasi (Pastikan 100% konsisten).
  - Ekspor ke Word (.docx) & PDF (Cetak).
