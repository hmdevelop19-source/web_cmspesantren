<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Leader;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LeaderController extends Controller
{
    public function index()
    {
        return response()->json(Leader::orderBy('sort_order', 'asc')->get());
    }

    public function publicIndex()
    {
        return response()->json(Leader::where('is_active', true)->orderBy('sort_order', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'period' => 'required|string|max:255',
            'sort_order' => 'integer',
            'is_active' => 'sometimes',
            'photo' => 'nullable|image|max:5120',
            'message' => 'nullable|string'
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('leaders', 'public');
        }

        $leader = Leader::create($validated);
        return response()->json($leader);
    }

    public function update(Request $request, Leader $leader)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'period' => 'required|string|max:255',
            'sort_order' => 'integer',
            'is_active' => 'sometimes',
            'photo' => 'nullable|image|max:5120',
            'message' => 'nullable|string'
        ]);

        if ($request->hasFile('photo')) {
            if ($leader->photo) {
                Storage::disk('public')->delete($leader->photo);
            }
            $validated['photo'] = $request->file('photo')->store('leaders', 'public');
        }

        $leader->update($validated);
        return response()->json($leader);
    }

    public function destroy(Leader $leader)
    {
        if ($leader->photo) {
            Storage::disk('public')->delete($leader->photo);
        }
        $leader->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
