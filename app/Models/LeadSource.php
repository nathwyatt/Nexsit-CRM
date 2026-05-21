<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class LeadSource extends Model
{
    use HasSlug, BelongsToCompany;

    protected $fillable = ['company_id', 'name', 'slug', 'icon', 'is_active', 'position'];

    protected $casts = ['is_active' => 'boolean'];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()->generateSlugsFrom('name')->saveSlugsTo('slug');
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }
}
