<?php

namespace App\Http\Controllers\Crm\Settings;

use App\Http\Controllers\Controller;
use App\Models\AutomationRule;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AutomationRuleController extends Controller
{
    private const TRIGGERS = [
        'lead_created'         => 'Lead Created',
        'lead_assigned'        => 'Lead Assigned',
        'lead_status_changed'  => 'Lead Status Changed',
        'deal_created'         => 'Deal Created',
        'deal_stage_changed'   => 'Deal Stage Changed',
        'deal_won'             => 'Deal Won',
        'deal_lost'            => 'Deal Lost',
        'property_published'   => 'Property Published',
        'tenancy_expiring_30d' => 'Tenancy Expiring (30 days)',
        'tenancy_expiring_7d'  => 'Tenancy Expiring (7 days)',
        'task_overdue'         => 'Task Overdue',
    ];

    public function index()
    {
        $rules = AutomationRule::with('createdBy')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get()
            ->map(fn ($r) => [
                'id'          => $r->id,
                'name'        => $r->name,
                'description' => $r->description,
                'trigger'     => $r->trigger,
                'trigger_label' => self::TRIGGERS[$r->trigger] ?? $r->trigger,
                'is_active'   => $r->is_active,
                'run_count'   => $r->run_count,
                'last_run_at' => $r->last_run_at?->diffForHumans(),
                'conditions'  => $r->conditions ?? [],
                'actions'     => $r->actions ?? [],
                'created_by'  => $r->createdBy?->only('id', 'name'),
            ]);

        return Inertia::render('Settings/AutomationRules/Index', [
            'rules'   => $rules,
            'triggers' => collect(self::TRIGGERS)->map(fn ($label, $value) => compact('value', 'label'))->values(),
            'agents'  => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:120',
            'description' => 'nullable|string|max:500',
            'trigger'     => 'required|in:' . implode(',', array_keys(self::TRIGGERS)),
            'conditions'  => 'nullable|array',
            'actions'     => 'required|array|min:1',
            'is_active'   => 'boolean',
        ]);

        $data['created_by'] = auth()->id();

        AutomationRule::create($data);

        return back()->with('success', 'Automation rule created.');
    }

    public function update(Request $request, AutomationRule $automationRule)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:120',
            'description' => 'nullable|string|max:500',
            'trigger'     => 'required|in:' . implode(',', array_keys(self::TRIGGERS)),
            'conditions'  => 'nullable|array',
            'actions'     => 'required|array|min:1',
            'is_active'   => 'boolean',
        ]);

        $automationRule->update($data);

        return back()->with('success', 'Automation rule updated.');
    }

    public function toggleActive(AutomationRule $automationRule)
    {
        $automationRule->update(['is_active' => ! $automationRule->is_active]);

        $status = $automationRule->is_active ? 'enabled' : 'disabled';

        return back()->with('success', "Rule {$status}.");
    }

    public function destroy(AutomationRule $automationRule)
    {
        $automationRule->delete();

        return back()->with('success', 'Rule deleted.');
    }
}
