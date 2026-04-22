<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
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

        return response()->json($media);
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

            return response()->json([
                'message' => 'Media berhasil diunggah.',
                'data' => $media
            ], 201);
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

        return response()->json([
            'message' => 'Status galeri media berhasil diperbarui.',
            'data' => $media
        ]);
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
        // Delete the physical file - removing Storage::url prefix to get the relative path
        $relativePath = str_replace('/storage/', '', $media->file_path);
        Storage::disk('public')->delete($relativePath);

        $media->delete();

        return response()->json([
            'message' => 'Media berhasil dihapus.'
        ]);
    }
}
