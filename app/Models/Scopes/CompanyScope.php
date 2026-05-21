<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class CompanyScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        // hasUser() returns true only after auth is fully resolved — safe on User model.
        if (auth()->hasUser() && ($companyId = auth()->user()?->company_id)) {
            $builder->where($model->getTable() . '.company_id', $companyId);
        }
    }
}
