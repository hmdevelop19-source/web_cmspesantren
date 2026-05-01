<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Http\Requests\StoreFacilityRequest;
use App\Http\Requests\UpdateFacilityRequest;
use App\Http\Resources\FacilityResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class FacilityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Facility::with('image')->orderBy('order');

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        return FacilityResource::collection($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFacilityRequest $request)
    {
        $facility = Facility::create($request->validated());
        
        Cache::forget('site_home_data'); // Clear home cache if facilities are shown there
        
        return new FacilityResource($facility);
    }

    /**
     * Display the specified resource.
     */
    public function show(Facility $facility)
    {
        return new FacilityResource($facility->load('image'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFacilityRequest $request, Facility $facility)
    {
        $facility->update($request->validated());
        
        Cache::forget('site_home_data');
        
        return new FacilityResource($facility);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Facility $facility)
    {
        $facility->delete();
        
        Cache::forget('site_home_data');
        
        return response()->noContent();
    }
}
