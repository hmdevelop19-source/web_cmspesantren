<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AgendaController extends Controller
{
    public function index(Request $request)
    {
        $agendas = Agenda::when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($request->per_page ?? 10);

        return response()->json($agendas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'location' => 'nullable|string',
            'event_date' => 'required|date',
            'status' => 'required|in:published,draft',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        $agenda = Agenda::create($validated);

        return response()->json([
            'message' => 'Agenda berhasil ditambahkan.',
            'data' => $agenda
        ], 201);
    }

    public function show(Agenda $agenda)
    {
        return response()->json($agenda);
    }

    public function update(Request $request, Agenda $agenda)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'location' => 'nullable|string',
            'event_date' => 'required|date',
            'status' => 'required|in:published,draft',
        ]);

        if ($agenda->title !== $validated['title']) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        }

        $agenda->update($validated);

        return response()->json([
            'message' => 'Agenda berhasil diperbarui.',
            'data' => $agenda
        ]);
    }

    public function destroy(Agenda $agenda)
    {
        $agenda->delete();

        return response()->json([
            'message' => 'Agenda berhasil didelete.'
        ]);
    }
}
