<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create SuperAdmin
        User::updateOrCreate(
            ['email' => 'admin@pesantren.ac.id'],
            [
                'name' => 'Super Administrator',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // 2. Create Categories
        $categories = ['Berita', 'Pengumuman', 'Agenda', 'Artikel'];
        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => str()->slug($cat)],
                ['name' => $cat]
            );
        }

        // 3. Create Default Settings
        $settings = [
            'site_name' => 'CMS Pesantren Modern',
            'site_tagline' => 'Membangun Generasi Madani',
            'primary_color' => '#0B5C3B',
            'secondary_color' => '#F4C41B',
            'contact_email' => 'info@pesantren.ac.id',
            'contact_phone' => '+62 812 3456 789',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        // Call SampleDataSeeder for additional content
        $this->call(SampleDataSeeder::class);
    }
}
