<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'name', 'slug', 'logo', 'settings', 'is_active',
        'email', 'phone', 'address', 'city', 'country', 'timezone', 'trial_ends_at',
    ];

    protected $casts = [
        'settings'      => 'array',
        'is_active'     => 'boolean',
        'trial_ends_at' => 'datetime',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }

    public function properties()
    {
        return $this->hasMany(Property::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    public function deals()
    {
        return $this->hasMany(Deal::class);
    }

    public function pipelines()
    {
        return $this->hasMany(Pipeline::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class)->latest();
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->whereIn('status', ['active', 'trial'])
            ->latest();
    }

    public function currentPlan(): ?Plan
    {
        return $this->activeSubscription?->plan;
    }

    public function isSubscriptionActive(): bool
    {
        return $this->subscriptions()
            ->whereIn('status', ['active', 'trial'])
            ->exists();
    }
}
