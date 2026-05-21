<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class AutomationRule extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'name', 'description', 'trigger',
        'conditions', 'actions', 'is_active', 'run_count', 'last_run_at', 'created_by',
    ];

    protected $casts = [
        'conditions'  => 'array',
        'actions'     => 'array',
        'is_active'   => 'boolean',
        'last_run_at' => 'datetime',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
