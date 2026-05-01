<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

use Illuminate\Support\Str;

class Page extends Model
{
    use SoftDeletes;

    protected static function booted()
    {
        static::creating(function ($page) {
            if (!$page->slug) {
                $page->slug = Str::slug($page->title);
            }
        });

        static::updating(function ($page) {
            // Gunakan slug permanen untuk stabilitas SEO
            if (!$page->slug) {
                $page->slug = Str::slug($page->title);
            }
        });
    }

    protected $fillable = [
        'title',
        'slug',
        'meta_title',
        'meta_description',
        'content',
        'image',
        'image_id',
        'status',
    ];

    public function imageRelation(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'image_id');
    }
}
