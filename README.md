# 🛡️ CipherLab Pro v1.2.0 "Titanium Edition"
> **Universal Encryption, Decryption, & JavaScript Deobfuscation Framework**

CipherLab Pro adalah toolkit keamanan multifungsi yang dirancang untuk berjalan tanpa dependensi (`node_modules`), memberikan kecepatan maksimal dan keamanan tinggi di lingkungan Serverless.

---

## 🚀 1. Persyaratan Sistem
*   **Node.js:** v18.x atau lebih baru.
*   **Git:** Untuk pengelolaan repository.
*   **GitHub CLI (`gh`):** (Opsional) Untuk deployment otomatis.
*   **Internet:** Diperlukan untuk deployment Vercel atau penggunaan Bot Telegram.

---

## 📥 2. Instalasi & Setup Lokal

### A. Clone Repository
```bash
git clone https://github.com/irfanirsyad/cipherlab-pro.git
cd cipherlab-pro
```

### B. Konfigurasi Keamanan (Environment Variables)
Buat file atau set variabel lingkungan berikut untuk mengamankan API Anda:
*   `CIPHERLAB_API_KEY`: Key rahasia untuk akses API (Default: `cipherlab_dev_secret`).
*   `TELEGRAM_BOT_TOKEN`: Token dari [@BotFather](https://t.me/botfather).
*   `API_URL`: URL API Anda (Gunakan URL Vercel setelah dideploy).

### C. Menjalankan Server Lokal
```bash
node src/cli/index.js serve --port 3000
```
API akan berjalan di `http://localhost:3000` dan Web Dashboard dapat diakses di `http://localhost:3000/index.html`.

---

## ☁️ 3. Deployment ke Vercel (Rekomendasi)

Project ini sudah dilengkapi dengan `vercel.json`.
1.  Push code ke GitHub Anda.
2.  Masuk ke [Vercel Dashboard](https://vercel.com).
3.  Klik **New Project** > Import repository `cipherlab-pro`.
4.  Pada bagian **Environment Variables**, tambahkan `CIPHERLAB_API_KEY`.
5.  Klik **Deploy**.

---

## 🛠️ 4. Cara Penggunaan

### A. Melalui Web Dashboard (GUI)
1.  Buka URL Vercel Anda di browser (misal: `https://cipherlab-pro.vercel.app`).
2.  Masukkan **API KEY** Anda di kolom yang tersedia.
3.  Tempelkan teks atau kode di area input.
4.  Pilih aksi: **Auto Detect**, **Deobfuscate**, atau **Encrypt**.

### B. Melalui Command Line (CLI)
Gunakan script `src/cli/index.js` untuk operasi cepat:
```bash
# Deteksi Otomatis
node src/cli/index.js detect "SGVsbG8="

# Deobfuscate Kode JS
node src/cli/index.js deobfuscate "kode_obfuscated.js"

# Enkripsi Level 7 (Fortress Mode)
node src/cli/index.js encrypt "Pesan Rahasia" --level 7 --password "pass123"
```

### C. Melalui Bot Telegram
1.  Jalankan bot di server/VPS:
    ```bash
    export TELEGRAM_BOT_TOKEN="token_anda"
    export API_URL="https://url-api-anda.vercel.app"
    node bot-telegram.js
    ```
2.  Di Telegram, gunakan perintah:
    *   `/start` - Memulai interaksi.
    *   `/deobfuscate` - Kirim file `.js` atau teks obfuscated.
    *   `/encrypt 5 password123` - Mengenkripsi pesan dengan AES-256-GCM.
    *   `/detect` - Mengirim file untuk dianalisis tipe dan tingkat entropinya.

---

## 🔍 5. Detail Fitur Utama

### 1. JavaScript Deobfuscation (Titan Engine)
Mampu membersihkan kode dari:
*   **Eval Loops:** Membuka lapisan `eval(function(p,a,c,k,e,d)...)`.
*   **Hex/Unicode Escapes:** Mengonversi `\x61` menjadi `a`.
*   **String Array Mapping:** Mengembalikan variabel seperti `_0x1234[0]` ke nilai aslinya.
*   **Sandbox Guard:** Memblokir input yang mencoba mengakses `constructor` atau `prototype` untuk keamanan server.

### 2. Encryption Levels
*   **Level 1:** Base64 / Hex (Encoding standar).
*   **Level 4:** AES-128-CBC (Kuat).
*   **Level 5:** AES-256-GCM (Sangat Kuat, Terautentikasi).
*   **Level 7 (Titanium):** Enkripsi berlapis dengan **Recovery Key**. Output berisi header metadata untuk pemulihan darurat.

### 3. Binary Analysis
Gunakan endpoint `/api/analyze` untuk memeriksa file non-teks. Sistem akan membaca:
*   **Magic Bytes:** Mengidentifikasi apakah file itu PNG, EXE, PDF, dll.
*   **Printable Strings:** Menemukan teks tersembunyi di dalam file binary.

---

## 🛡️ 6. Keamanan & Privasi
*   **No Key Storage:** Server tidak menyimpan password atau kunci Anda.
*   **Isolation:** Deobfuscasi dijalankan di `vm` terisolasi tanpa akses ke sistem file server.
*   **Rate Limiting:** Melindungi API dari serangan spam (30 req/menit).

---

## 📝 7. Troubleshooting
*   **Error 401 (Unauthorized):** Pastikan header `x-api-key` yang Anda kirim sama dengan `CIPHERLAB_API_KEY` di server.
*   **Error 429 (Rate Limit):** Tunggu 1 menit sebelum mengirim request kembali.
*   **Deobfuscation Gagal:** Jika kode menggunakan *Control Flow Flattening* yang sangat berat, engine mungkin hanya bisa membersihkan string-nya saja karena keterbatasan Regex (Non-AST).

---
**CipherLab Pro** - *Secure your code, unveil the hidden.* 🚀
