<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = ['role', 'menu', 'can_access'];

    protected $casts = [
        'can_access' => 'boolean',
    ];
}
