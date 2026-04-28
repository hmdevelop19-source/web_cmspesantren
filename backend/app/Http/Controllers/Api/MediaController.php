<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Http\Resources\MediaResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $query = Media::latest();

        if ($request->has('search')) {
            $query->where('file_name', 'like', '%' . $request->search . '%');
        }

        $media = $query->paginate($request->per_page ?? 24);

        return MediaResource::collection($media);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('uploads', $fileName, 'public');

            $media = Media::create([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => Storage::url($path),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);

            return (new MediaResource($media))
                ->additional(['message' => 'Media berhasil diunggah.']);
        }

        return response()->json(['message' => 'Gagal mengunggah file.'], 400);
    }

    public function update(Request $request, Media $media)
    {
        $validated = $request->validate([
            'show_in_gallery' => 'sometimes|boolean',
            'category' => 'sometimes|nullable|string',
        ]);

        $media->update($validated);

        return (new MediaResource($media))
            ->additional(['message' => 'Status galeri media berhasil diperbarui.']);
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:media,id',
            'show_in_gallery' => 'sometimes|boolean',
            'category' => 'sometimes|nullable|string',
        ]);

        $data = [];
        if ($request->has('show_in_gallery')) $data['show_in_gallery'] = $request->show_in_gallery;
        if ($request->has('category')) $data['category'] = $request->category;

        Media::whereIn('id', $request->ids)->update($data);

        return response()->json(['message' => 'Status media berhasil diperbarui secara massal.']);
    }

    public function destroy(Media $media)
    {
        $isUsedInPost = \App\Models\Post::where('cover_image_id', $media->id)->exists();
        $isUsedInPage = \App\Models\Page::where('image_id', $media->id)->exists();
        
        if ($isUsedInPost || $isUsedInPage) {
            return response()->json(['message' => 'Gagal: Media ini sedang digunakan oleh Artikel atau Halaman.'], 400);
        }

        // Delete the physical file - removing Storage::url prefix to get the relative path
        $relativePath = str_replace('/storage/', '', $media->file_path);
        Storage::disk('public')->delete($relativePath);

        $media->delete();

        return response()->json([
            'message' => 'Media berhasil dihapus.'
        ]);
    }
}
