<?php

namespace App\Observers;

use Illuminate\Support\Facades\Cache;

class CacheObserver
{
    /**
     * Handle events that should clear the cache.
     */
    public function handle(): void
    {
        // Clear main home data
        Cache::forget('home_data');
        Cache::forget('site_menus');
        Cache::forget('site_settings');
        
        // Increment versions for dynamic lists
        Cache::increment('cache_v_posts');
        Cache::increment('cache_v_agendas');
        Cache::increment('cache_v_announcements');
        Cache::increment('cache_v_leaders');
        Cache::increment('cache_v_testimonials');
        
        // Log for debugging
        // \Log::info('Cache automatically cleared by Observer');
    }

    public function saved($model): void
    {
        $this->handle();
    }

    public function deleted($model): void
    {
        $this->handle();
    }

    public function restored($model): void
    {
        $this->handle();
    }
}
