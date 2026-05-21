<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class PipelineStage extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'pipeline_id', 'name', 'description', 'color',
        'position', 'is_won_stage', 'is_lost_stage', 'probability',
    ];

    protected $casts = [
        'is_won_stage'  => 'boolean',
        'is_lost_stage' => 'boolean',
    ];

    protected $appends = ['type'];

    public function getTypeAttribute(): string
    {
        if ($this->is_won_stage) return 'won';
        if ($this->is_lost_stage) return 'lost';
        return 'open';
    }

    public function pipeline()
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function deals()
    {
        return $this->hasMany(Deal::class, 'stage_id');
    }
}
