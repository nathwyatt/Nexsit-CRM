<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class PropertyViewing extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'property_id', 'contact_id', 'lead_id', 'assigned_to',
        'scheduled_at', 'duration_minutes', 'status', 'notes', 'feedback',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', ['scheduled', 'confirmed'])->where('scheduled_at', '>=', now());
    }

    public function scopePast($query)
    {
        return $query->whereIn('status', ['completed', 'cancelled', 'no_show'])
                     ->orWhere(fn ($q) => $q->whereIn('status', ['scheduled', 'confirmed'])->where('scheduled_at', '<', now()));
    }
}
