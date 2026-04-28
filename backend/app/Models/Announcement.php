<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Str;

class Announcement extends Model
{
    protected static function booted()
    {
        static::creating(function ($announcement) {
            if (!$announcement->slug) {
                $announcement->slug = Str::slug($announcement->title) . '-' . Str::random(5);
            }
        });

        static::updating(function ($announcement) {
            if ($announcement->isDirty('title') && !$announcement->isDirty('slug')) {
                $announcement->slug = Str::slug($announcement->title) . '-' . Str::random(5);
            }
        });
    }

    protected $fillable = [
        'title',
        'slug',
        'content',
        'priority',
        'status',
    ];
}
