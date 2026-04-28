<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index()
    {
        return response()->json(
            Menu::with('children')
                ->whereNull('parent_id')
                ->orderBy('order')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'url' => 'required|string',
            'order' => 'integer',
            'is_active' => 'boolean',
            'parent_id' => 'nullable|exists:menus,id',
        ]);

        $menu = Menu::create($validated);

        return response()->json($menu, 201);
    }

    public function show(Menu $menu)
    {
        return response()->json($menu->load('children'));
    }

    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'label' => 'string|max:255',
            'url' => 'string',
            'order' => 'integer',
            'is_active' => 'boolean',
            'parent_id' => 'nullable|exists:menus,id',
        ]);

        $menu->update($validated);

        return response()->json($menu);
    }

    public function destroy(Menu $menu)
    {
        $menu->delete();
        return response()->json(null, 204);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'menus' => 'required|array',
            'menus.*.id' => 'required|exists:menus,id',
            'menus.*.order' => 'required|integer',
        ]);

        foreach ($request->menus as $item) {
            Menu::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Menu reordered successfully']);
    }
}
