<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Http\Requests\StoreAnnouncementRequest;
use App\Http\Requests\UpdateAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $announcements = Announcement::when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($request->per_page ?? 10);

        return AnnouncementResource::collection($announcements);
    }

    public function store(StoreAnnouncementRequest $request)
    {
        $validated = $request->validated();
        $announcement = Announcement::create($validated);


        return (new AnnouncementResource($announcement))
            ->additional(['message' => 'Pengumuman berhasil diterbitkan.']);
    }

    public function show(Announcement $announcement)
    {
        return new AnnouncementResource($announcement);
    }

    public function update(UpdateAnnouncementRequest $request, Announcement $announcement)
    {
        $validated = $request->validated();

        $announcement->update($validated);


        return (new AnnouncementResource($announcement))
            ->additional(['message' => 'Pengumuman berhasil diperbarui.']);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();


        return response()->json([
            'message' => 'Pengumuman berhasil dihapus.'
        ]);
    }
}
