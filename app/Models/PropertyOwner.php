<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class PropertyOwner extends Model
{
    use BelongsToCompany;

    public $timestamps = false;

    protected $fillable = [
        'company_id', 'property_id', 'contact_id', 'ownership_pct', 'is_primary', 'notes',
    ];

    protected $casts = [
        'is_primary'    => 'boolean',
        'ownership_pct' => 'decimal:2',
        'created_at'    => 'datetime',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }
}
