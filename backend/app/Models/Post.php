<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

use Illuminate\Support\Str;

class Post extends Model
{
    use SoftDeletes;

    protected static function booted()
    {
        static::creating(function ($post) {
            if (!$post->slug) {
                $post->slug = Str::slug($post->title) . '-' . Str::random(5);
            }
        });

        static::updating(function ($post) {
            if ($post->isDirty('title') && !$post->isDirty('slug')) {
                $post->slug = Str::slug($post->title) . '-' . Str::random(5);
            }
        });
    }

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'content',
        'cover_image',
        'cover_image_id',
        'status',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function coverImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'cover_image_id');
    }
}
