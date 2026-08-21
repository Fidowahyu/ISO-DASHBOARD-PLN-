# ⚡ Platform Audit & Dashboard Human Capital ISO 30414 - PT PLN (Persero)

![ISO 30414 Platform](https://img.shields.io/badge/ISO%2030414-Human%20Capital%20Audit-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TypeScript-indigo.svg)
![NodeJS](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%20%2B%20Prisma-emerald.svg)
![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)

Selamat datang di **Platform Audit & Executive Dashboard Human Capital ISO 30414**! Platform ini dirancang khusus untuk mempermudah evaluasi, pengolahan data metrik, dan penyusunan laporan tingkat kematangan tata kelola *Human Capital* organisasi berbasis standar internasional **ISO 30414:2018 / 2025**.

---

## 🎯 Mengapa Menggunakan Platform Ini?

1. **Otomatisasi Olah Data Excel**: Cukup upload file Excel pelaporan ISO 30414, sistem akan otomatis membaca 12 Area, puluhan metrik, dan tren riwayat multi-tahun (2021-2026).
2. **Visualisasi Eksekutif Real-Time**: Menyajikan grafik *Spider/Radar Chart*, tren keterisian data, dan kalkulasi otomatis Tingkat Kematangan Tata Kelola (*Maturity Level 1.0 - 5.0*).
3. **Penyusunan Laporan Otomatis (PDF & Excel)**: Menghasilkan berkas laporan audit profesional berstandar konsultan eksekutif (*Big4 / Advisory Standard*) lengkap dengan rekomendasi aksi strategis per area.
4. **Keamanan & Pembatasan Hak Akses (RBAC)**: Pengaturan menu dan fitur yang secara otomatis menyesuaikan peran pengguna (Admin, PIC, Reviewer, Management).

---

## ✨ Fitur-Fitur Utama

### 📊 1. Executive Dashboard
- **Spider/Radar Chart**: Visualisasi 12 area ISO 30414 membandingkan skor aktual organisasi vs batas minimum standar ISO (Level 3.0).
- **Multi-Year Trend Curve**: Grafik tren perkembangan tingkat kematangan dari tahun 2021 hingga 2026.
- **KPI Summary Cards**: Menampilkan skor overall, jumlah metrik terisi, tingkat keterisian data (%), dan status kelayakan audit.

### 📂 2. Excel Data Import & Parsing Service
- Mengurai file Excel pelaporan secara otomatis.
- Mendukung pengenalan area, metrik, PIC divisi, dan riwayat multi-tahun.
- Menyediakan pratinjau data (*Import Preview*) sebelum dikonfirmasi ke database.

### 🛡️ 3. Role-Based Access Control (RBAC)
- **ADMIN**: Akses penuh ke seluruh menu (Input Data, Import Excel, Manajemen Pengguna, Konfigurasi ISO, Audit Log).
- **PIC (Data Contributor)**: Khusus penginputan data metrik, draft submisi, dan verifikasi status metrik divisi.
- **REVIEWER (Validator)**: Khusus antrean persetujuan/penolakan data (*Review Queue*) dan analisis kualitas data.
- **MANAGEMENT (Executive)**: Tampilan *Executive Dashboard*, grafik radar kematangan, dan ekspor laporan PDF/Excel.

### 📑 4. Executive Audit Report Generator (PDF & Excel)
- **Laporan PDF**: 6+ halaman lengkap dengan halaman sampul eksekutif, analisis gap, spider chart, dan rekomendasi aksi konkret per area.
- **Laporan Excel**: Berkas workbook eksekutif 6 lembar kerja (*Executive Summary*, *Level Criteria 1-5*, *Temuan Audit*, *Area Descriptions*, *Area Conclusions & Actions*, dan *Metrics Details*).

### 🔑 5. Otentikasi & Registrasi Akun Pengguna
- Halaman Login & Registrasi (*Sign-Up*) akun baru interaktif dengan tab switcher.
- Keamanan password terenkripsi menggunakan **bcrypt (12 rounds)** dan cookie sesi **JWT (JSON Web Token)**.

---

## 📁 Berkas Sampel Excel untuk Pengujian (Sample Files)

Tersedia berkas sampel Excel di dalam proyek untuk mempermudah pengujian berbagai skenario data:

| Nama Berkas Excel | Skenario / Deskripsi Data |
| :--- | :--- |
| **`Data_ISO_30414_PT_PLN_PERSERO_FULL_ENTERPRISE.xlsx`** | **Data PLN Group Lengkap** (54.200 Pegawai, 49 Metrik Ketenagalistrikan, Riwayat 6 Tahun 2021-2026, Skor 91.5%). |
| **`Data_ISO_30414_PERTAMINA_ENTERPRISE_HOLDING.xlsx`** | **Data Pertamina Holding** (48.500 Pekerja, 54 Metrik Energi, Subholding Upstream/Refinery, Skor 88.4%). |
| **`Data_ISO_30414_STEADY_GROWTH_UP.xlsx`** | Skenario Perusahaan yang Mengalami **Kenaikan Performa** dari tahun 2021 (42.0%) hingga 2026 (91.9%). |
| **`Data_ISO_30414_STEADY_DECLINE_DOWN.xlsx`** | Skenario Perusahaan yang Mengalami **Penurunan Performa** dari tahun 2021 (93.1%) hingga 2026 (19.6%). |
| **`Data_ISO_30414_EXCELLENT_WORLD_CLASS.xlsx`** | Skenario Kinerja Unggul Berpredikat **Level 5.0 (World Class)**. |
| **`Data_ISO_30414_CRITICAL_CRISIS_BAD.xlsx`** | Skenario Kinerja Kritis Berpredikat **Level 1.2 (High Audit Risk)**. |

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Persyaratan Sistem
- **Node.js**: v18.0.0 atau yang lebih baru
- **npm**: v9.0.0 atau yang lebih baru

### 2. Langkah Installasi

#### A. Persiapan Backend Server:
```bash
cd server
npm install
npx prisma db push
npx prisma db seed
npm run dev
```
*Server akan berjalan secara otomatis di port `5000`.*

#### B. Persiapan Frontend Client:
```bash
cd client
npm install
npm run dev
```
*Aplikasi frontend akan berjalan di `http://localhost:5173`.*

---

## 🔐 Akun Demonstrasi (Default Credentials)

Anda dapat menggunakan akun berikut untuk menguji berbagai peran pengguna di halaman Login:

- **Admin (Akses Penuh)**: `admin@pln.co.id` / `admin123`
- **PIC (Data Input)**: `pic.hsc@pln.co.id` / `pic123`
- **Reviewer (Validator)**: `reviewer@pln.co.id` / `reviewer123`
- **Management (Executive)**: `management@pln.co.id` / `mgmt123`

*Atau Anda juga dapat menggunakan fitur **Daftar Baru (Register)** di halaman login untuk membuat akun baru dengan peran yang diinginkan.*

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Lucide Icons, Recharts, Canvas-Confetti.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, SQLite/PostgreSQL, PDFKit, ExcelJS, Zod Validation, Bcrypt, JWT.
- **Repository**: [https://github.com/Fidowahyu/ISO-DASHBOARD-PLN-.git](https://github.com/Fidowahyu/ISO-DASHBOARD-PLN-.git)

---

## 📄 Lisensi

Hak Cipta © 2026 PT PLN (Persero) - Human Capital Management. Seluruh Hak Dilindungi.
