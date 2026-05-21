<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class PropertyType extends Model
{
    use HasSlug, BelongsToCompany;

    protected $fillable = ['company_id', 'name', 'slug', 'icon', 'is_active', 'position'];

    protected $casts = ['is_active' => 'boolean'];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()->generateSlugsFrom('name')->saveSlugsTo('slug');
    }

    public function properties()
    {
        return $this->hasMany(Property::class);
    }
}
