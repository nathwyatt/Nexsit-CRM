<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class Pipeline extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'name', 'type', 'description', 'is_default',
        'is_active', 'position', 'created_by',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active'  => 'boolean',
    ];

    public function stages()
    {
        return $this->hasMany(PipelineStage::class)->orderBy('position');
    }

    public function deals()
    {
        return $this->hasMany(Deal::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
