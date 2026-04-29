<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index()
    {
        return response()->json(Testimonial::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tahun_mondok' => 'required|string|max:255',
            'content' => 'required|string',
            'avatar' => 'nullable|string',
            'status' => 'required|string|in:published,draft',
        ]);

        $testimonial = Testimonial::create($validated);

        return response()->json([
            'message' => 'Testimoni berhasil ditambahkan.',
            'data' => $testimonial
        ], 201);
    }

    public function show(Testimonial $testimonial)
    {
        return response()->json($testimonial);
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'tahun_mondok' => 'required|string|max:255',
            'content' => 'required|string',
            'avatar' => 'nullable|string',
            'status' => 'required|string|in:published,draft',
        ]);

        $testimonial->update($validated);

        return response()->json([
            'message' => 'Testimoni berhasil diperbarui.',
            'data' => $testimonial
        ]);
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();
        return response()->json(['message' => 'Testimoni berhasil dihapus.']);
    }
}
