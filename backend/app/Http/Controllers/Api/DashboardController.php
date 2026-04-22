<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Category;
use App\Models\Agenda;
use App\Models\Announcement;
use App\Models\Page;
use App\Models\User;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'stats' => [
                'posts' => Post::count(),
                'pages' => Page::count(),
                'categories' => Category::count(),
                'users' => User::count(),
                'agendas' => Agenda::count(),
                'announcements' => Announcement::count(),
                'contact_messages' => ContactMessage::count(),
                'unread_messages' => ContactMessage::where('status', 'unread')->count(),
            ],
            'recent_posts' => Post::with('category')->latest()->take(5)->get(),
            'trends' => $this->getTrends(),
            'recent_messages' => ContactMessage::latest()->take(5)->get(),
            'upcoming_agendas' => Agenda::where('event_date', '>=', now())->orderBy('event_date')->take(5)->get(),
            'system' => [
                'php_version' => PHP_VERSION,
                'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'database' => config('database.default'),
                'os' => PHP_OS,
            ]
        ]);
    }

    private function getTrends()
    {
        $trends = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthName = $month->format('M');
            $yearMonth = $month->format('Y-m');

            $trends[] = [
                'month' => $monthName,
                'posts' => Post::where('created_at', 'like', "$yearMonth%")->count(),
                'messages' => ContactMessage::where('created_at', 'like', "$yearMonth%")->count(),
            ];
        }
        return $trends;
    }
}
