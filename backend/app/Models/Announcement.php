<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Announcement extends Model
{
    use SoftDeletes;

    protected static function booted()
    {
        static::creating(function ($announcement) {
            if (!$announcement->slug) {
                $announcement->slug = Str::slug($announcement->title) . '-' . Str::random(5);
            }
        });

        static::updating(function ($announcement) {
            // Gunakan slug permanen untuk stabilitas SEO
            if (!$announcement->slug) {
                $announcement->slug = Str::slug($announcement->title) . '-' . Str::random(5);
            }
        });
    }

    protected $fillable = [
        'title',
        'slug',
        'meta_title',
        'meta_description',
        'content',
        'priority',
        'status',
    ];
}
