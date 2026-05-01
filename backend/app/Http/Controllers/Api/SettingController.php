<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'site_name' => 'nullable|string|max:255',
            'site_tagline' => 'nullable|string|max:255',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'site_logo' => 'nullable|string',
            'site_address' => 'nullable|string',
            'facebook_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'youtube_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
            'stats_santri' => 'nullable|string|max:50',
            'stats_asatidz' => 'nullable|string|max:50',
            'stats_alumni' => 'nullable|string|max:50',
            'stats_institusi' => 'nullable|string|max:50',
            'site_full_name' => 'nullable|string',
            'header_right_text' => 'nullable|string|max:255',
            'hide_top_bar' => 'nullable|string|max:10',
            'site_description' => 'nullable|string',
            'site_google_maps' => 'nullable|string',
            'sidebar_banner_label' => 'nullable|string|max:255',
            'sidebar_banner_title' => 'nullable|string',
            'sidebar_banner_image' => 'nullable|string',
            'site_favicon' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }


        return response()->json([
            'message' => 'Konfigurasi website berhasil diperbarui.',
            'settings' => $validated
        ]);
    }
 
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);
 
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $fileName = 'logo_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('logos', $fileName, 'public');
            $url = Storage::url($path);
 
            return response()->json([
                'message' => 'Logo berhasil diunggah.',
                'path' => $url
            ]);
        }
 
        return response()->json(['message' => 'Gagal mengunggah file.'], 400);
    }
}
