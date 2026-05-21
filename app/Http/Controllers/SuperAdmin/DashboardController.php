<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Lead;
use App\Models\Property;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalCompanies  = Company::count();
        $activeCompanies = Company::where('is_active', true)->count();
        $totalUsers      = User::where('is_super_admin', false)->count();

        $activeSubs = Subscription::whereIn('status', ['active', 'trial'])->count();
        $mrrData    = Subscription::where('status', 'active')
            ->with('plan')
            ->get()
            ->sum(fn ($s) => $s->billing_cycle === 'yearly'
                ? $s->plan->price_yearly / 12
                : $s->plan->price_monthly
            );

        $recentCompanies = Company::with(['subscriptions' => fn ($q) => $q->with('plan')->latest()->limit(1)])
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($c) => [
                'id'         => $c->id,
                'name'       => $c->name,
                'slug'       => $c->slug,
                'is_active'  => $c->is_active,
                'created_at' => $c->created_at->toDateString(),
                'plan'       => $c->subscriptions->first()?->plan?->only('name', 'badge_color'),
                'status'     => $c->subscriptions->first()?->status ?? 'no_plan',
            ]);

        $subsByStatus = Subscription::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => [
                'total_companies'  => $totalCompanies,
                'active_companies' => $activeCompanies,
                'total_users'      => $totalUsers,
                'active_subs'      => $activeSubs,
                'mrr'              => round($mrrData, 2),
            ],
            'recent_companies' => $recentCompanies,
            'subs_by_status'   => $subsByStatus,
        ]);
    }
}
