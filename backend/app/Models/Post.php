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
            // Jangan ubah slug jika sudah ada (mencegah link rusak/404)
            if (!$post->slug) {
                $post->slug = Str::slug($post->title) . '-' . Str::random(5);
            }
        });

        // Catatan: Pembersihan cache sekarang ditangani secara otomatis oleh CacheObserver
    }

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'excerpt',
        'slug',
        'meta_title',
        'meta_description',
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
