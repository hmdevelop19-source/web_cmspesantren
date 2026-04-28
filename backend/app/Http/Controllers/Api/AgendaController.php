<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use App\Http\Requests\StoreAgendaRequest;
use App\Http\Requests\UpdateAgendaRequest;
use App\Http\Resources\AgendaResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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

        return AgendaResource::collection($agendas);
    }

    public function store(StoreAgendaRequest $request)
    {
        $validated = $request->validated();
        $agenda = Agenda::create($validated);

        Cache::forget('home_data');

        return (new AgendaResource($agenda))
            ->additional(['message' => 'Agenda berhasil ditambahkan.']);
    }

    public function show(Agenda $agenda)
    {
        return new AgendaResource($agenda);
    }

    public function update(UpdateAgendaRequest $request, Agenda $agenda)
    {
        $validated = $request->validated();

        $agenda->update($validated);

        Cache::forget('home_data');

        return (new AgendaResource($agenda))
            ->additional(['message' => 'Agenda berhasil diperbarui.']);
    }

    public function destroy(Agenda $agenda)
    {
        $agenda->delete();

        Cache::forget('home_data');

        return response()->json([
            'message' => 'Agenda berhasil dihapus.'
        ]);
    }
}
