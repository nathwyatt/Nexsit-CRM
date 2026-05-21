<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Lead;
use App\Models\Property;
use App\Models\PropertyViewing;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ViewingController extends Controller
{
    public function index(Request $request)
    {
        $query = PropertyViewing::with([
            'property:id,title,reference,community',
            'contact:id,first_name,last_name,phone',
            'lead:id,reference',
            'assignedTo:id,name',
        ])->orderBy('scheduled_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('property')) {
            $query->where('property_id', $request->property);
        }

        if ($request->filled('agent')) {
            $query->where('assigned_to', $request->agent);
        }

        if ($request->filled('from')) {
            $query->whereDate('scheduled_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('scheduled_at', '<=', $request->to);
        }

        $viewings = $query->paginate(25)->withQueryString()
            ->through(fn ($v) => $this->formatViewing($v));

        // Summary counts
        $summary = PropertyViewing::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('Viewings/Index', [
            'viewings'   => $viewings,
            'summary'    => $summary,
            'agents'     => User::orderBy('name')->get(['id', 'name']),
            'properties' => Property::select('id', 'title', 'reference')->orderBy('title')->limit(200)->get(),
            'filters'    => $request->only(['status', 'property', 'agent', 'from', 'to']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('Viewings/Create', [
            'properties' => Property::select('id', 'title', 'reference', 'community')
                ->whereIn('status', ['available', 'under_offer', 'reserved'])
                ->orderBy('title')->get(),
            'contacts'   => Contact::select('id', 'first_name', 'last_name', 'phone')
                ->orderBy('first_name')->limit(200)->get()
                ->map(fn ($c) => [
                    'id'    => $c->id,
                    'name'  => trim($c->first_name . ' ' . $c->last_name),
                    'phone' => $c->phone,
                ]),
            'agents'     => User::orderBy('name')->get(['id', 'name']),
            'leads'      => Lead::with('contact:id,first_name,last_name')
                ->whereNotIn('status', ['converted', 'lost'])
                ->latest()->limit(100)->get()
                ->map(fn ($l) => [
                    'id'           => $l->id,
                    'reference'    => $l->reference,
                    'contact_name' => $l->contact
                        ? trim($l->contact->first_name . ' ' . $l->contact->last_name)
                        : null,
                ]),
            'prefill' => [
                'property_id' => (int) $request->property_id ?: null,
                'contact_id'  => (int) $request->contact_id  ?: null,
                'lead_id'     => (int) $request->lead_id     ?: null,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id'      => 'required|exists:properties,id',
            'contact_id'       => 'nullable|exists:contacts,id',
            'lead_id'          => 'nullable|exists:leads,id',
            'assigned_to'      => 'required|exists:users,id',
            'scheduled_at'     => 'required|date',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'notes'            => 'nullable|string|max:2000',
        ]);

        $viewing = PropertyViewing::create([
            ...$validated,
            'company_id' => auth()->user()->company_id,
            'status'     => 'scheduled',
        ]);

        return redirect("/viewings/{$viewing->id}")->with('success', 'Viewing scheduled.');
    }

    public function show(PropertyViewing $viewing)
    {
        $viewing->load([
            'property:id,title,reference,community,city',
            'contact:id,first_name,last_name,phone,email',
            'lead:id,reference',
            'assignedTo:id,name',
        ]);

        // Other viewings of the same property (last 5)
        $propertyViewings = PropertyViewing::with('contact:id,first_name,last_name')
            ->where('property_id', $viewing->property_id)
            ->where('id', '!=', $viewing->id)
            ->orderByDesc('scheduled_at')
            ->limit(5)
            ->get()
            ->map(fn ($v) => [
                'id'          => $v->id,
                'status'      => $v->status,
                'scheduled_at'=> $v->scheduled_at->format('d M Y H:i'),
                'contact'     => $v->contact ? trim($v->contact->first_name . ' ' . $v->contact->last_name) : null,
            ]);

        return Inertia::render('Viewings/Show', [
            'viewing' => [
                'id'               => $viewing->id,
                'property'         => $viewing->property ? [
                    'id'        => $viewing->property_id,
                    'title'     => $viewing->property->title,
                    'reference' => $viewing->property->reference,
                    'community' => $viewing->property->community,
                    'city'      => $viewing->property->city,
                ] : null,
                'contact'          => $viewing->contact ? [
                    'id'    => $viewing->contact_id,
                    'name'  => trim($viewing->contact->first_name . ' ' . $viewing->contact->last_name),
                    'phone' => $viewing->contact->phone,
                    'email' => $viewing->contact->email,
                ] : null,
                'lead'             => $viewing->lead ? ['id' => $viewing->lead_id, 'reference' => $viewing->lead->reference] : null,
                'assigned_to'      => ['id' => $viewing->assigned_to, 'name' => $viewing->assignedTo?->name],
                'scheduled_at'     => $viewing->scheduled_at->format('l, d F Y \a\t H:i'),
                'scheduled_iso'    => $viewing->scheduled_at->toIso8601String(),
                'duration_minutes' => $viewing->duration_minutes,
                'status'           => $viewing->status,
                'notes'            => $viewing->notes,
                'feedback'         => $viewing->feedback,
                'created_at'       => $viewing->created_at->format('d M Y'),
            ],
            'propertyViewings' => $propertyViewings,
        ]);
    }

    public function edit(PropertyViewing $viewing)
    {
        $viewing->load(['property:id,title,reference', 'contact:id,first_name,last_name']);

        return Inertia::render('Viewings/Edit', [
            'viewing'    => [
                'id'               => $viewing->id,
                'property_id'      => $viewing->property_id,
                'contact_id'       => $viewing->contact_id,
                'lead_id'          => $viewing->lead_id,
                'assigned_to'      => $viewing->assigned_to,
                'scheduled_at'     => $viewing->scheduled_at->format('Y-m-d\TH:i'),
                'duration_minutes' => $viewing->duration_minutes,
                'status'           => $viewing->status,
                'notes'            => $viewing->notes,
                'feedback'         => $viewing->feedback,
            ],
            'properties' => Property::select('id', 'title', 'reference')->orderBy('title')->limit(200)->get(),
            'contacts'   => Contact::select('id', 'first_name', 'last_name')->orderBy('first_name')->limit(200)->get()
                ->map(fn ($c) => ['id' => $c->id, 'name' => trim($c->first_name . ' ' . $c->last_name)]),
            'agents'     => User::orderBy('name')->get(['id', 'name']),
            'leads'      => Lead::latest()->limit(100)->get(['id', 'reference']),
        ]);
    }

    public function update(Request $request, PropertyViewing $viewing)
    {
        $validated = $request->validate([
            'property_id'      => 'required|exists:properties,id',
            'contact_id'       => 'nullable|exists:contacts,id',
            'lead_id'          => 'nullable|exists:leads,id',
            'assigned_to'      => 'required|exists:users,id',
            'scheduled_at'     => 'required|date',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'status'           => 'required|in:scheduled,confirmed,completed,cancelled,no_show',
            'notes'            => 'nullable|string|max:2000',
            'feedback'         => 'nullable|string|max:2000',
        ]);

        $viewing->update($validated);

        return redirect("/viewings/{$viewing->id}")->with('success', 'Viewing updated.');
    }

    public function destroy(PropertyViewing $viewing)
    {
        $viewing->delete();
        return redirect('/viewings')->with('success', 'Viewing deleted.');
    }

    public function updateStatus(Request $request, PropertyViewing $viewing)
    {
        $request->validate(['status' => 'required|in:scheduled,confirmed,completed,cancelled,no_show']);
        $viewing->update(['status' => $request->status]);
        return back()->with('success', 'Status updated.');
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private function formatViewing(PropertyViewing $v): array
    {
        return [
            'id'               => $v->id,
            'property'         => $v->property ? [
                'id'        => $v->property_id,
                'title'     => $v->property->title,
                'reference' => $v->property->reference,
                'community' => $v->property->community,
            ] : null,
            'contact'          => $v->contact ? [
                'id'    => $v->contact_id,
                'name'  => trim($v->contact->first_name . ' ' . $v->contact->last_name),
                'phone' => $v->contact->phone,
            ] : null,
            'lead'             => $v->lead ? ['id' => $v->lead_id, 'reference' => $v->lead->reference] : null,
            'assigned_to'      => ['id' => $v->assigned_to, 'name' => $v->assignedTo?->name],
            'scheduled_at'     => $v->scheduled_at->format('d M Y, H:i'),
            'scheduled_date'   => $v->scheduled_at->toDateString(),
            'duration_minutes' => $v->duration_minutes,
            'status'           => $v->status,
        ];
    }
}
