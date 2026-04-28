<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Page;
use App\Models\Agenda;
use App\Models\Announcement;
use App\Models\Video;
use App\Models\Banner;
use App\Models\Setting;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Menu;
use App\Http\Resources\PostResource;
use App\Http\Resources\PageResource;
use App\Http\Resources\AgendaResource;
use App\Http\Resources\AnnouncementResource;
use App\Http\Resources\VideoResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PublicController extends Controller
{
    public function getSettings()
    {
        $settings = Setting::pluck('value', 'key');
        return response()->json($settings);
    }

    public function getHomeData()
    {
        return Cache::remember('home_data', 3600, function () {
            $statsKeys = ['stats_santri', 'stats_asatidz', 'stats_alumni', 'stats_institusi'];
            $statsSettings = Setting::whereIn('key', $statsKeys)->pluck('value', 'key');

            return [
                'banners' => Banner::orderBy('order', 'asc')->get(),
                'latest_posts' => PostResource::collection(
                    Post::with(['user', 'category', 'coverImage'])
                        ->where('status', 'published')
                        ->latest()
                        ->take(4)
                        ->get()
                ),
                'agendas' => AgendaResource::collection(
                    Agenda::where('status', 'published')
                        ->where('event_date', '>=', now())
                        ->orderBy('event_date', 'asc')
                        ->take(3)
                        ->get()
                ),
                'announcements' => AnnouncementResource::collection(
                    Announcement::where('status', 'published')
                        ->latest()
                        ->take(8)
                        ->get()
                ),
                'featured_video' => new VideoResource(Video::where('is_featured', true)->first()),
                'gallery' => \App\Models\Media::where('show_in_gallery', true)->latest()->take(8)->get(),
                'stats' => [
                    'santri' => $statsSettings['stats_santri'] ?? '3.275',
                    'asatidz' => $statsSettings['stats_asatidz'] ?? '214',
                    'alumni' => $statsSettings['stats_alumni'] ?? '12.4k',
                    'institusi' => $statsSettings['stats_institusi'] ?? '6',
                ],
            ];
        });
    }

    public function getPosts(Request $request)
    {
        $query = Post::with(['user', 'category'])
            ->where('status', 'published');

        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->category) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        return PostResource::collection($query->latest()->paginate(9));
    }

    public function getPostBySlug($slug)
    {
        $post = Post::with(['user', 'category'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return new PostResource($post);
    }

    public function getPageBySlug($slug)
    {
        $page = Page::where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        if ($page->image) {
            $page->image_url = url('storage/' . $page->image);
        }

        return new PageResource($page);
    }

    public function getAgendas(Request $request)
    {
        $query = Agenda::where('status', 'published');

        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        return AgendaResource::collection($query->orderBy('event_date', 'desc')->paginate(12));
    }

    public function getAgendaBySlug($slug)
    {
        $agenda = Agenda::where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return new AgendaResource($agenda);
    }

    public function getAnnouncements(Request $request)
    {
        $query = Announcement::where('status', 'published');

        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        return AnnouncementResource::collection($query->latest()->paginate(10));
    }

    public function getAnnouncementBySlug($slug)
    {
        $announcement = Announcement::where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return new AnnouncementResource($announcement);
    }

    public function getCategories()
    {
        return response()->json(Category::orderBy('name', 'asc')->get());
    }

    public function getGallery(Request $request)
    {
        $gallery = \App\Models\Media::where('show_in_gallery', true)->latest()->paginate(24);
        return response()->json($gallery);
    }

    public function getVideos(Request $request)
    {
        $videos = Video::latest()->paginate(12);
        return VideoResource::collection($videos);
    }

    public function globalSearch(Request $request)
    {
        $q = $request->query('q');
        if (!$q) return response()->json(['posts' => [], 'agendas' => [], 'announcements' => []]);

        $posts = Post::where('status', 'published')
            ->where(function($query) use ($q) {
                $query->where('title', 'like', "%$q%")
                      ->orWhere('content', 'like', "%$q%");
            })
            ->latest()
            ->take(5)
            ->get();

        $agendas = Agenda::where('status', 'published')
            ->where(function($query) use ($q) {
                $query->where('title', 'like', "%$q%")
                      ->orWhere('content', 'like', "%$q%")
                      ->orWhere('location', 'like', "%$q%");
            })
            ->latest()
            ->take(5)
            ->get();

        $announcements = Announcement::where('status', 'published')
            ->where(function($query) use ($q) {
                $query->where('title', 'like', "%$q%")
                      ->orWhere('content', 'like', "%$q%");
            })
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'posts' => $posts,
            'agendas' => $agendas,
            'announcements' => $announcements
        ]);
    }

    public function getMenus()
    {
        return response()->json(
            Menu::with(['children' => function($q) {
                    $q->where('is_active', true)->orderBy('order');
                }])
                ->where('is_active', true)
                ->whereNull('parent_id')
                ->orderBy('order')
                ->get()
        );
    }
}
