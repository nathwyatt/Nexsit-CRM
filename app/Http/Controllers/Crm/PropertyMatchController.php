<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Property;
use Inertia\Inertia;

class PropertyMatchController extends Controller
{
    public function show(Lead $lead)
    {
        $lead->load(['contact', 'assignedTo']);

        // Base query — same purpose as the lead
        $query = Property::with(['propertyType'])
            ->where('purpose', $lead->purpose);

        // Budget pre-filter with 15% upper tolerance
        if ($lead->budget_max) {
            $ceiling = $lead->budget_max * 1.15;
            if ($lead->purpose === 'buy') {
                $query->where('price', '>', 0)->where('price', '<=', $ceiling);
            } else {
                $query->where('rent_price', '>', 0)->where('rent_price', '<=', $ceiling);
            }
        }

        $properties = $query->get();

        $matches = $properties->map(function (Property $p) use ($lead) {
            $score = $this->score($p, $lead);
            $price = $lead->purpose === 'buy' ? $p->price : $p->rent_price;

            return [
                'id'            => $p->id,
                'reference'     => $p->reference,
                'title'         => $p->title,
                'property_type' => $p->propertyType?->name,
                'purpose'       => $p->purpose,
                'status'        => $p->status,
                'bedrooms'      => $p->bedrooms,
                'bathrooms'     => $p->bathrooms,
                'area_sqm'      => $p->area_sqm,
                'price'         => $price,
                'community'     => $p->community,
                'city'          => $p->city,
                'photo'         => $p->getFirstMediaUrl('photos', 'thumb'),
                'score'         => $score['total'],
                'score_detail'  => $score['detail'],
            ];
        })
        ->filter(fn ($m) => $m['score'] >= 20)
        ->sortByDesc('score')
        ->values()
        ->take(30);

        return Inertia::render('Leads/Matches', [
            'lead' => [
                'id'              => $lead->id,
                'reference'       => $lead->reference,
                'purpose'         => $lead->purpose,
                'budget_min'      => $lead->budget_min,
                'budget_max'      => $lead->budget_max,
                'bedrooms_wanted' => $lead->bedrooms_wanted,
                'status'          => $lead->status,
                'contact'         => $lead->contact ? [
                    'id'    => $lead->contact->id,
                    'name'  => $lead->contact->name,
                    'phone' => $lead->contact->phone,
                    'email' => $lead->contact->email,
                ] : null,
                'assigned_to' => $lead->assignedTo?->only('id', 'name'),
            ],
            'matches'    => $matches->values(),
            'scanned'    => $properties->count(),
        ]);
    }

    private function score(Property $property, Lead $lead): array
    {
        $total  = 0;
        $detail = [];

        // ── Budget fit (0-50 pts) ──────────────────────────────────────────────
        $price = $lead->purpose === 'buy' ? $property->price : $property->rent_price;

        if ($price && $lead->budget_max) {
            $min = $lead->budget_min ?? 0;
            $max = $lead->budget_max;

            if ($price >= $min && $price <= $max) {
                // Perfect fit — centralness bonus
                $pts = 50;
                if ($lead->budget_min && ($max - $min) > 0) {
                    $midpoint   = ($min + $max) / 2;
                    $centrality = 1 - abs($price - $midpoint) / (($max - $min) / 2) * 0.15;
                    $pts        = (int) round(50 * $centrality);
                }
                $total += $pts;
                $detail['budget'] = ['score' => $pts, 'label' => 'Within budget'];
            } elseif ($price < $min) {
                // Below minimum — client may want more
                $pts    = 38;
                $total += $pts;
                $detail['budget'] = ['score' => $pts, 'label' => 'Below budget range'];
            } elseif ($price <= $max * 1.10) {
                $pts    = 28;
                $total += $pts;
                $detail['budget'] = ['score' => $pts, 'label' => 'Slightly over budget'];
            } else {
                $pts    = 12;
                $total += $pts;
                $detail['budget'] = ['score' => $pts, 'label' => 'Over budget'];
            }
        } else {
            $total += 25;
            $detail['budget'] = ['score' => 25, 'label' => 'No budget set'];
        }

        // ── Bedroom match (0-30 pts) ──────────────────────────────────────────
        if ($lead->bedrooms_wanted !== null && $property->bedrooms !== null) {
            $diff = abs((int) $property->bedrooms - (int) $lead->bedrooms_wanted);
            $pts  = match (true) {
                $diff === 0 => 30,
                $diff === 1 => 20,
                $diff === 2 => 10,
                default     => 0,
            };
            $label = $diff === 0 ? 'Exact bedroom match' : "±{$diff} bedroom" . ($diff > 1 ? 's' : '');
        } else {
            $pts   = 15;
            $label = 'No bedroom preference';
        }
        $total += $pts;
        $detail['bedrooms'] = ['score' => $pts, 'label' => $label];

        // ── Availability (0-20 pts) ──────────────────────────────────────────
        $pts = match ($property->status) {
            'available'          => 20,
            'reserved'           => 10,
            default              => 4,
        };
        $total += $pts;
        $detail['availability'] = ['score' => $pts, 'label' => ucfirst($property->status ?? 'unknown')];

        return ['total' => min(100, $total), 'detail' => $detail];
    }
}
