<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class Tenancy extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'reference', 'property_id', 'unit_id', 'tenant_id', 'deal_id',
        'start_date', 'end_date', 'rent_amount', 'rent_frequency', 'deposit_amount',
        'deposit_returned_at', 'status', 'auto_renew', 'renewal_notice_days',
        'termination_date', 'termination_reason', 'notes', 'created_by',
    ];

    protected $casts = [
        'start_date'           => 'date',
        'end_date'             => 'date',
        'termination_date'     => 'date',
        'deposit_returned_at'  => 'datetime',
        'rent_amount'          => 'decimal:2',
        'deposit_amount'       => 'decimal:2',
        'auto_renew'           => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Tenancy $tenancy) {
            if (empty($tenancy->reference)) {
                $tenancy->reference = 'TEN-TMP-' . uniqid();
            }
        });

        static::created(function (Tenancy $tenancy) {
            $tenancy->updateQuietly([
                'reference' => 'TEN-' . str_pad($tenancy->id, 6, '0', STR_PAD_LEFT),
            ]);
        });
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function unit()
    {
        return $this->belongsTo(PropertyUnit::class, 'unit_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Contact::class, 'tenant_id');
    }

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payments()
    {
        return $this->hasMany(TenancyPayment::class)->orderBy('due_date');
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpiringSoon($query, int $days = 90)
    {
        return $query->where('status', 'active')
            ->whereDate('end_date', '<=', now()->addDays($days));
    }
}
