<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use App\Models\Property;
use App\Models\DocumentType;
use App\Models\TaskType;
use App\Models\User;
use App\Notifications\DealStatusChanged;
use App\Services\ActivityLogger;
use App\Services\AutomationEngine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DealController extends Controller
{
    public function index(Request $request)
    {
        $view      = $request->get('view', 'list');
        $pipelines = Pipeline::where('is_active', true)->orderBy('position')->get(['id', 'name']);

        if ($view === 'kanban') {
            $selectedId = $request->filled('pipeline') ? $request->pipeline : $pipelines->first()?->id;
            $pipeline   = null;
            $columns    = collect();

            if ($selectedId) {
                $pipeline = Pipeline::with(['stages' => fn ($q) => $q->orderBy('position')
                    ->with(['deals' => fn ($dq) => $dq->whereIn('status', ['open', 'on_hold'])
                        ->with(['contact', 'assignedTo'])->latest()])
                ])->find($selectedId);

                if ($pipeline) {
                    $columns = $pipeline->stages->map(fn ($s) => [
                        'id'    => $s->id,
                        'name'  => $s->name,
                        'color' => $s->color,
                        'type'  => $s->type,
                        'deals' => $s->deals->map(fn ($d) => [
                            'id'                  => $d->id,
                            'reference'           => $d->reference,
                            'title'               => $d->title,
                            'status'              => $d->status,
                            'type'                => $d->type,
                            'value'               => $d->value,
                            'currency'            => $d->currency,
                            'contact'             => $d->contact ? ['id' => $d->contact->id, 'name' => $d->contact->name] : null,
                            'assigned_to'         => $d->assignedTo?->only('id', 'name'),
                            'expected_close_date' => $d->expected_close_date?->toDateString(),
                        ]),
                    ]);
                }
            }

            return Inertia::render('Deals/Index', [
                'view'      => 'kanban',
                'pipelines' => $pipelines,
                'pipeline'  => $pipeline ? ['id' => $pipeline->id, 'name' => $pipeline->name] : null,
                'columns'   => $columns,
                'filters'   => $request->only(['pipeline']),
                'deals'     => null,
                'agents'    => [],
            ]);
        }

        $query = Deal::with(['contact', 'stage', 'pipeline', 'assignedTo'])->latest();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('reference', 'like', "%{$request->search}%")
                  ->orWhere('title', 'like', "%{$request->search}%")
                  ->orWhereHas('contact', fn ($c) =>
                      $c->where('first_name', 'like', "%{$request->search}%")
                        ->orWhere('last_name', 'like', "%{$request->search}%")
                  );
            });
        }
        if ($request->filled('status'))   $query->where('status', $request->status);
        if ($request->filled('type'))     $query->where('type', $request->type);
        if ($request->filled('pipeline')) $query->where('pipeline_id', $request->pipeline);
        if ($request->filled('assigned')) $query->where('assigned_to', $request->assigned);

        $deals = $query->paginate(25)->withQueryString()
            ->through(fn ($d) => [
                'id'                  => $d->id,
                'reference'           => $d->reference,
                'title'               => $d->title,
                'status'              => $d->status,
                'type'                => $d->type,
                'value'               => $d->value,
                'currency'            => $d->currency,
                'contact'             => $d->contact ? ['id' => $d->contact->id, 'name' => $d->contact->name] : null,
                'stage'               => $d->stage?->only('id', 'name', 'color'),
                'pipeline'            => $d->pipeline?->only('id', 'name'),
                'assigned_to'         => $d->assignedTo?->only('id', 'name'),
                'expected_close_date' => $d->expected_close_date?->toDateString(),
                'created_at'          => $d->created_at->toDateString(),
            ]);

        return Inertia::render('Deals/Index', [
            'view'      => 'list',
            'deals'     => $deals,
            'pipelines' => $pipelines,
            'agents'    => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters'   => $request->only(['search', 'status', 'type', 'pipeline', 'assigned']),
            'pipeline'  => null,
            'columns'   => [],
        ]);
    }

    public function create()
    {
        return Inertia::render('Deals/Create', $this->formData());
    }

    public function store(Request $request)
    {
        $data                = $this->validateDeal($request);
        $data['created_by']  = auth()->id();
        $data['assigned_to'] = $data['assigned_to'] ?? auth()->id();

        $deal = Deal::create($data);

        return redirect()->route('deals.show', $deal)
            ->with('success', "Deal {$deal->reference} created.");
    }

    public function show(Deal $deal)
    {
        $deal->load(['contact', 'stage', 'pipeline.stages', 'property', 'lead', 'assignedTo', 'createdBy']);

        $tasks      = $deal->tasks()->with(['taskType', 'assignedTo'])->orderByRaw('status = "done" ASC')->orderByRaw('due_at IS NULL ASC')->orderBy('due_at')->get();
        $activities = $deal->activities()->with('user')->latest('created_at')->limit(50)->get();
        $documents  = $deal->documents()->with(['documentType', 'uploadedBy'])->latest()->get();
        $taskCtrl   = new \App\Http\Controllers\Crm\TaskController();
        $docCtrl    = new \App\Http\Controllers\Crm\DocumentController();

        return Inertia::render('Deals/Show', [
            'deal' => [
                'id'                  => $deal->id,
                'reference'           => $deal->reference,
                'title'               => $deal->title,
                'status'              => $deal->status,
                'type'                => $deal->type,
                'value'               => $deal->value,
                'commission_pct'      => $deal->commission_pct,
                'commission'          => $deal->commission,
                'currency'            => $deal->currency,
                'expected_close_date' => $deal->expected_close_date?->toDateString(),
                'closed_at'           => $deal->closed_at?->toDateString(),
                'lost_reason'         => $deal->lost_reason,
                'created_at'          => $deal->created_at->toDateString(),
                'contact'     => $deal->contact ? [
                    'id'    => $deal->contact->id,
                    'name'  => $deal->contact->name,
                    'email' => $deal->contact->email,
                    'phone' => $deal->contact->phone,
                ] : null,
                'stage'    => $deal->stage ? [
                    'id'    => $deal->stage->id,
                    'name'  => $deal->stage->name,
                    'color' => $deal->stage->color,
                    'type'  => $deal->stage->type,
                ] : null,
                'pipeline' => $deal->pipeline?->only('id', 'name'),
                'property' => $deal->property ? [
                    'id'        => $deal->property->id,
                    'reference' => $deal->property->reference,
                    'title'     => $deal->property->title,
                ] : null,
                'lead'        => $deal->lead ? ['id' => $deal->lead->id, 'reference' => $deal->lead->reference] : null,
                'assigned_to' => $deal->assignedTo?->only('id', 'name'),
                'created_by'  => $deal->createdBy?->only('id', 'name'),
            ],
            'stages' => $deal->pipeline
                ? $deal->pipeline->stages->map(fn ($s) => [
                    'id'    => $s->id,
                    'name'  => $s->name,
                    'color' => $s->color,
                    'type'  => $s->type,
                ])
                : [],
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
            'subject'       => ['type' => 'deal', 'id' => $deal->id],
            'documents'     => $documents->map(fn ($d) => $docCtrl->transform($d)),
            'documentTypes' => DocumentType::where('is_active', true)->orderBy('position')->get(['id', 'name']),
        ]);
    }

    public function edit(Deal $deal)
    {
        return Inertia::render('Deals/Edit', array_merge($this->formData(), [
            'deal' => [
                'id'                  => $deal->id,
                'reference'           => $deal->reference,
                'pipeline_id'         => $deal->pipeline_id,
                'stage_id'            => $deal->stage_id,
                'contact_id'          => $deal->contact_id,
                'property_id'         => $deal->property_id,
                'title'               => $deal->title,
                'type'                => $deal->type,
                'value'               => $deal->value,
                'commission_pct'      => $deal->commission_pct,
                'expected_close_date' => $deal->expected_close_date?->toDateString(),
                'assigned_to'         => $deal->assigned_to,
            ],
        ]));
    }

    public function update(Request $request, Deal $deal)
    {
        $data = $this->validateDeal($request);
        $deal->update($data);

        return redirect()->route('deals.show', $deal)
            ->with('success', 'Deal updated.');
    }

    public function destroy(Deal $deal)
    {
        $ref = $deal->reference;
        $deal->delete();

        return redirect()->route('deals.index')
            ->with('success', "{$ref} deleted.");
    }

    public function moveStage(Request $request, Deal $deal)
    {
        $request->validate(['stage_id' => 'required|exists:pipeline_stages,id']);

        $stage    = PipelineStage::find($request->stage_id);
        $oldStage = $deal->stage_id;
        $deal->update(['stage_id' => $request->stage_id]);

        ActivityLogger::log('stage_changed', "Stage changed to {$stage->name}", $deal,
            ['stage_id' => $oldStage],
            ['stage_id' => $request->stage_id, 'stage_name' => $stage->name]
        );

        AutomationEngine::fire('deal_stage_changed', $deal, ['stage_name' => $stage->name]);

        return back()->with('success', "Moved to {$stage->name}.");
    }

    public function status(Request $request, Deal $deal)
    {
        $request->validate([
            'status'      => 'required|in:open,won,lost,on_hold',
            'lost_reason' => 'nullable|string|max:500',
        ]);

        $oldStatus = $deal->status;
        $updates   = ['status' => $request->status];

        if (in_array($request->status, ['won', 'lost'])) {
            $updates['closed_at'] = now();
        } else {
            $updates['closed_at'] = null;
        }

        $updates['lost_reason'] = $request->status === 'lost' ? $request->lost_reason : null;

        $deal->update($updates);

        ActivityLogger::log('status_changed', "Status changed from {$oldStatus} to {$request->status}", $deal,
            ['status' => $oldStatus],
            ['status' => $request->status]
        );

        if ($request->status === 'won') {
            AutomationEngine::fire('deal_won', $deal);
        } elseif ($request->status === 'lost') {
            AutomationEngine::fire('deal_lost', $deal);
        }

        if (in_array($request->status, ['won', 'lost', 'on_hold'])) {
            $notification = new DealStatusChanged($deal, $request->status, auth()->user());
            // Notify the assigned agent (if not self)
            if ($deal->assigned_to && $deal->assigned_to !== auth()->id()) {
                User::find($deal->assigned_to)?->notify($notification);
            }
            // Notify all admins
            User::where('role', 'admin')->where('id', '!=', auth()->id())->get()
                ->each(fn ($admin) => $admin->notify($notification));
        }

        return back()->with('success', 'Status updated.');
    }

    public function assign(Request $request, Deal $deal)
    {
        $request->validate(['assigned_to' => 'required|exists:users,id']);

        $old = $deal->assigned_to;
        $deal->update(['assigned_to' => $request->assigned_to]);

        $agent = User::find($request->assigned_to);
        ActivityLogger::log('assigned', "Deal assigned to {$agent->name}", $deal,
            ['assigned_to' => $old],
            ['assigned_to' => $request->assigned_to, 'agent_name' => $agent->name]
        );

        return back()->with('success', 'Deal assigned.');
    }

    private function formData(): array
    {
        return [
            'pipelines'  => Pipeline::where('is_active', true)->orderBy('position')
                ->with(['stages' => fn ($q) => $q->orderBy('position')])
                ->get()
                ->map(fn ($p) => [
                    'id'     => $p->id,
                    'name'   => $p->name,
                    'stages' => $p->stages->map(fn ($s) => [
                        'id'   => $s->id,
                        'name' => $s->name,
                        'type' => $s->type,
                    ]),
                ]),
            'contacts'   => Contact::orderBy('first_name')->orderBy('last_name')
                ->with('roles')
                ->get(['id', 'first_name', 'last_name', 'phone'])
                ->map(fn ($c) => [
                    'id'    => $c->id,
                    'name'  => trim("{$c->first_name} {$c->last_name}"),
                    'phone' => $c->phone,
                    'roles' => $c->roles->pluck('role'),
                ]),
            'properties' => Property::orderBy('reference')
                ->get(['id', 'reference', 'title'])
                ->map(fn ($p) => ['id' => $p->id, 'label' => "{$p->reference} — {$p->title}"]),
            'agents'     => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ];
    }

    private function validateDeal(Request $request): array
    {
        return $request->validate([
            'pipeline_id'         => 'required|exists:pipelines,id',
            'stage_id'            => 'required|exists:pipeline_stages,id',
            'contact_id'          => 'required|exists:contacts,id',
            'property_id'         => 'nullable|exists:properties,id',
            'title'               => 'required|string|max:200',
            'type'                => 'required|in:sale,rental',
            'value'               => 'nullable|numeric|min:0',
            'commission_pct'      => 'nullable|numeric|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'assigned_to'         => 'nullable|exists:users,id',
        ]);
    }
}
