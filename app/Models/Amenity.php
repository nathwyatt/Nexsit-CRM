<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class Amenity extends Model
{
    use BelongsToCompany;

    protected $fillable = ['company_id', 'name', 'icon', 'category', 'is_active', 'position'];

    protected $casts = ['is_active' => 'boolean'];

    public function properties()
    {
        return $this->belongsToMany(Property::class, 'property_amenity');
    }
}
