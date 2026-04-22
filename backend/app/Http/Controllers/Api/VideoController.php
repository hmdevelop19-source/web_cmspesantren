<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    public function index()
    {
        $videos = Video::latest()->paginate(12);
        return response()->json($videos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'youtube_url' => 'required|string',
            'is_featured' => 'boolean',
        ]);

        // Auto-fix URL protocol if missing
        if (!preg_match("~^(?:f|ht)tps?://~i", $validated['youtube_url'])) {
            $validated['youtube_url'] = "https://" . $validated['youtube_url'];
        }

        if ($validated['is_featured'] ?? false) {
            Video::where('is_featured', true)->update(['is_featured' => false]);
        }

        $video = Video::create($validated);

        return response()->json([
            'message' => 'Video berhasil ditambahkan.',
            'data' => $video
        ], 201);
    }

    public function show(Video $video)
    {
        return response()->json($video);
    }

    public function update(Request $request, Video $video)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'youtube_url' => 'required|string',
            'is_featured' => 'boolean',
        ]);

        // Auto-fix URL protocol if missing
        if (!preg_match("~^(?:f|ht)tps?://~i", $validated['youtube_url'])) {
            $validated['youtube_url'] = "https://" . $validated['youtube_url'];
        }

        if ($validated['is_featured'] ?? false) {
            Video::where('id', '!=', $video->id)->update(['is_featured' => false]);
        }

        $video->update($validated);

        return response()->json([
            'message' => 'Video berhasil diperbarui.',
            'data' => $video
        ]);
    }

    public function destroy(Video $video)
    {
        $video->delete();

        return response()->json([
            'message' => 'Video berhasil dihapus.'
        ]);
    }
}
