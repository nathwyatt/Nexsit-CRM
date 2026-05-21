<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name', 'slug', 'description',
        'price_monthly', 'price_yearly',
        'max_users', 'max_properties', 'max_leads',
        'features', 'badge_color',
        'is_active', 'is_featured',
        'stripe_price_id_monthly', 'stripe_price_id_yearly',
        'sort_order',
    ];

    protected $casts = [
        'features'     => 'array',
        'is_active'    => 'boolean',
        'is_featured'  => 'boolean',
        'price_monthly' => 'decimal:2',
        'price_yearly'  => 'decimal:2',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function isUnlimited(string $resource): bool
    {
        $col = "max_{$resource}";
        return $this->$col === null;
    }
}
