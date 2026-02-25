// URL Web App Google Apps Script yang digunakan untuk proses check-in (absensi)
const BASE_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwtaOPeaNCevIXk1SaP2KlhFrsUFAc0fyn_vPwiqUVEiJSzF_9nn56zH_hKEYjzaweG/exec";

// Variabel global untuk menyimpan user_id (nama/NIM pengguna)
let user_id = "";

// Objek QR code reader dari library ZXing
let codeReader = null;

// Menyimpan stream kamera aktif
let currentStream = null;


// ==============================
// ── FUNGSI UTILITAS ──
// ==============================

// Fungsi untuk menampilkan halaman tertentu berdasarkan id
// Digunakan untuk berpindah antar page (page1, page2, page3)
function showPage(id) {
  // Sembunyikan semua halaman
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  
  // Ambil halaman target
  const target = document.getElementById(id);

  // Reset animasi agar bisa diputar ulang
  target.style.animation = "none";
  target.offsetHeight; // Force reflow agar animasi aktif kembali
  target.style.animation = "";

  // Tampilkan halaman dengan menambahkan class active
  target.classList.add("active");
}


// Fungsi untuk menampilkan pesan status (info / error)
// elId = id elemen
// msg = pesan yang ditampilkan
// type = jenis pesan (misalnya: info, error)
function setStatus(elId, msg, type) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.className = "status-msg show " + type;
}


// Fungsi untuk menyembunyikan pesan status
function hideStatus(elId) {
  document.getElementById(elId).className = "status-msg";
}


// Fungsi untuk menghentikan kamera dan QR scanner
function stopCamera() {

  // Reset scanner ZXing jika masih aktif
  if (codeReader) {
    try { codeReader.reset(); } catch (e) {}
    codeReader = null;
  }

  // Hentikan semua track kamera (video stream)
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
    currentStream = null;
  }

  // Kosongkan sumber video
  const video = document.getElementById("video");
  video.srcObject = null;
}


// Fungsi untuk menambahkan tombol "Scan Ulang"
// Tombol muncul jika terjadi error saat scan
function tambahTombolScanUlang() {

  // Jika tombol sudah ada, tidak perlu buat lagi
  if (document.getElementById("retryBtn")) return;

  // Buat elemen button baru
  const btn = document.createElement("button");
  btn.id = "retryBtn";
  btn.className = "btn btn-ghost";
  btn.style.marginTop = "10px";
  btn.innerHTML = '<i class="fas fa-redo"></i> Scan Ulang';

  // Jika diklik → hapus tombol dan mulai scan lagi
  btn.addEventListener("click", () => {
    btn.remove();
    startScanQR();
  });

  // Tambahkan tombol setelah elemen scanStatus
  document.getElementById("scanStatus").insertAdjacentElement("afterend", btn);
}


// ==============================
// ── STEP 1: INPUT USER ──
// ==============================

// Ketika tombol submit diklik
document.getElementById("submitNameBtn").addEventListener("click", () => {

  // Ambil input nama / NIM dari form
  user_id = document.getElementById("user_id").value.trim();

  // Validasi jika kosong
  if (!user_id) {
    setStatus("status", "⚠ Nama / NIM wajib diisi!", "error");
    return;
  }

  // Jika valid → sembunyikan pesan error
  hideStatus("status");

  // Pindah ke halaman scan
  showPage("page2");

  // Mulai scan QR
  startScanQR();
});


// ==============================
// ── STEP 2: TOMBOL KEMBALI ──
// ==============================

// Jika tombol back diklik → kembali ke halaman 1
document.getElementById("backBtn").addEventListener("click", () => {
  stopCamera(); // hentikan kamera

  // Hapus tombol scan ulang jika ada
  const retryBtn = document.getElementById("retryBtn");
  if (retryBtn) retryBtn.remove();

  showPage("page1");
});


// ==============================
// ── STEP 3: KEMBALI KE HOME ──
// ==============================

// Reset semua data dan kembali ke halaman awal
document.getElementById("backToHomeBtn").addEventListener("click", () => {
  document.getElementById("user_id").value = "";
  hideStatus("status");
  showPage("page1");
});


// ==============================
// ── FUNGSI UTAMA: START SCAN QR ──
// ==============================

function startScanQR() {

  // Inisialisasi QR scanner dari library ZXing
  codeReader = new ZXing.BrowserMultiFormatReader();
  const video = document.getElementById("video");

  setStatus("scanStatus", "Menginisialisasi kamera...", "info");

  // Akses kamera perangkat
  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: "environment", // Gunakan kamera belakang
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    })

    // Jika kamera berhasil diakses
    .then(stream => {
      currentStream = stream;
      video.srcObject = stream;
      setStatus("scanStatus", "Arahkan kamera ke QR Code...", "info");
    })

    // Jika gagal membuka kamera
    .catch(err => {
      setStatus("scanStatus", "Gagal membuka kamera: " + err.message, "error");
    });

  let scanning = true;

  // Proses membaca QR code 
  codeReader.decodeFromVideoDevice(undefined, "video", async (result, err) => {

    if (!scanning) return;

    // Jika QR berhasil terbaca
    if (result) {
      scanning = false;
      stopCamera();

      setStatus("scanStatus", "QR terdeteksi, memproses absensi...", "info");

      try {
        // Ambil isi QR sebagai URL
        const url = new URL(result.text);

        // Ambil parameter dari QR
        const qr_token   = url.searchParams.get("qr_token");
        const course_id  = url.searchParams.get("course_id");
        const session_id = url.searchParams.get("session_id");

        // Validasi format QR
        if (!qr_token || !course_id || !session_id) {
          throw new Error("QR Code tidak valid atau format salah");
        }

        // Data yang dikirim ke server
        const payload = {
          user_id,
          device_id: navigator.userAgent || "unknown-device",
          course_id,
          session_id,
          qr_token,
          ts: new Date().toISOString(), // timestamp
        };

        // Kirim data ke Google Apps Script
        const res = await fetch(`${BASE_WEBAPP_URL}?action=checkin`, {
          method: "POST",
          mode: "cors",
          redirect: "follow",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        console.log("Response dari server:", JSON.stringify(data));

        // Jika absensi berhasil
        if (data.ok) {

          // Tampilkan hasil di halaman 3
          document.getElementById("resultName").textContent       = user_id;
          document.getElementById("resultCourse").textContent     = course_id;
          document.getElementById("resultSession").textContent    = session_id;
          document.getElementById("resultPresenceId").textContent = data.data?.presence_id || "—";

          showPage("page3");

        } else {
          // Jika server mengembalikan error
          const pesanError = data.error || data.message || JSON.stringify(data);
          setStatus("scanStatus", "❌ " + pesanError, "error");
          console.error("Server error:", data);

          tambahTombolScanUlang();
        }

      } catch (e) {
        // Jika terjadi error saat parsing atau fetch
        console.error("Fetch/parse error:", e);
        setStatus("scanStatus", "❌ " + (e.message || "Koneksi bermasalah"), "error");

        tambahTombolScanUlang();
      }
    }

    // Jika error selain QR tidak ditemukan
    if (err && !(err instanceof ZXing.NotFoundException)) {
      console.error("Scan error:", err);
    }
  });
}