<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $posts = Post::with(['category', 'user'])
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate($request->per_page ?? 10);

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'content' => 'required',
            'cover_image' => 'nullable|string',
            'cover_image_id' => 'nullable|exists:media,id',
            'status' => 'required|in:published,draft',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        $validated['user_id'] = $request->user()->id;
        
        if ($validated['status'] === 'published') {
            $validated['published_at'] = now();
        }

        $post = Post::create($validated);

        return response()->json([
            'message' => 'Berita berhasil diterbitkan.',
            'data' => $post->load(['category', 'user', 'coverImage'])
        ], 201);
    }

    public function show(Post $post)
    {
        return response()->json($post->load(['category', 'user', 'coverImage']));
    }

    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'content' => 'required',
            'cover_image' => 'nullable|string',
            'cover_image_id' => 'nullable|exists:media,id',
            'status' => 'required|in:published,draft',
        ]);

        if ($post->title !== $validated['title']) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        }

        if ($validated['status'] === 'published' && !$post->published_at) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        return response()->json([
            'message' => 'Berita berhasil diperbarui.',
            'data' => $post->load(['category', 'user', 'coverImage'])
        ]);
    }

    public function destroy(Post $post)
    {
        $post->delete();

        return response()->json([
            'message' => 'Berita berhasil dihapus.'
        ]);
    }
}
