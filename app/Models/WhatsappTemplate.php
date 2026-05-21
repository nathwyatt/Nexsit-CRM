<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class WhatsappTemplate extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'name', 'module', 'body', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
