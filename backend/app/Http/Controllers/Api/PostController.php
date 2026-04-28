<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $posts = Post::with(['category', 'user', 'coverImage'])
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate($request->per_page ?? 10);

        return PostResource::collection($posts);
    }

    public function store(StorePostRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->id;
        
        if ($validated['status'] === 'published') {
            $validated['published_at'] = now();
        }

        $post = Post::create($validated);

        Cache::forget('home_data');

        return (new PostResource($post->load(['category', 'user', 'coverImage'])))
            ->additional(['message' => 'Berita berhasil diterbitkan.']);
    }

    public function show(Post $post)
    {
        return new PostResource($post->load(['category', 'user', 'coverImage']));
    }

    public function update(UpdatePostRequest $request, Post $post)
    {
        $validated = $request->validated();

        if ($validated['status'] === 'published' && !$post->published_at) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        Cache::forget('home_data');

        return (new PostResource($post->load(['category', 'user', 'coverImage'])))
            ->additional(['message' => 'Berita berhasil diperbarui.']);
    }

    public function destroy(Post $post)
    {
        $post->delete();

        Cache::forget('home_data');

        return response()->json([
            'message' => 'Berita berhasil dihapus.'
        ]);
    }
}
