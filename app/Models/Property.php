<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Property extends Model implements HasMedia
{
    use InteractsWithMedia, BelongsToCompany;

    protected $fillable = [
        'company_id', 'reference', 'title', 'description', 'property_type_id',
        'purpose', 'status', 'bedrooms', 'bathrooms', 'area_sqm',
        'floor', 'total_floors', 'building', 'community', 'city', 'country',
        'latitude', 'longitude', 'price', 'rent_price', 'rent_frequency',
        'service_charge', 'is_furnished', 'is_published', 'published_at',
        'featured_until', 'permit_number', 'meta_title', 'meta_description',
        'assigned_to', 'created_by',
    ];

    protected $casts = [
        'is_furnished'  => 'boolean',
        'is_published'  => 'boolean',
        'published_at'  => 'datetime',
        'featured_until' => 'datetime',
        'price'         => 'decimal:2',
        'rent_price'    => 'decimal:2',
        'area_sqm'      => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (Property $property) {
            if (empty($property->reference)) {
                $property->reference = 'NST-TMP-' . uniqid();
            }
        });

        static::created(function (Property $property) {
            $property->updateQuietly([
                'reference' => 'NST-' . str_pad($property->id, 6, '0', STR_PAD_LEFT),
            ]);
        });
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photos')->useDisk('public');
        $this->addMediaCollection('floor_plans')->useDisk('public');
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(400)->height(300)
            ->performOnCollections('photos');
    }

    // Relationships
    public function propertyType()
    {
        return $this->belongsTo(PropertyType::class);
    }

    public function amenities()
    {
        return $this->belongsToMany(Amenity::class, 'property_amenity');
    }

    public function owners()
    {
        return $this->hasMany(PropertyOwner::class);
    }

    public function units()
    {
        return $this->hasMany(PropertyUnit::class);
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

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }
}
