<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Page;
use App\Models\Agenda;
use App\Models\Announcement;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $posts = Post::where('status', 'published')->where('published_at', '<=', now())->get();
        $pages = Page::where('status', 'published')->get();
        $agendas = Agenda::where('status', 'published')->get();
        $announcements = Announcement::where('status', 'published')->get();

        $xml = view('sitemap', [
            'posts' => $posts,
            'pages' => $pages,
            'agendas' => $agendas,
            'announcements' => $announcements,
            'baseUrl' => config('app.url_frontend', 'https://portalpesantren.ac.id')
        ])->render();

        return response($xml, 200)->header('Content-Type', 'text/xml');
    }
}
