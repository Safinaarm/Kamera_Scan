# QRAbsen - Sistem Absensi Digital Berbasis QR Code
Link Deploy: https://safinaarm.github.io/Kamera_Scan/

Sistem absensi modern yang menggunakan teknologi QR Code untuk proses presensi mahasiswa yang cepat, aman, dan terintegrasi dengan sistem akademik cloud.

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Lisensi](https://img.shields.io/badge/Lisensi-MIT-blue)
![Versi](https://img.shields.io/badge/Versi-1.0.0-blue)

---

## 📋 Daftar Isi

- [Tentang Sistem](#tentang-sistem)
- [Fitur Utama](#fitur-utama)
- [Instalasi](#instalasi)
- [Penggunaan](#penggunaan)
- [Arsitektur Sistem](#arsitektur-sistem)
- [API & Integrasi](#api--integrasi)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Panduan Pengembang](#panduan-pengembang)
- [Troubleshooting](#troubleshooting)
- [Lisensi](#lisensi)

---

## 📖 Tentang Sistem

**QRAbsen** adalah solusi absensi digital yang dirancang untuk institusi pendidikan. Sistem ini terdiri dari dua komponen utama yang bekerja sebagai satu kesatuan:

### 🔗 Dua Repository yang Terintegrasi:

1. **Kamera_Scan** (Repository ini)
   - Interface frontend untuk pemindaian QR Code
   - Digunakan oleh mahasiswa untuk melakukan check-in
   - Terhubung langsung dengan camera device

2. **[Absen_Cloud_Kel5](https://github.com/Safinaarm/absen_cloud_kel5.git)**
   - Backend sistem manajemen absensi
   - Penyimpanan data di Google Apps Script & Google Sheets
   - Generator QR Code 
   

> ⚠️ **Catatan Penting**: Kedua repository ini harus diinstall dan dikonfigurasi bersama-sama untuk sistem bekerja dengan optimal.

---

## ✨ Fitur Utama

### Untuk Mahasiswa (Kamera_Scan):
- ✅ Antarmuka user-friendly yang responsif
- ✅ Pemindaian QR Code real-time menggunakan kamera device
- ✅ Validasi input nama/NIM sebelum scan
- ✅ Indikator progress 3 tahap (step indicator)
- ✅ Konfirmasi keberhasilan absensi dengan detail
- ✅ Tombol retry jika terjadi error
- ✅ Dukungan untuk mobile dan tablet

### Untuk Admin & Dosen (Absen_Cloud_Kel5):
- 🔑 Generator QR Code dengan parameter akademik
- 📈 Laporan kehadiran per mata kuliah
- 💾 Penyimpanan data laporan kehadiran di Google Sheets

---

## 🚀 Instalasi

### Prasyarat
- Browser modern (Chrome, Firefox, Safari, Edge) dengan dukungan:
  - WebRTC & MediaDevices API
  - Akses kamera (permissions)
  - JavaScript ES6+
- Koneksi internet yang stabil
- Mobile phone atau perangkat dengan kamera

### Langkah 1: Clone Repository Kamera_Scan

```bash
git clone https://github.com/Safinaarm/Kamera_Scan.git
cd Kamera_Scan
```

### Langkah 2: Setup Backend (Absen_Cloud_Kel5)

```bash
git clone https://github.com/Safinaarm/absen_cloud_kel5.git
cd absen_cloud_kel5
# Ikuti petunjuk instalasi di repository tersebut
```

### Langkah 3: Konfigurasi URL Backend

Edit file `script.js` pada repository Kamera_Scan:

```javascript
// Baris 1 - Sesuaikan dengan URL Google Apps Script Anda
const BASE_WEBAPP_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

Dapatkan `YOUR_DEPLOYMENT_ID` dari:
1. Buka Google Apps Script project di repository Absen_Cloud_Kel5
2. Deploy → Deploy as web app
3. Salin URL atau ID dari deployment

### Langkah 4: Deploy Ke Server (Opsional)

Untuk production, upload folder Kamera_Scan ke web server:
- Gunakan FTP/SFTP ke hosting Anda
- Atau deploy ke Vercel, Netlify, GitHub Pages
- Pastikan HTTPS diaktifkan untuk akses kamera

### Langkah 5: Testing Lokal

Buka file `index.html` langsung di browser atau gunakan local server:

```bash
# Menggunakan Python
python -m http.server 8000

# Atau gunakan Node.js + http-server
npx http-server
```

Kemudian akses: `http://localhost:8000`

---

## 📱 Penggunaan

### Alur Penggunaan untuk Mahasiswa:

#### **Tahap 1: Input Identitas**
1. Buka aplikasi Kamera_Scan
2. Masukkan Nama atau NIM Anda
3. Klik tombol "Lanjut ke Scan QR"

**Validasi:**
- Nama/NIM tidak boleh kosong
- Karakter alfanumerik dan simbol umum diterima

#### **Tahap 2: Pemindaian QR Code**
1. Izinkan akses kamera ketika diminta browser
2. Arahkan kamera ke QR Code yang ditampilkan oleh dosen
3. Posisikan QR Code di dalam scan box yang ditunjukkan
4. Tunggu hingga QR Code terdeteksi (auto-scan, tidak perlu klik)

**Tips Scanning:**
- Pastikan pencahayaan cukup terang
- Jangan terlalu dekat atau terlalu jauh dari QR Code
- QR Code harus berada di dalam area scan box
- Tunggu hingga pesan "QR terdeteksi" muncul

#### **Tahap 3: Konfirmasi Keberhasilan**
1. Sistem akan menampilkan detail absensi:
   - Nama/NIM Anda
   - Mata Kuliah
   - Sesi/Waktu
   - ID Absen (unique ID)
2. Klik "Kembali ke Awal" untuk melakukan absensi berikutnya

### Alur Penggunaan untuk Dosen (di Absen_Cloud_Kel5):
- Buka dashboard admin
- Generate QR Code untuk mata kuliah & sesi tertentu
- Tampilkan QR Code di layar/proyektor
- Monitor mahasiswa yang sudah melakukan check-in

---

## 🏗️ Arsitektur Sistem

### Diagram Alir Sistem:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT SIDE                          │
│                  (Kamera_Scan)                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Page 1: Input Nama/NIM (HTML Form)                     │
│     │                                                   │
│     ▼                                                   │
│  Page 2: Pemindaian QR (ZXing Library)                  │
│     │                                                   │
│     └─ Scan QR → Extract Parameters                     │
│         (qr_token, course_id, session_id)               │
│     │                                                   │
│     ▼                                                   │
│  Fetch API → POST to Google Apps Script                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
              │
              │ JSON Request
              │ {user_id, device_id, course_id, 
              │  session_id, qr_token, ts}
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│                   SERVER SIDE                           │
│               (Absen_Cloud_Kel5)                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Google Apps Script Webhook                             │
│  ├─ Validasi QR Token                                   │
│  ├─ Simpan ke Google Sheets                             │
│  └─ Return {ok: true, presence_id: "xxx"}               │
│                                                         │
└─────────────────────────────────────────────────────────┘
              │
              │ JSON Response
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│                 CLIENT SIDE                             │
│              (Kamera_Scan)                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Page 3: Konfirmasi Keberhasilan                        │
│  └─ Tampilkan hasil absensi                             │
│     • Nama/NIM                                          │
│     • Mata Kuliah                                       │
│     • Sesi                                              │
│     • ID Absen (dari server)                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Struktur File Kamera_Scan:

```
Kamera_Scan/
├── index.html          # Struktur HTML aplikasi
├── script.js           # Logika JavaScript
├── styles.css          # Styling CSS
└── README.md           # Dokumentasi (file ini)
```

---

## 🔌 API & Integrasi

### Endpoint Google Apps Script

**URL**: `https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec`

#### Check-in (Absensi)

**Request:**
```http
POST /exec?action=checkin
Content-Type: text/plain;charset=UTF-8

{
  "user_id": "Budi Santoso / 21001",
  "device_id": "Mozilla/5.0... (User Agent)",
  "course_id": "TIF-101",
  "session_id": "2024-01-15-08:00",
  "qr_token": "abc123def456...",
  "ts": "2024-01-15T08:15:30.000Z"
}
```

**Response (Sukses):**
```json
{
  "ok": true,
  "data": {
    "presence_id": "PRE-20240115-001",
    "timestamp": "2024-01-15T08:15:30Z",
    "message": "Absensi berhasil dicatat"
  }
}
```

**Response (Gagal):**
```json
{
  "ok": false,
  "error": "QR Token tidak valid",
  "message": "QR Code sudah expired atau tidak sesuai"
}
```

### Parameter QR Code

QR Code yang dihasilkan oleh Absen_Cloud_Kel5 memiliki format:

```
https://yourdomain.com/checkin?qr_token=TOKEN&course_id=COURSE&session_id=SESSION

Contoh:
https://example.com/checkin?qr_token=abc123xyz789&course_id=TIF-101&session_id=2024-01-15-08:00
```

**Parameter Penjelasan:**
- `qr_token`: Token unik yang dihasilkan backend, validitas terbatas (biasanya 1-2 jam)
- `course_id`: ID mata kuliah (contoh: TIF-101, MTK-201)
- `session_id`: ID sesi yang formatnya biasanya YYYY-MM-DD-HH:MM

---

## 💻 Teknologi yang Digunakan

Frontend 
Teknologi yang digunakan:
- HTML5 → Struktur halaman & semantic markup
- CSS3 → Styling responsif & animasi
- JavaScript (ES6+) → Logika aplikasi
- Font Awesome (6.4.0) → Icon library
- Plus Jakarta Sans → Custom font family
- MediaDevices API → Akses kamera device
- Fetch API → HTTP request ke backend

Backend (Absen_Cloud_Kel5)
Teknologi yang digunakan:
- Google Apps Script → Server-side logic & webhook
- Google Sheets → Database untuk penyimpanan data
- Google Forms (opsional) → Input data tambahan

---

## 👨‍💻 Panduan Pengembang

### Setup Development Environment

1. **Clone repository:**
   ```bash
   git clone https://github.com/Safinaarm/Kamera_Scan.git
   cd Kamera_Scan
   ```

2. **Buka dengan teks editor** (VS Code, Sublime, dll)

3. **Install dependencies (opsional, untuk live server):**
   ```bash
   # Gunakan VS Code Live Server extension, atau
   npm install -g http-server
   ```

4. **Jalankan development server:**
   ```bash
   http-server
   ```

### Struktur Kode

#### `script.js` - Main Logic:

```javascript
// Konfigurasi endpoint backend
const BASE_WEBAPP_URL = "https://...";

// State management
let user_id = "";
let codeReader = null;
let currentStream = null;

// Navigation functions
function showPage(id) { /* ... */ }

// Utility functions
function setStatus(elId, msg, type) { /* ... */ }
function stopCamera() { /* ... */ }

// Event listeners
document.getElementById("submitNameBtn").addEventListener("click", () => { /* ... */ });

// Main QR scanning function
function startScanQR() { /* ... */ }
```

#### `styles.css` - Design System:

```css
/* CSS Variables (Design Tokens) */
:root {
  --primary: #4f46e5;      /* Primary brand color */
  --accent: #06b6d4;       /* Accent color */
  --success: #10b981;      /* Success state */
  --error: #ef4444;        /* Error state */
  --bg: #0f0e17;           /* Background */
  --text: #f0eff7;         /* Text color */
  /* ... more variables ... */
}

/* Layout & Components */
.page-container { /* ... */ }
.card { /* ... */ }
.btn { /* ... */ }
.camera-frame { /* ... */ }
/* ... */
```

### Modifikasi & Customization

#### Mengubah URL Backend:
```javascript
// script.js - Line 1
const BASE_WEBAPP_URL = "https://script.google.com/macros/s/YOUR_ID/exec";
```

#### Mengubah Warna Tema:
```css
/* styles.css - Update CSS Variables */
:root {
  --primary: #your-color;
  --accent: #your-color;
  /* ... */
}
```

#### Menambahkan Field Input Baru:
```html
<!-- index.html - Di dalam .field -->
<div class="field">
  <label><i class="fas fa-star"></i> Field Baru</label>
  <input type="text" id="new_field" placeholder="...">
</div>
```

```javascript
// script.js - Di dalam event listener
const newFieldValue = document.getElementById("new_field").value;
// Tambahkan ke payload
```

### Menjalankan QR Scanner di Localhost

> ⚠️ **Catatan Penting**: Akses kamera memerlukan HTTPS atau localhost. Browser modern tidak mengizinkan akses kamera di HTTP biasa.

Untuk testing lokal dengan server:
```bash
# Terminal 1: Jalankan backend
http-server

# Terminal 2: Akses
http://localhost:8080
```

### Debugging Tips

1. **Buka Browser Developer Tools** (F12)
2. **Lihat Console tab** untuk error messages
3. **Cek Network tab** untuk request ke backend
4. **Gunakan breakpoints** untuk debug step-by-step

---

## 🐛 Troubleshooting

### Masalah: Kamera tidak bisa diakses

**Penyebab:**
- Browser tidak memiliki permission akses kamera
- Protokol HTTPS belum diaktifkan (jika di production)
- Perangkat tidak memiliki kamera

**Solusi:**
1. Buka settings browser → Privacy & Security → Camera
2. Tambahkan website ke whitelist akses kamera
3. Coba buka dengan browser lain
4. Pastikan koneksi HTTPS aktif di production

---

### Masalah: QR Code tidak terdeteksi

**Penyebab:**
- Pencahayaan kurang terang
- QR Code rusak atau tidak valid
- Jarak pemindaian terlalu jauh/dekat
- QR Code sudah expired (token QR terbatas waktu)

**Solusi:**
1. Pastikan pencahayaan terang dan tidak ada glare
2. Posisikan QR Code di tengah scan box
3. Jarak ideal: 15-30 cm dari kamera
4. Minta dosen generate QR Code baru
5. Klik tombol "Scan Ulang"

---

### Masalah: Error "QR Token tidak valid"

**Penyebab:**
- QR Code sudah expired
- QR Code bukan dari sesi yang benar
- Backend server tidak merespons

**Solusi:**
1. Minta dosen generate QR Code baru
2. Verifikasi course_id dan session_id sesuai
3. Pastikan backend (Google Apps Script) sudah di-deploy
4. Cek koneksi internet Anda

---

### Masalah: Page tidak responsive di mobile

**Penyebab:**
- Viewport meta tag belum diset
- CSS tidak kompatibel dengan ukuran layar kecil

**Solusi:**
- Meta tag sudah diset di HTML
- CSS sudah menggunakan media queries
- Clear browser cache (Ctrl+Shift+Delete)
- Coba dengan browser lain

---

### Masalah: Fetch API error "CORS"

**Penyebab:**
- Google Apps Script tidak dikonfigurasi untuk CORS

**Solusi:**
1. Buka Google Apps Script di Absen_Cloud_Kel5
2. Tambahkan header CORS di response:
   ```javascript
   function doPost(e) {
     var output = ContentService
       .createTextOutput(JSON.stringify(response))
       .setMimeType(ContentService.MimeType.JSON);
     
     // Tambahkan CORS headers (jika diperlukan)
     return output;
   }
   ```
3. Redeploy Google Apps Script

---

## 📚 Referensi & Dokumentasi

### Dokumentasi Backend:
- Repository: [Absen_Cloud_Kel5](https://github.com/Safinaarm/absen_cloud_kel5.git)
- Lihat README di repository tersebut untuk setup Google Apps Script

### Library & Framework:
- **ZXing.js**: https://github.com/zxing-js/library
- **Font Awesome**: https://fontawesome.com
- **Google Apps Script**: https://developers.google.com/apps-script

### API References:
- **MediaDevices API**: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
- **Fetch API**: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- **WebRTC**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API



## 📝 Lisensi

Proyek ini dilisensikan di bawah MIT License - lihat file `LICENSE` untuk detail.

---

## 👥 Tim Pengembang

Proyek QRAbsen dikembangkan oleh kelompok 5 mahasiswa Tekni Informatika Universitas Airlangga untuk keperluan tugas mata kuliah cloud computing.

- **Repository Kamera_Scan**: https://github.com/Safinaarm/Kamera_Scan.git
- **Repository Backend**: https://github.com/Safinaarm/absen_cloud_kel5.git


## 🗺️ Roadmap Fitur

### Fitur Sudah Ada:
- ✅ Pemindaian QR Code real-time
- ✅ Input nama/NIM validation
- ✅ Multi-step interface
- ✅ Error handling & retry
- ✅ Responsive design


---

**Last Updated**: Januari 2024  
**Status**: Active Development ✨

Dibuat dengan ❤️ oleh Tim Kelompok 5 Cloud computing praktikum
