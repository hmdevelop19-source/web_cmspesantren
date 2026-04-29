<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Menu;

class PublicMenuSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            [
                'label' => 'Berita',
                'url' => '/berita',
                'order' => 2,
                'is_active' => true
            ],
            [
                'label' => 'Artikel',
                'url' => '/artikel',
                'order' => 3,
                'is_active' => true
            ],
            [
                'label' => 'Kajian',
                'url' => '/kajian',
                'order' => 4,
                'is_active' => true
            ]
        ];

        foreach ($menus as $menu) {
            Menu::updateOrCreate(
                ['url' => $menu['url']],
                $menu
            );
        }
    }
}
