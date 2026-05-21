<?php

namespace App\Traits;

use App\Models\Company;
use App\Models\Scopes\CompanyScope;

trait BelongsToCompany
{
    protected static function bootBelongsToCompany(): void
    {
        static::addGlobalScope(new CompanyScope());

        static::creating(function ($model) {
            if (!$model->company_id && auth()->hasUser()) {
                $model->company_id = auth()->user()->company_id;
            }
        });
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
