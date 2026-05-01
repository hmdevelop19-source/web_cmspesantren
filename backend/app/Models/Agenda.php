<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Agenda extends Model
{
    use SoftDeletes;

    protected static function booted()
    {
        static::creating(function ($agenda) {
            if (!$agenda->slug) {
                $agenda->slug = Str::slug($agenda->title) . '-' . Str::random(5);
            }
        });

        static::updating(function ($agenda) {
            // Gunakan slug permanen untuk stabilitas SEO
            if (!$agenda->slug) {
                $agenda->slug = Str::slug($agenda->title) . '-' . Str::random(5);
            }
        });
    }

    protected $fillable = [
        'title',
        'slug',
        'meta_title',
        'meta_description',
        'content',
        'location',
        'event_date',
        'status',
    ];

    protected $casts = [
        'event_date' => 'date',
    ];
}
