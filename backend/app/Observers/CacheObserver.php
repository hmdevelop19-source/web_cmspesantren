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
        
        // Increment versions for dynamic lists
        Cache::increment('cache_v_posts');
        Cache::increment('cache_v_agendas');
        Cache::increment('cache_v_announcements');
        
        // Log for debugging if needed
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
