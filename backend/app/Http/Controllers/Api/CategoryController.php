<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return CategoryResource::collection(Category::orderBy('name')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CategoryRequest $request)
    {
        $validated = $request->validated();
        $validated['slug'] = Str::slug($validated['name']);

        $category = Category::create($validated);

        return (new CategoryResource($category))
            ->additional(['message' => 'Kategori berhasil ditambahkan.']);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CategoryRequest $request, Category $category)
    {
        $validated = $request->validated();
        $validated['slug'] = Str::slug($validated['name']);

        $category->update($validated);

        return (new CategoryResource($category))
            ->additional(['message' => 'Kategori berhasil diperbarui.']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'message' => 'Kategori berhasil dihapus.'
        ]);
    }
}
