<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Relation::morphMap([
            'lead'     => \App\Models\Lead::class,
            'deal'     => \App\Models\Deal::class,
            'contact'  => \App\Models\Contact::class,
            'property' => \App\Models\Property::class,
            'tenancy'  => \App\Models\Tenancy::class,
        ]);
    }
}
