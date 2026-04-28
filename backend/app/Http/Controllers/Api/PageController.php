<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Http\Requests\StorePageRequest;
use App\Http\Requests\UpdatePageRequest;
use App\Http\Resources\PageResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $pages = Page::with(['imageRelation'])
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($request->per_page ?? 10);

        return PageResource::collection($pages);
    }

    public function store(StorePageRequest $request)
    {
        $validated = $request->validated();
        $page = Page::create($validated);

        return (new PageResource($page->load('imageRelation')))
            ->additional(['message' => 'Halaman berhasil dibuat.']);
    }

    public function show(Page $page)
    {
        return new PageResource($page->load('imageRelation'));
    }

    public function update(UpdatePageRequest $request, Page $page)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            if ($page->image) {
                Storage::disk('public')->delete($page->image);
            }
            $path = $request->file('image')->store('pages', 'public');
            $validated['image'] = $path;
        }

        // If slug is provided and different
        if ($request->has('slug')) {
            $validated['slug'] = $request->slug;
        }

        $page->update($validated);

        return (new PageResource($page->load('imageRelation')))
            ->additional(['message' => 'Halaman berhasil diperbarui.']);
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
        $page = Page::where('slug', $slug)->with('imageRelation')->firstOrFail();
        return new PageResource($page);
    }
}
