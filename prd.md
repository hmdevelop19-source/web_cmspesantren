# Product Requirements Document (PRD)
**Nama Produk:** Sistem Manajemen Konten (CMS) & Portal Web Pesantren
**Status:** Versi 2.0 (WP-Inspired Admin & Full Pages CRUD)
**Tech Stack:** Laravel 11.x (Backend/API), React.js (Frontend Publik & Admin Panel), TailwindCSS (Styling)

## 1. Ringkasan Eksekutif
Produk ini adalah platform berbasis web arsitektur *headless* yang berfungsi sebagai portal informasi publik sekaligus Sistem Manajemen Konten (CMS) terpusat untuk institusi Pesantren. Sistem ini dirancang untuk memberikan fleksibilitas performa tinggi dengan React dan Laravel, namun tetap mempertahankan kenyamanan penggunaan (UX) yang familiar ala WordPress bagi pengurus (admin) pesantren.

## 2. Tujuan Produk
* **Digitalisasi Informasi:** Menyediakan sumber informasi resmi pesantren (profil, berita, program) secara *real-time*.
* **Familiaritas & Kemudahan Operasional:** Meminimalkan kurva pembelajaran admin dengan mengadopsi antarmuka (UI/UX) *dashboard* klasik ala WordPress, lengkap dengan sistem blok editor dan pustaka media terpusat.
* **Manajemen Konten Dinamis (Zero Hardcode):** Memastikan semua halaman "statis" (seperti Sejarah, Visi Misi, Fasilitas) dapat dikelola secara penuh (CRUD) melalui Admin Panel tanpa perlu mengubah kode sumber.
* **Skalabilitas Data:** Membangun basis *database* relasional yang terstruktur, menggunakan format tipe data yang efisien (angka/integer) dan siap diintegrasikan dengan sistem informasi manajemen madrasah di masa depan.

## 3. Ruang Lingkup & Fitur Utama

### 3.1. Portal Publik (Frontend - React & TailwindCSS)
Halaman web responsif untuk diakses pengunjung (tanpa *login*). Sistem *routing* bersifat dinamis membaca data dari API.
* **Beranda (Home):** *Hero banner*, ringkasan profil, *feed* berita terbaru.
* **Halaman Dinamis (Pages):** *Render* konten untuk URL spesifik seperti `/halaman/profil`, `/halaman/visi-misi`, atau `/halaman/program-unggulan`.
* **Berita & Artikel:** Daftar postingan dengan fitur pencarian, kategori, dan paginasi.
* **Galeri:** Kumpulan dokumentasi foto kegiatan pesantren.
* **Kontak:** Formulir untuk mengirim pesan/pertanyaan ke pengurus.

### 3.2. Admin Panel / CMS (UX Inspirasi WordPress)
*Dashboard* Single Page Application (SPA) tertutup dengan autentikasi berbasis *token*.
* **Layout Inti:**
  * **Sidebar (Dark Theme):** Navigasi utama di kiri (Dashboard, Pos, Media, Laman, Kontak, Pengaturan).
  * **Top Bar:** Notifikasi, pintasan "Kunjungi Situs", dan profil *user*.
* **Manajemen Laman (Pages CRUD):**
  * Modul untuk membuat, mengedit, dan menghapus halaman statis.
  * *Auto-generate* URL/Slug dari judul (misal: "Sejarah Kami" -> `sejarah-kami`).
* **Manajemen Artikel/Pos:**
  * CRUD pos/artikel dengan dukungan kategori dan tag.
  * **Block-Based Editor:** Editor kaya fitur (seperti Gutenberg/Editor.js) untuk menyusun konten per blok (Teks, Gambar, Daftar).
* **Media Library (Pustaka Media):**
  * *Grid view* terpusat untuk semua *file* gambar yang diunggah.
  * *Modal picker* untuk menyisipkan gambar ke dalam Artikel/Laman.
* **Pengaturan Global:** Modul untuk mengubah nama situs, logo, dan teks *footer*.

## 4. Spesifikasi Teknis Lengkap

### 4.1. Arsitektur & Teknologi
* **Backend:** PHP 8.x, Laravel 11.x (REST API RESTful).
* **Autentikasi:** Laravel Sanctum.
* **Frontend:** React.js dengan Vite, React Router DOM.
* **Styling & UI:** Tailwind CSS, dengan komponen Headless UI/Radix untuk *dropdown* & *modal*.
* **State Management:** Zustand (untuk *state* admin) dan React Query (untuk sinkronisasi API).
* **Database:** MySQL 8.0 / PostgreSQL.

### 4.2. Skema Database Inti
*Catatan: Kolom yang menyimpan nilai tingkat, status, atau periode menggunakan tipe data integer/angka (contoh: `1`, `2`) untuk performa indeks yang lebih baik dibanding string panjang.*

* `users`: id, name, email, password, role_id (integer: 1=SuperAdmin, 2=Editor), timestamps.
* `pages` (Halaman Statis): id, title, slug, content (JSON), status_id (integer: 1=Published, 0=Draft), timestamps.
* `posts` (Artikel/Berita): id, user_id, title, slug, content (JSON), cover_image_id, status_id (integer), published_at, timestamps.
* `categories`: id, name, slug.
* `media`: id, file_name, file_path, file_type, timestamps.
* `academic_periods` (Persiapan Integrasi): id, year, kuartal (integer: 1, 2, 3, 4), is_active (boolean).
* `settings`: id, key, value, timestamps.

## 5. Kebutuhan UI/UX (Admin Panel)
* **Warna & Tipografi:** Menggunakan latar belakang gelap untuk *sidebar* (seperti `bg-zinc-900`) dan area konten yang terang (`bg-gray-50`) untuk fokus membaca.
* **Pengalaman Menulis:** Proses *auto-save* secara periodik ke *backend* untuk mencegah hilangnya draf konten Laman atau Pos.
* **Responsivitas:** Tabel data dan editor dapat beradaptasi saat diakses menggunakan *tablet* oleh pengurus.

## 6. Kebutuhan Non-Fungsional
* **Performa (SEO):** Output dari React harus mendukung meta *tag* yang dinamis (React Helmet) berdasarkan data yang ditarik dari *database*.
* **Keamanan:** Proteksi API menggunakan *middleware*, validasi input secara ketat, dan implementasi CORS yang membatasi akses hanya dari domain *frontend*.

## 7. Fase Pengembangan (Milestones)

* **Tahap 1: Setup API & Database (Minggu 1)**
  * Instalasi Laravel, konfigurasi database, migrasi, dan implementasi Auth Sanctum.
* **Tahap 2: Infrastruktur Frontend & UI Admin (Minggu 2)**
  * Inisialisasi React & Tailwind.
  * Pembuatan Layout *Dashboard* (Sidebar, Topbar ala WordPress).
* **Tahap 3: Modul Core CMS (Minggu 3)**
  * Implementasi Media Library (API unggah *file* & UI Grid).
  * Pembuatan CRUD Laman (Pages) & Pos (Posts) dengan Block Editor.
* **Tahap 4: Portal Publik (Minggu 4)**
  * Pengembangan antarmuka pengunjung yang menampilkan data dari API.
  * Integrasi *Dynamic Routing* untuk merender konten dari tabel `pages`.
* **Tahap 5: Testing & Deployment (Minggu 5)**
  * Pengujian menyeluruh, optimasi performa, dan rilis ke *server* produksi.