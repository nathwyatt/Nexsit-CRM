<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $photos     = $this->getMedia('photos');
        $floorPlans = $this->getMedia('floor_plans');
        $firstPhoto = $photos->first();

        return [
            'id'               => $this->id,
            'reference'        => $this->reference,
            'title'            => $this->title,
            'description'      => $this->description,
            'type'             => $this->propertyType?->name,
            'type_slug'        => $this->propertyType?->slug,
            'purpose'          => $this->purpose,
            'status'           => $this->status,
            'bedrooms'         => $this->bedrooms,
            'bathrooms'        => $this->bathrooms,
            'area_sqm'         => $this->area_sqm !== null ? (float) $this->area_sqm : null,
            'floor'            => $this->floor,
            'total_floors'     => $this->total_floors,
            'building'         => $this->building,
            'community'        => $this->community,
            'city'             => $this->city,
            'country'          => $this->country,
            'latitude'         => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude'        => $this->longitude !== null ? (float) $this->longitude : null,
            'price'            => $this->price !== null ? (float) $this->price : null,
            'rent_price'       => $this->rent_price !== null ? (float) $this->rent_price : null,
            'rent_frequency'   => $this->rent_frequency,
            'is_furnished'     => $this->is_furnished,
            'permit_number'    => $this->permit_number,
            'meta_title'       => $this->meta_title,
            'meta_description' => $this->meta_description,
            'featured_until'   => $this->featured_until?->toDateString(),
            'published_at'     => $this->published_at?->toDateString(),

            // Photos
            'photo_thumb' => $firstPhoto?->getUrl('thumb'),
            'photo_url'   => $firstPhoto?->getUrl(),
            'photos'      => $photos->map(fn ($m) => [
                'id'    => $m->id,
                'url'   => $m->getUrl(),
                'thumb' => $m->getUrl('thumb'),
            ])->values(),
            'floor_plans' => $floorPlans->map(fn ($m) => [
                'id'  => $m->id,
                'url' => $m->getUrl(),
                'name' => $m->name,
            ])->values(),

            // Relations (conditionally included when loaded)
            'amenities' => $this->whenLoaded('amenities', fn () =>
                $this->amenities->map(fn ($a) => [
                    'name'     => $a->name,
                    'icon'     => $a->icon,
                    'category' => $a->category,
                ])->values()
            ),
            'units' => $this->whenLoaded('units', fn () =>
                $this->units->map(fn ($u) => [
                    'id'          => $u->id,
                    'unit_number' => $u->unit_number,
                    'floor'       => $u->floor,
                    'bedrooms'    => $u->bedrooms,
                    'bathrooms'   => $u->bathrooms,
                    'area_sqm'    => $u->area_sqm !== null ? (float) $u->area_sqm : null,
                    'status'      => $u->status,
                    'rent_price'  => $u->rent_price !== null ? (float) $u->rent_price : null,
                ])->values()
            ),
        ];
    }
}
