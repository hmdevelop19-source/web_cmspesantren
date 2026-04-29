<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

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
            // Jangan ubah slug jika sudah ada (mencegah link rusak)
            if (!$post->slug) {
                $post->slug = Str::slug($post->title) . '-' . Str::random(5);
            }
        });

        static::saved(function () {
            Cache::forget('home_data');
            // Catatan: Untuk posts_page_* bisa dibersihkan secara massal jika menggunakan Redis tags, 
            // namun untuk file cache kita biarkan expired sendiri atau gunakan cache flushing jika diperlukan.
        });

        static::deleted(function () {
            Cache::forget('home_data');
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
