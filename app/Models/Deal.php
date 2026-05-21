<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class Deal extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'reference', 'pipeline_id', 'stage_id', 'contact_id', 'property_id',
        'lead_id', 'title', 'type', 'status', 'value', 'commission_pct',
        'commission', 'currency', 'expected_close_date', 'closed_at',
        'lost_reason', 'assigned_to', 'created_by',
    ];

    protected $casts = [
        'value'               => 'decimal:2',
        'commission_pct'      => 'decimal:2',
        'commission'          => 'decimal:2',
        'expected_close_date' => 'date',
        'closed_at'           => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Deal $deal) {
            if (empty($deal->reference)) {
                $deal->reference = 'DEAL-TMP-' . uniqid();
            }
        });

        static::created(function (Deal $deal) {
            $deal->updateQuietly([
                'reference' => 'DEAL-' . str_pad($deal->id, 6, '0', STR_PAD_LEFT),
            ]);
        });
    }

    public function pipeline()
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function stage()
    {
        return $this->belongsTo(PipelineStage::class, 'stage_id');
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tasks()
    {
        return $this->morphMany(Task::class, 'taskable');
    }

    public function activities()
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
