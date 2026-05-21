<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'reference', 'contact_id', 'lead_source_id', 'source_detail',
        'status', 'property_id', 'purpose', 'budget_min', 'budget_max',
        'bedrooms_wanted', 'message', 'assigned_to',
        'converted_at', 'converted_to_deal', 'lost_reason',
    ];

    protected $casts = [
        'budget_min'    => 'decimal:2',
        'budget_max'    => 'decimal:2',
        'converted_at'  => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Lead $lead) {
            if (empty($lead->reference)) {
                $lead->reference = 'LEAD-TMP-' . uniqid();
            }
        });

        static::created(function (Lead $lead) {
            $lead->updateQuietly([
                'reference' => 'LEAD-' . str_pad($lead->id, 6, '0', STR_PAD_LEFT),
            ]);
        });
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function source()
    {
        return $this->belongsTo(LeadSource::class, 'lead_source_id');
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function convertedDeal()
    {
        return $this->belongsTo(Deal::class, 'converted_to_deal');
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

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('reference', 'like', "%{$term}%")
              ->orWhereHas('contact', fn ($c) =>
                  $c->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%")
              );
        });
    }
}
