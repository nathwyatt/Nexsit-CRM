<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Property;
use App\Models\Tenancy;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request)
    {
        $q = trim($request->string('q'));

        if (mb_strlen($q) < 2) {
            return response()->json([]);
        }

        $companyId = auth()->user()->company_id;
        $like      = "%{$q}%";
        $results   = [];

        // Contacts
        Contact::where('company_id', $companyId)
            ->where(fn ($w) => $w
                ->where('first_name', 'like', $like)
                ->orWhere('last_name', 'like', $like)
                ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$like])
                ->orWhere('email', 'like', $like)
                ->orWhere('phone', 'like', $like))
            ->limit(5)
            ->get(['id', 'first_name', 'last_name', 'email', 'phone'])
            ->each(function ($c) use (&$results) {
                $results[] = [
                    'type'  => 'contact',
                    'icon'  => 'contact',
                    'label' => trim("{$c->first_name} {$c->last_name}"),
                    'sub'   => $c->email ?? $c->phone ?? '',
                    'url'   => "/contacts/{$c->id}",
                ];
            });

        // Leads
        Lead::where('company_id', $companyId)
            ->where(fn ($w) => $w
                ->where('reference', 'like', $like)
                ->orWhereHas('contact', fn ($cq) => $cq
                    ->where('first_name', 'like', $like)
                    ->orWhere('last_name', 'like', $like)
                    ->orWhere('email', 'like', $like)))
            ->with('contact:id,first_name,last_name')
            ->limit(5)
            ->get(['id', 'reference', 'contact_id', 'status'])
            ->each(function ($l) use (&$results) {
                $name = $l->contact ? trim("{$l->contact->first_name} {$l->contact->last_name}") : null;
                $results[] = [
                    'type'  => 'lead',
                    'icon'  => 'lead',
                    'label' => $l->reference . ($name ? " — {$name}" : ''),
                    'sub'   => ucfirst($l->status),
                    'url'   => "/leads/{$l->id}",
                ];
            });

        // Deals
        Deal::where('company_id', $companyId)
            ->where(fn ($w) => $w
                ->where('reference', 'like', $like)
                ->orWhere('title', 'like', $like))
            ->limit(5)
            ->get(['id', 'reference', 'title', 'status'])
            ->each(function ($d) use (&$results) {
                $results[] = [
                    'type'  => 'deal',
                    'icon'  => 'deal',
                    'label' => $d->title ?? $d->reference,
                    'sub'   => $d->reference . ' · ' . ucfirst($d->status),
                    'url'   => "/deals/{$d->id}",
                ];
            });

        // Properties
        Property::where('company_id', $companyId)
            ->where(fn ($w) => $w
                ->where('reference', 'like', $like)
                ->orWhere('title', 'like', $like)
                ->orWhere('building', 'like', $like)
                ->orWhere('community', 'like', $like))
            ->limit(5)
            ->get(['id', 'reference', 'title', 'city', 'status'])
            ->each(function ($p) use (&$results) {
                $results[] = [
                    'type'  => 'property',
                    'icon'  => 'property',
                    'label' => $p->title,
                    'sub'   => $p->reference . ($p->city ? " · {$p->city}" : ''),
                    'url'   => "/properties/{$p->id}",
                ];
            });

        // Tenancies
        Tenancy::where('company_id', $companyId)
            ->where('reference', 'like', $like)
            ->limit(3)
            ->get(['id', 'reference', 'status'])
            ->each(function ($t) use (&$results) {
                $results[] = [
                    'type'  => 'tenancy',
                    'icon'  => 'tenancy',
                    'label' => $t->reference,
                    'sub'   => ucfirst($t->status),
                    'url'   => "/tenancies/{$t->id}",
                ];
            });

        return response()->json($results);
    }
}
