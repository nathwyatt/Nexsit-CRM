<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'company_id', 'plan_id', 'status', 'billing_cycle', 'payment_method',
        'starts_at', 'ends_at', 'trial_ends_at',
        'stripe_subscription_id', 'stripe_customer_id',
        'notes', 'cancelled_at',
    ];

    protected $casts = [
        'starts_at'    => 'date',
        'ends_at'      => 'date',
        'trial_ends_at' => 'datetime',
        'cancelled_at'  => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trial']);
    }

    public function statusLabel(): string
    {
        return match ($this->status) {
            'trial'    => 'Trial',
            'active'   => 'Active',
            'past_due' => 'Past Due',
            'cancelled'=> 'Cancelled',
            'expired'  => 'Expired',
            default    => 'Unknown',
        };
    }
}
