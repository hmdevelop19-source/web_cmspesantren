<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agenda extends Model
{
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
