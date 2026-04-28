<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::orderBy('order')->get();
        return response()->json($banners);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image_path' => 'required|string',
            'link_url' => 'nullable|string',
            'order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $banner = Banner::create($validated);

        Cache::forget('home_data');

        return response()->json([
            'message' => 'Banner hero berhasil ditambahkan.',
            'data' => $banner
        ], 201);
    }

    public function show(Banner $banner)
    {
        return response()->json($banner);
    }

    public function update(Request $request, Banner $banner)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'image_path' => 'required|string',
            'link_url' => 'nullable|string',
            'order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $banner->update($validated);

        Cache::forget('home_data');

        return response()->json([
            'message' => 'Banner hero berhasil diperbarui.',
            'data' => $banner
        ]);
    }

    public function destroy(Banner $banner)
    {
        $banner->delete();

        Cache::forget('home_data');

        return response()->json([
            'message' => 'Banner hero berhasil dihapus.'
        ]);
    }
}
