<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    use BelongsToCompany;

    protected $fillable = ['company_id', 'name', 'requires_expiry', 'is_active', 'position'];

    protected $casts = [
        'requires_expiry' => 'boolean',
        'is_active'       => 'boolean',
    ];

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}
