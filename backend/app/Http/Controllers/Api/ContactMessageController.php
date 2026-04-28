<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Http\Resources\ContactMessageResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContactMessageController extends Controller
{
    /**
     * [PUBLIC] Menerima pesan masuk dari formulir kontak portal publik.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|min:10|max:5000',
        ]);

        $contact = ContactMessage::create($validated);

        return (new ContactMessageResource($contact))
            ->additional(['message' => 'Pesan Anda berhasil terkirim. Terima kasih!']);
    }

    /**
     * [ADMIN] Menampilkan semua pesan masuk (terbaru di atas).
     */
    public function index(Request $request)
    {
        $query = ContactMessage::latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $messages = $query->paginate(20);

        return ContactMessageResource::collection($messages);
    }

    /**
     * [ADMIN] Menampilkan detail satu pesan & otomatis tandai sebagai "read".
     */
    public function show(ContactMessage $contactMessage)
    {
        if ($contactMessage->status === 'unread') {
            $contactMessage->update([
                'status'  => 'read',
                'read_at' => now(),
            ]);
        }

        return new ContactMessageResource($contactMessage);
    }

    /**
     * [ADMIN] Mengubah status pesan (read / replied / unread).
     */
    public function updateStatus(Request $request, ContactMessage $contactMessage)
    {
        $validated = $request->validate([
            'status' => 'required|in:unread,read,replied',
        ]);

        $contactMessage->update($validated);

        return (new ContactMessageResource($contactMessage))
            ->additional(['message' => 'Status pesan berhasil diperbarui.']);
    }

    /**
     * [ADMIN] Menghapus pesan.
     */
    public function destroy(ContactMessage $contactMessage)
    {
        $contactMessage->delete();

        return response()->json(['message' => 'Pesan berhasil dihapus.']);
    }

    /**
     * [ADMIN] Jumlah pesan belum terbaca (untuk badge notifikasi).
     */
    public function unreadCount(): JsonResponse
    {
        $count = ContactMessage::where('status', 'unread')->count();
        return response()->json(['count' => $count]);
    }
}
