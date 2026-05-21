<?php

use Illuminate\Support\Facades\Route;

// Public API v1 — rate limited, no auth
Route::prefix('v1')->middleware('throttle:60,1')->group(function () {
    // Properties (public listing)
    Route::get('/properties', [\App\Http\Controllers\Api\PropertyController::class, 'index']);
    Route::get('/properties/featured', [\App\Http\Controllers\Api\PropertyController::class, 'featured']);
    Route::get('/properties/map', [\App\Http\Controllers\Api\PropertyController::class, 'map']);
    Route::get('/properties/{reference}', [\App\Http\Controllers\Api\PropertyController::class, 'show']);

    // Leads (website enquiry form)
    Route::post('/leads', [\App\Http\Controllers\Api\LeadController::class, 'store']);
    Route::post('/leads/valuation', [\App\Http\Controllers\Api\LeadController::class, 'valuation']);

    // Portal feeds
    Route::get('/feed/bayut.xml', [\App\Http\Controllers\Api\FeedController::class, 'bayut']);
    Route::get('/feed/propertyfinder.xml', [\App\Http\Controllers\Api\FeedController::class, 'propertyFinder']);
    Route::get('/feed/listings.json', [\App\Http\Controllers\Api\FeedController::class, 'json']);
});
