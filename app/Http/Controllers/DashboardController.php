<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Property;
use App\Models\Task;
use App\Models\Tenancy;
use App\Models\TenancyPayment;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $now = now();

        // ── KPI Cards ────────────────────────────────────────────────────────
        $kpis = [
            'new_leads_month'     => Lead::whereMonth('created_at', $now->month)
                                         ->whereYear('created_at', $now->year)->count(),
            'open_deals'          => Deal::where('status', 'open')->count(),
            'open_deals_value'    => (float) Deal::where('status', 'open')->sum('value'),
            'active_tenancies'    => Tenancy::where('status', 'active')->count(),
            'published_properties'=> Property::where('is_published', true)->count(),
            'overdue_payments'    => TenancyPayment::where('status', 'overdue')->count(),
            'overdue_amount'      => (float) TenancyPayment::where('status', 'overdue')->sum('amount'),
            'won_deals_month'     => Deal::where('status', 'won')
                                         ->whereMonth('closed_at', $now->month)
                                         ->whereYear('closed_at', $now->year)->count(),
        ];

        // ── Leads by status ──────────────────────────────────────────────────
        $leadsByStatus = Lead::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->orderBy('count', 'desc')
            ->pluck('count', 'status')
            ->mapWithKeys(fn ($count, $status) => [ucfirst(str_replace('_', ' ', $status)) => (int) $count])
            ->toArray();

        // ── Leads over last 6 months ─────────────────────────────────────────
        $leadsOverTime = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $leadsOverTime[] = [
                'month' => $month->format('M y'),
                'leads' => Lead::whereYear('created_at', $month->year)
                               ->whereMonth('created_at', $month->month)
                               ->count(),
                'deals' => Deal::whereYear('created_at', $month->year)
                               ->whereMonth('created_at', $month->month)
                               ->count(),
            ];
        }

        // ── Deals by pipeline ────────────────────────────────────────────────
        $dealsByPipeline = Deal::where('deals.status', 'open')
            ->join('pipelines', 'deals.pipeline_id', '=', 'pipelines.id')
            ->selectRaw('pipelines.name, COUNT(*) as count, COALESCE(SUM(deals.value), 0) as value')
            ->groupBy('pipelines.name')
            ->get()
            ->map(fn ($r) => ['name' => $r->name, 'count' => (int) $r->count, 'value' => (float) $r->value])
            ->toArray();

        // ── Revenue: collected vs expected last 6 months ─────────────────────
        $revenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $revenue[] = [
                'month'     => $month->format('M y'),
                'expected'  => (float) TenancyPayment::whereYear('due_date', $month->year)
                                    ->whereMonth('due_date', $month->month)
                                    ->whereIn('status', ['pending', 'paid', 'partial', 'overdue'])
                                    ->sum('amount'),
                'collected' => (float) TenancyPayment::where('status', 'paid')
                                    ->whereYear('paid_date', $month->year)
                                    ->whereMonth('paid_date', $month->month)
                                    ->sum('amount'),
            ];
        }

        // ── Upcoming tasks (next 7 days) ─────────────────────────────────────
        $upcomingTasks = Task::with(['assignedTo', 'taskType'])
            ->where('status', 'pending')
            ->whereBetween('due_at', [$now->startOfDay(), $now->copy()->addDays(7)->endOfDay()])
            ->orderBy('due_at')
            ->limit(8)
            ->get()
            ->map(fn ($t) => [
                'id'        => $t->id,
                'title'     => $t->title,
                'priority'  => $t->priority,
                'due_at'    => $t->due_at?->format('M d, H:i'),
                'assigned'  => $t->assignedTo?->name,
                'type'      => $t->taskType?->name,
            ]);

        // ── Expiring tenancies (next 90 days) ────────────────────────────────
        $expiringTenancies = Tenancy::with(['property', 'tenant'])
            ->where('status', 'active')
            ->whereBetween('end_date', [$now->toDateString(), $now->copy()->addDays(90)->toDateString()])
            ->orderBy('end_date')
            ->limit(5)
            ->get()
            ->map(fn ($t) => [
                'id'        => $t->id,
                'reference' => $t->reference,
                'end_date'  => $t->end_date->format('M d, Y'),
                'days_left' => (int) $now->diffInDays($t->end_date),
                'property'  => $t->property?->title,
                'tenant'    => $t->tenant?->name,
            ]);

        // ── Recent activity ──────────────────────────────────────────────────
        $recentActivity = Activity::with('user')
            ->latest('created_at')
            ->limit(8)
            ->get()
            ->map(fn ($a) => [
                'id'          => $a->id,
                'action'      => $a->action,
                'description' => $a->description,
                'user'        => $a->user?->name,
                'created_at'  => $a->created_at->diffForHumans(),
            ]);

        return Inertia::render('Dashboard/Index', compact(
            'kpis',
            'leadsByStatus',
            'leadsOverTime',
            'dealsByPipeline',
            'revenue',
            'upcomingTasks',
            'expiringTenancies',
            'recentActivity',
        ));
    }
}
