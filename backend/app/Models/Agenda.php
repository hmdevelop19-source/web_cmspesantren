<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Str;

class Agenda extends Model
{
    protected static function booted()
    {
        static::creating(function ($agenda) {
            if (!$agenda->slug) {
                $agenda->slug = Str::slug($agenda->title) . '-' . Str::random(5);
            }
        });

        static::updating(function ($agenda) {
            if ($agenda->isDirty('title') && !$agenda->isDirty('slug')) {
                $agenda->slug = Str::slug($agenda->title) . '-' . Str::random(5);
            }
        });
    }

    protected $fillable = [
        'title',
        'slug',
        'content',
        'location',
        'event_date',
        'status',
    ];

    protected $casts = [
        'event_date' => 'date',
    ];
}
