<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class PropertyUnit extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'property_id', 'unit_number', 'floor', 'bedrooms', 'bathrooms',
        'area_sqm', 'status', 'rent_price', 'notes',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
