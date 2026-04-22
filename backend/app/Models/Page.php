<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Page extends Model
{
    protected $fillable = [
        'title',
        'slug',
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
