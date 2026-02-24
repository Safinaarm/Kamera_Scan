const BASE_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwtaOPeaNCevIXk1SaP2KlhFrsUFAc0fyn_vPwiqUVEiJSzF_9nn56zH_hKEYjzaweG/exec";

let user_id = "";
let codeReader = null;
let currentStream = null;

// ── Utility: Show a specific page ──
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById(id);
  target.style.animation = "none";
  target.offsetHeight; // force reflow
  target.style.animation = "";
  target.classList.add("active");
}

// ── Utility: Set status message ──
function setStatus(elId, msg, type) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.className = "status-msg show " + type;
}

// ── Utility: Hide status message ──
function hideStatus(elId) {
  document.getElementById(elId).className = "status-msg";
}

// ── Utility: Stop camera & scanner ──
function stopCamera() {
  if (codeReader) {
    try { codeReader.reset(); } catch (e) {}
    codeReader = null;
  }
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
    currentStream = null;
  }
  const video = document.getElementById("video");
  video.srcObject = null;
}

// ── Utility: Tambah tombol "Scan Ulang" setelah error ──
function tambahTombolScanUlang() {
  if (document.getElementById("retryBtn")) return;

  const btn = document.createElement("button");
  btn.id = "retryBtn";
  btn.className = "btn btn-ghost";
  btn.style.marginTop = "10px";
  btn.innerHTML = '<i class="fas fa-redo"></i> Scan Ulang';
  btn.addEventListener("click", () => {
    btn.remove();
    startScanQR();
  });

  document.getElementById("scanStatus").insertAdjacentElement("afterend", btn);
}

// ── STEP 1: Submit Name → Go to Page 2 ──
document.getElementById("submitNameBtn").addEventListener("click", () => {
  user_id = document.getElementById("user_id").value.trim();

  if (!user_id) {
    setStatus("status", "⚠ Nama / NIM wajib diisi!", "error");
    return;
  }

  hideStatus("status");
  showPage("page2");
  startScanQR();
});

// ── STEP 2: Back Button → Go back to Page 1 ──
document.getElementById("backBtn").addEventListener("click", () => {
  stopCamera();
  const retryBtn = document.getElementById("retryBtn");
  if (retryBtn) retryBtn.remove();
  showPage("page1");
});

// ── STEP 3: Back to Home → Reset & Go to Page 1 ──
document.getElementById("backToHomeBtn").addEventListener("click", () => {
  document.getElementById("user_id").value = "";
  hideStatus("status");
  showPage("page1");
});

// ── STEP 2: Start QR Scanner ──
function startScanQR() {
  codeReader = new ZXing.BrowserMultiFormatReader();
  const video = document.getElementById("video");

  setStatus("scanStatus", "Menginisialisasi kamera...", "info");

  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    })
    .then(stream => {
      currentStream = stream;
      video.srcObject = stream;
      setStatus("scanStatus", "Arahkan kamera ke QR Code...", "info");
    })
    .catch(err => {
      setStatus("scanStatus", "Gagal membuka kamera: " + err.message, "error");
    });

  let scanning = true;

  codeReader.decodeFromVideoDevice(undefined, "video", async (result, err) => {
    if (!scanning) return;

    if (result) {
      scanning = false;
      stopCamera();
      setStatus("scanStatus", "QR terdeteksi, memproses absensi...", "info");

      try {
        const url = new URL(result.text);
        const qr_token   = url.searchParams.get("qr_token");
        const course_id  = url.searchParams.get("course_id");
        const session_id = url.searchParams.get("session_id");

        if (!qr_token || !course_id || !session_id) {
          throw new Error("QR Code tidak valid atau format salah");
        }

        const payload = {
          user_id,
          device_id: navigator.userAgent || "unknown-device",
          course_id,
          session_id,
          qr_token,
          ts: new Date().toISOString(),
        };

        const res = await fetch(`${BASE_WEBAPP_URL}?action=checkin`, {
          method: "POST",
          mode: "cors",
          redirect: "follow",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("Response dari server:", JSON.stringify(data));

        if (data.ok) {
          document.getElementById("resultName").textContent       = user_id;
          document.getElementById("resultCourse").textContent     = course_id;
          document.getElementById("resultSession").textContent    = session_id;
          document.getElementById("resultPresenceId").textContent = data.data?.presence_id || "—";
          showPage("page3");

        } else {
          // Tampilkan pesan error lengkap dari server
          const pesanError = data.error || data.message || JSON.stringify(data);
          setStatus("scanStatus", "❌ " + pesanError, "error");
          console.error("Server error:", data);
          tambahTombolScanUlang();
        }

      } catch (e) {
        console.error("Fetch/parse error:", e);
        setStatus("scanStatus", "❌ " + (e.message || "Koneksi bermasalah"), "error");
        tambahTombolScanUlang();
      }
    }

    if (err && !(err instanceof ZXing.NotFoundException)) {
      console.error("Scan error:", err);
    }
  });
}