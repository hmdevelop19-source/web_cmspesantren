<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Http\Resources\Json\JsonResource::withoutWrapping();

        // Register Cache Observers
        \App\Models\Page::observe(\App\Observers\CacheObserver::class);
        \App\Models\Post::observe(\App\Observers\CacheObserver::class);
        \App\Models\Agenda::observe(\App\Observers\CacheObserver::class);
        \App\Models\Announcement::observe(\App\Observers\CacheObserver::class);
        \App\Models\Video::observe(\App\Observers\CacheObserver::class);
        \App\Models\Banner::observe(\App\Observers\CacheObserver::class);
        \App\Models\Setting::observe(\App\Observers\CacheObserver::class);
        \App\Models\Category::observe(\App\Observers\CacheObserver::class);
        \App\Models\Leader::observe(\App\Observers\CacheObserver::class);
        \App\Models\Testimonial::observe(\App\Observers\CacheObserver::class);
    }
}
