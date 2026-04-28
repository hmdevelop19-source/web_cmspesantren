<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use App\Http\Requests\StoreVideoRequest;
use App\Http\Requests\UpdateVideoRequest;
use App\Http\Resources\VideoResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class VideoController extends Controller
{
    public function index()
    {
        $videos = Video::latest()->paginate(12);
        return VideoResource::collection($videos);
    }

    public function store(StoreVideoRequest $request)
    {
        $validated = $request->validated();

        // Auto-fix URL protocol if missing
        if (!preg_match("~^(?:f|ht)tps?://~i", $validated['youtube_url'])) {
            $validated['youtube_url'] = "https://" . $validated['youtube_url'];
        }

        if ($validated['is_featured'] ?? false) {
            Video::where('is_featured', true)->update(['is_featured' => false]);
        }

        $video = Video::create($validated);

        Cache::forget('home_data');

        return (new VideoResource($video))
            ->additional(['message' => 'Video berhasil ditambahkan.']);
    }

    public function show(Video $video)
    {
        return new VideoResource($video);
    }

    public function update(UpdateVideoRequest $request, Video $video)
    {
        $validated = $request->validated();

        // Auto-fix URL protocol if missing
        if (!preg_match("~^(?:f|ht)tps?://~i", $validated['youtube_url'])) {
            $validated['youtube_url'] = "https://" . $validated['youtube_url'];
        }

        if ($validated['is_featured'] ?? false) {
            Video::where('id', '!=', $video->id)->update(['is_featured' => false]);
        }

        $video->update($validated);

        Cache::forget('home_data');

        return (new VideoResource($video))
            ->additional(['message' => 'Video berhasil diperbarui.']);
    }

    public function destroy(Video $video)
    {
        $video->delete();

        Cache::forget('home_data');

        return response()->json([
            'message' => 'Video berhasil dihapus.'
        ]);
    }
}
