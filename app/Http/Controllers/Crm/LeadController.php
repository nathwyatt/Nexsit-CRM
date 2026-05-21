<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\Pipeline;
use App\Models\Property;
use App\Models\DocumentType;
use App\Models\TaskType;
use App\Models\User;
use App\Mail\LeadAssignedMail;
use App\Notifications\LeadAssigned;
use App\Services\ActivityLogger;
use App\Services\AutomationEngine;
use App\Services\EmailService;
use App\Services\PlanLimitService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $query = Lead::with(['contact', 'source', 'assignedTo'])
            ->latest();

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('purpose')) {
            $query->where('purpose', $request->purpose);
        }

        if ($request->filled('source')) {
            $query->where('lead_source_id', $request->source);
        }

        if ($request->filled('assigned')) {
            $query->where('assigned_to', $request->assigned);
        }

        $leads = $query->paginate(25)->withQueryString()
            ->through(fn ($l) => [
                'id'          => $l->id,
                'reference'   => $l->reference,
                'status'      => $l->status,
                'purpose'     => $l->purpose,
                'budget_max'  => $l->budget_max,
                'contact'     => $l->contact?->only('id', 'first_name', 'last_name', 'email', 'phone'),
                'source'      => $l->source?->only('id', 'name', 'icon'),
                'assigned_to' => $l->assignedTo?->only('id', 'name'),
                'created_at'  => $l->created_at->toDateString(),
            ]);

        return Inertia::render('Leads/Index', [
            'leads'   => $leads,
            'sources' => LeadSource::where('is_active', true)->orderBy('position')->get(['id', 'name']),
            'agents'  => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'status', 'purpose', 'source', 'assigned']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Leads/Create', $this->formData());
    }

    public function store(Request $request)
    {
        if ($error = PlanLimitService::check('leads', auth()->user()->company_id)) {
            return back()->with('error', $error);
        }

        $data = $this->validateLead($request);
        $data['assigned_to'] = $data['assigned_to'] ?? auth()->id();

        $lead = Lead::create($data);

        AutomationEngine::fire('lead_created', $lead);

        return redirect()->route('leads.show', $lead)
            ->with('success', "Lead {$lead->reference} created.");
    }

    public function show(Lead $lead)
    {
        $lead->load(['contact', 'source', 'property', 'assignedTo', 'convertedDeal']);

        $tasks      = $lead->tasks()->with(['taskType', 'assignedTo'])->orderByRaw('status = "done" ASC')->orderByRaw('due_at IS NULL ASC')->orderBy('due_at')->get();
        $activities = $lead->activities()->with('user')->latest('created_at')->limit(50)->get();
        $documents  = $lead->documents()->with(['documentType', 'uploadedBy'])->latest()->get();
        $taskCtrl   = new \App\Http\Controllers\Crm\TaskController();
        $docCtrl    = new \App\Http\Controllers\Crm\DocumentController();

        return Inertia::render('Leads/Show', [
            'lead' => [
                'id'               => $lead->id,
                'reference'        => $lead->reference,
                'status'           => $lead->status,
                'purpose'          => $lead->purpose,
                'budget_min'       => $lead->budget_min,
                'budget_max'       => $lead->budget_max,
                'bedrooms_wanted'  => $lead->bedrooms_wanted,
                'message'          => $lead->message,
                'source_detail'    => $lead->source_detail,
                'lost_reason'      => $lead->lost_reason,
                'converted_at'     => $lead->converted_at?->toDateString(),
                'created_at'       => $lead->created_at->toDateString(),
                'contact'          => $lead->contact ? [
                    'id'    => $lead->contact->id,
                    'name'  => $lead->contact->name,
                    'email' => $lead->contact->email,
                    'phone' => $lead->contact->phone,
                ] : null,
                'source'           => $lead->source?->only('id', 'name', 'icon'),
                'property'         => $lead->property ? [
                    'id'        => $lead->property->id,
                    'reference' => $lead->property->reference,
                    'title'     => $lead->property->title,
                ] : null,
                'assigned_to'      => $lead->assignedTo?->only('id', 'name'),
                'converted_deal'   => $lead->convertedDeal ? [
                    'id'        => $lead->convertedDeal->id,
                    'reference' => $lead->convertedDeal->reference,
                    'title'     => $lead->convertedDeal->title,
                ] : null,
            ],
            'agents'    => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'taskTypes' => TaskType::where('is_active', true)->orderBy('position')->get(['id', 'name', 'icon']),
            'tasks'     => $tasks->map(fn ($t) => $taskCtrl->transform($t)),
            'activities' => $activities->map(fn ($a) => [
                'id'          => $a->id,
                'action'      => $a->action,
                'description' => $a->description,
                'user'        => $a->user ? ['id' => $a->user->id, 'name' => $a->user->name] : null,
                'created_at'  => $a->created_at->diffForHumans(),
            ]),
            'subject'       => ['type' => 'lead', 'id' => $lead->id],
            'documents'     => $documents->map(fn ($d) => $docCtrl->transform($d)),
            'documentTypes' => DocumentType::where('is_active', true)->orderBy('position')->get(['id', 'name']),
            'match_count'   => $this->quickMatchCount($lead),
        ]);
    }

    private function quickMatchCount(Lead $lead): int
    {
        if (!$lead->purpose) return 0;

        $q = Property::where('purpose', $lead->purpose);

        if ($lead->budget_max) {
            $ceiling = $lead->budget_max * 1.15;
            $col     = $lead->purpose === 'buy' ? 'price' : 'rent_price';
            $q->where($col, '>', 0)->where($col, '<=', $ceiling);
        }

        return $q->count();
    }

    public function edit(Lead $lead)
    {
        return Inertia::render('Leads/Edit', array_merge($this->formData(), [
            'lead' => $lead->load('contact')->toArray(),
        ]));
    }

    public function update(Request $request, Lead $lead)
    {
        $data = $this->validateLead($request);
        $lead->update($data);

        return redirect()->route('leads.show', $lead)
            ->with('success', 'Lead updated.');
    }

    public function destroy(Lead $lead)
    {
        $ref = $lead->reference;
        $lead->delete();

        return redirect()->route('leads.index')
            ->with('success', "{$ref} deleted.");
    }

    public function convert(Request $request, Lead $lead)
    {
        if ($lead->status === 'converted') {
            return back()->withErrors(['lead' => 'Lead is already converted.']);
        }

        if (!$lead->contact_id) {
            return back()->withErrors(['lead' => 'Link a contact to this lead before converting.']);
        }

        $pipeline = Pipeline::where('is_default', true)->where('is_active', true)->first()
            ?? Pipeline::where('is_active', true)->orderBy('position')->first();

        if (!$pipeline) {
            return back()->withErrors(['lead' => 'No active pipeline found. Create one in Settings → Pipelines.']);
        }

        $stage = $pipeline->stages()->where('is_won_stage', false)->where('is_lost_stage', false)->orderBy('position')->first();

        if (!$stage) {
            return back()->withErrors(['lead' => 'The default pipeline has no open stages.']);
        }

        $deal = DB::transaction(function () use ($lead, $pipeline, $stage) {
            $lead->load('contact', 'property');

            $title = $lead->contact->name;
            if ($lead->property) {
                $title .= ' — ' . $lead->property->reference;
            }

            $deal = Deal::create([
                'pipeline_id' => $pipeline->id,
                'stage_id'    => $stage->id,
                'contact_id'  => $lead->contact_id,
                'property_id' => $lead->property_id,
                'lead_id'     => $lead->id,
                'title'       => $title,
                'type'        => $lead->purpose === 'rent' ? 'rental' : 'sale',
                'status'      => 'open',
                'value'       => $lead->budget_max,
                'assigned_to' => $lead->assigned_to,
                'created_by'  => auth()->id(),
            ]);

            $lead->update([
                'status'            => 'converted',
                'converted_at'      => now(),
                'converted_to_deal' => $deal->id,
            ]);

            return $deal;
        });

        ActivityLogger::log('converted', "Converted to deal {$deal->reference}", $lead,
            [],
            ['deal_id' => $deal->id, 'deal_reference' => $deal->reference]
        );

        return redirect()->route('leads.show', $lead)
            ->with('success', "Converted to deal {$deal->reference}.");
    }

    public function assign(Request $request, Lead $lead)
    {
        $request->validate(['assigned_to' => 'required|exists:users,id']);

        $old = $lead->assigned_to;
        $lead->update(['assigned_to' => $request->assigned_to]);

        $agent = User::find($request->assigned_to);
        ActivityLogger::log('assigned', "Lead assigned to {$agent->name}", $lead,
            ['assigned_to' => $old],
            ['assigned_to' => $request->assigned_to, 'agent_name' => $agent->name]
        );

        AutomationEngine::fire('lead_assigned', $lead);

        if ((int) $request->assigned_to !== auth()->id()) {
            $agent->notify(new LeadAssigned($lead, auth()->user()));
            EmailService::send(
                $lead->company_id,
                $agent->email,
                $agent->name,
                "Lead assigned to you: {$lead->reference}",
                new LeadAssignedMail($lead->load('contact'), $agent)
            );
        }

        return back()->with('success', 'Lead assigned.');
    }

    public function status(Request $request, Lead $lead)
    {
        $request->validate([
            'status'      => 'required|in:new,contacted,qualified,converted,lost',
            'lost_reason' => 'nullable|string|max:500',
        ]);

        if ($lead->status === 'converted') {
            return back()->withErrors(['status' => 'Cannot change status of a converted lead.']);
        }

        $oldStatus = $lead->status;
        $lead->update([
            'status'      => $request->status,
            'lost_reason' => $request->status === 'lost' ? $request->lost_reason : null,
        ]);

        ActivityLogger::log('status_changed', "Status changed from {$oldStatus} to {$request->status}", $lead,
            ['status' => $oldStatus],
            ['status' => $request->status]
        );

        AutomationEngine::fire('lead_status_changed', $lead, ['old_status' => $oldStatus]);

        return back()->with('success', 'Status updated.');
    }

    private function formData(): array
    {
        return [
            'sources'    => LeadSource::where('is_active', true)->orderBy('position')->get(['id', 'name', 'icon']),
            'agents'     => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'properties' => Property::orderBy('reference')
                ->get(['id', 'reference', 'title'])
                ->map(fn ($p) => ['id' => $p->id, 'label' => "{$p->reference} — {$p->title}"]),
            'contacts'   => Contact::orderBy('first_name')->orderBy('last_name')
                ->get(['id', 'first_name', 'last_name', 'phone'])
                ->map(fn ($c) => ['id' => $c->id, 'name' => "{$c->first_name} {$c->last_name}", 'phone' => $c->phone]),
        ];
    }

    private function validateLead(Request $request): array
    {
        return $request->validate([
            'contact_id'      => 'nullable|exists:contacts,id',
            'lead_source_id'  => 'nullable|exists:lead_sources,id',
            'source_detail'   => 'nullable|string|max:200',
            'purpose'         => 'required|in:buy,rent',
            'property_id'     => 'nullable|exists:properties,id',
            'budget_min'      => 'nullable|numeric|min:0',
            'budget_max'      => 'nullable|numeric|min:0',
            'bedrooms_wanted' => 'nullable|integer|min:0',
            'message'         => 'nullable|string',
            'assigned_to'     => 'nullable|exists:users,id',
        ]);
    }
}
