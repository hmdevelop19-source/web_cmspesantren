<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Post;
use App\Models\Page;
use App\Models\Agenda;
use App\Models\Announcement;
use App\Models\Video;
use App\Models\Banner;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $admin = User::create([
                'name' => 'Administrator Pesantren',
                'email' => 'admin@pesantren.ac.id',
                'password' => bcrypt('password123'),
                'role' => 'admin',
                'status' => 'active'
            ]);
        }

        // 1. Categories
        $catNews = Category::updateOrCreate(['slug' => 'berita-utama'], ['name' => 'Berita Utama']);
        $catArticle = Category::updateOrCreate(['slug' => 'artikel-kajian'], ['name' => 'Artikel & Kajian']);
        $catAgenda = Category::updateOrCreate(['slug' => 'agenda-pesantren'], ['name' => 'Agenda']);
        $catAnnouncement = Category::updateOrCreate(['slug' => 'pengumuman'], ['name' => 'Pengumuman']);

        // 2. Banners
        Banner::truncate();
        Banner::create([
            'title' => 'Membangun Masa Depan Berasaskan Wahyu',
            'subtitle' => 'Pendaftaran Santri Baru Tahun Ajaran 2026/2027 telah dibuka. Bergabunglah bersama kami mencetak generasi Qurani.',
            'image_path' => 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000',
            'link_url' => '/pendaftaran',
            'order' => 1,
            'is_active' => true
        ]);
        Banner::create([
            'title' => 'Kurikulum Integrasi IPTEK & IMTAQ',
            'subtitle' => 'Metode pembelajaran modern yang dipadukan dengan pendalaman kitab kuning klasik secara mendalam.',
            'image_path' => 'https://images.unsplash.com/photo-1523050335392-9befbf0887c1?auto=format&fit=crop&q=80&w=2000',
            'link_url' => '/profil',
            'order' => 2,
            'is_active' => true
        ]);
        Banner::create([
            'title' => 'Pesantren Digital & Eco-Friendly',
            'subtitle' => 'Kami menerapkan sistem smart-campus dan pengelolaan lingkungan yang asri demi kenyamanan santri.',
            'image_path' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=2000',
            'link_url' => '/fasilitas',
            'order' => 3,
            'is_active' => true
        ]);

        // 3. Posts (Berita & Artikel)
        Post::truncate();
        for ($i = 1; $i <= 4; $i++) {
            $title = "Kegiatan Pesantren Minggu ke-$i: Fokus pada Tahfidz Quran";
            Post::create([
                'user_id' => $admin->id,
                'category_id' => $catNews->id,
                'title' => $title,
                'slug' => Str::slug($title),
                'content' => "<p>Alhamdulillah, kegiatan belajar mengajar di Pesantren Modern pada minggu ke-$i berjalan lancar. Seluruh santri sangat antusias mengikuti program Tahfidz Quran pagi.</p><p>Diharapkan dengan adanya program intensif ini, target pencapaian hafalan santri di semester ini dapat tercapai sesuai kurikulum yang telah ditetapkan oleh Majelis Pengasuh.</p>",
                'status' => 'published',
                'published_at' => now()->subDays($i)
            ]);
        }

        $artTitle = "Urgensi Adab Sebelum Ilmu dalam Menuntut Bekal Akhirat";
        Post::create([
            'user_id' => $admin->id,
            'category_id' => $catArticle->id,
            'title' => $artTitle,
            'slug' => Str::slug($artTitle),
            'content' => "<p>Dalam tradisi pesantren, adab diletakkan lebih tinggi daripada ilmu. Hal ini dikarenakan ilmu tanpa adab hanya akan melahirkan kesombongan...</p>",
            'status' => 'published',
            'published_at' => now()
        ]);

        // 4. Agendas
        Agenda::truncate();
        Agenda::create([
            'title' => 'Ujian Akhir Semester Ganjil',
            'slug' => Str::slug('Ujian Akhir Semester Ganjil'),
            'content' => 'Seluruh santri wajib mempersiapkan diri untuk mengikuti evaluasi belajar tahap pertama.',
            'location' => 'Aula Utama & Gedung Serbaguna',
            'event_date' => now()->addDays(14),
            'status' => 'published'
        ]);
        Agenda::create([
            'title' => 'Wisuda Tahfidz & Haflah Akhirussanah',
            'slug' => Str::slug('Wisuda Tahfidz & Haflah Akhirussanah'),
            'content' => 'Perayaan kelulusan santri angkatan ke-12 dan penghargaan bagi para penghafal Al-Quran.',
            'location' => 'Halaman Tengah Pesantren',
            'event_date' => now()->addDays(30),
            'status' => 'published'
        ]);

        // 5. Announcements
        Announcement::truncate();
        Announcement::create([
            'title' => 'Pengumuman Libur Hari Raya',
            'slug' => Str::slug('Pengumuman Libur Hari Raya'),
            'content' => 'Diberitahukan kepada wali santri bahwa liburan semester akan dimulai pada tanggal 10 Juni.',
            'priority' => 'high',
            'status' => 'published'
        ]);

        // 6. Videos
        Video::truncate();
        Video::create([
            'title' => 'Profil Singkat Pesantren Modern 2026',
            'description' => 'Tampilan lingkungan, fasilitas, dan kegiatan harian santri di kampus kami.',
            'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'is_featured' => true
        ]);

        // 7. Pages
        Page::truncate();
        Page::create([
            'title' => 'Sejarah Berdirinya Pesantren',
            'slug' => 'sejarah',
            'content' => '<p>Pesantren ini didirikan pada tahun 1995 oleh KH. Abdurrahman Wahid dengan visi menciptakan pusat keunggulan pendidikan Islam yang modern namun tetap berpegang teguh pada nilai-nilai luhur kepesantrenan tradisional.</p>',
            'status' => 'published'
        ]);
        Page::create([
            'title' => 'Visi & Misi Institusi',
            'slug' => 'visi-misi',
            'content' => '<ul><li>Terwujudnya insan kamil yang bertaqwa.</li><li>Mengembangkan IPTEK berbasis Al-Quran.</li><li>Mencetak pemimpin masa depan yang berakhlakul karimah.</li></ul>',
            'status' => 'published'
        ]);

        // 8. Settings
        Setting::updateOrCreate(['key' => 'site_name'], ['value' => 'Pesantren Modern Digital']);
        Setting::updateOrCreate(['key' => 'site_tagline'], ['value' => 'Mencetak Generasi Qurani di Era Digital']);
        Setting::updateOrCreate(['key' => 'primary_color'], ['value' => '#0B5C3B']);
        Setting::updateOrCreate(['key' => 'secondary_color'], ['value' => '#F4C41B']);
    }
}
