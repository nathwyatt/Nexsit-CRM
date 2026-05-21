<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'first_name', 'last_name', 'email', 'phone', 'phone_2',
        'nationality', 'id_type', 'id_number', 'address', 'notes',
        'tags', 'assigned_to', 'created_by',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    protected $appends = ['name'];

    public function getNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function roles()
    {
        return $this->hasMany(ContactRole::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    public function deals()
    {
        return $this->hasMany(Deal::class);
    }

    public function ownedProperties()
    {
        return $this->belongsToMany(Property::class, 'property_owners', 'contact_id', 'property_id')
            ->withPivot(['ownership_pct', 'is_primary', 'notes']);
    }

    public function tenancies()
    {
        return $this->hasMany(Tenancy::class, 'tenant_id');
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

    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('first_name', 'like', "%{$term}%")
              ->orWhere('last_name', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%");
        });
    }
}
