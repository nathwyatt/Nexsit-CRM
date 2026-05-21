<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::with(['propertyType', 'amenities', 'media'])
            ->where('is_published', true)
            ->latest('published_at');

        if ($request->filled('q')) {
            $term = $request->q;
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('reference', 'like', "%{$term}%")
                  ->orWhere('community', 'like', "%{$term}%")
                  ->orWhere('building', 'like', "%{$term}%")
                  ->orWhere('city', 'like', "%{$term}%");
            });
        }

        if ($request->filled('purpose')) {
            $query->where('purpose', $request->purpose);
        }

        if ($request->filled('type')) {
            $query->whereHas('propertyType', fn ($q) =>
                $q->where('slug', $request->type)->orWhere('id', $request->type)
            );
        }

        if ($request->filled('bedrooms')) {
            $query->where('bedrooms', $request->bedrooms);
        }

        if ($request->filled('price_min')) {
            $query->where(fn ($q) => $q
                ->where('price', '>=', $request->price_min)
                ->orWhere('rent_price', '>=', $request->price_min)
            );
        }

        if ($request->filled('price_max')) {
            $query->where(fn ($q) => $q
                ->where('price', '<=', $request->price_max)
                ->orWhere('rent_price', '<=', $request->price_max)
            );
        }

        if ($request->filled('city')) {
            $query->where('city', 'like', "%{$request->city}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sort = $request->get('sort', 'newest');
        match ($sort) {
            'price_asc'  => $query->orderBy('price')->orderBy('rent_price'),
            'price_desc' => $query->orderByDesc('price')->orderByDesc('rent_price'),
            'oldest'     => $query->oldest('published_at'),
            default      => $query->latest('published_at'),
        };

        $perPage = min((int) $request->get('per_page', 20), 100);

        return PropertyResource::collection($query->paginate($perPage));
    }

    public function show(string $reference)
    {
        $property = Property::with(['propertyType', 'amenities', 'units', 'media'])
            ->where('is_published', true)
            ->where('reference', $reference)
            ->firstOrFail();

        return new PropertyResource($property);
    }

    public function featured()
    {
        $properties = Property::with(['propertyType', 'amenities', 'media'])
            ->where('is_published', true)
            ->where('featured_until', '>=', now())
            ->orderByDesc('featured_until')
            ->limit(12)
            ->get();

        return PropertyResource::collection($properties);
    }

    public function map()
    {
        $properties = Property::select([
                'id', 'reference', 'latitude', 'longitude',
                'price', 'rent_price', 'purpose', 'status', 'bedrooms',
            ])
            ->where('is_published', true)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->limit(500)
            ->get()
            ->map(fn ($p) => [
                'id'         => $p->id,
                'reference'  => $p->reference,
                'latitude'   => (float) $p->latitude,
                'longitude'  => (float) $p->longitude,
                'price'      => $p->price !== null ? (float) $p->price : null,
                'rent_price' => $p->rent_price !== null ? (float) $p->rent_price : null,
                'purpose'    => $p->purpose,
                'status'     => $p->status,
                'bedrooms'   => $p->bedrooms,
            ]);

        return response()->json(['data' => $properties]);
    }
}
