<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $pages = Page::when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($request->per_page ?? 10);

        return response()->json($pages);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required',
            'status' => 'required|in:published,draft',
            'slug' => 'nullable|string|unique:pages,slug',
            'image_id' => 'nullable|exists:media,id',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['title']);
        $page = Page::create($validated);

        return response()->json([
            'message' => 'Halaman berhasil dibuat.',
            'data' => $page->load('imageRelation')
        ], 201);
    }

    public function show(Page $page)
    {
        return response()->json($page->load('imageRelation'));
    }

    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required',
            'status' => 'required|in:published,draft',
            'slug' => 'nullable|string|unique:pages,slug,' . $page->id,
            'image' => 'nullable|image|max:2048',
            'image_id' => 'nullable|exists:media,id',
        ]);

        if ($request->hasFile('image')) {
            if ($page->image) {
                Storage::disk('public')->delete($page->image);
            }
            $path = $request->file('image')->store('pages', 'public');
            $validated['image'] = $path;
        }

        // If slug is provided and different, or if title changed and no slug provided
        if ($request->has('slug')) {
            $validated['slug'] = $request->slug;
        } elseif ($page->title !== ($validated['title'] ?? $page->title)) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $page->update($validated);

        return response()->json([
            'message' => 'Halaman berhasil diperbarui.',
            'data' => $page->load('imageRelation')
        ]);
    }

    public function destroy(Page $page)
    {
        $page->delete();

        return response()->json([
            'message' => 'Halaman berhasil dihapus.'
        ]);
    }

    public function getBySlug($slug)
    {
        $page = Page::where('slug', $slug)->with('imageRelation')->first();
        return response()->json($page);
    }
}
