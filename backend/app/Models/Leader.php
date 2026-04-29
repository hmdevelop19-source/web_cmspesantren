<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Leader extends Model
{
    protected $fillable = [
        'name',
        'photo',
        'period',
        'sort_order',
        'is_active',
    ];
}
