<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $query = Company::withCount(['users', 'properties', 'leads'])
            ->with(['subscriptions' => fn ($q) => $q->with('plan')->latest()->limit(1)])
            ->latest();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('slug', 'like', "%{$request->search}%");
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $companies = $query->paginate(20)->withQueryString()
            ->through(fn ($c) => $this->formatCompany($c));

        return Inertia::render('SuperAdmin/Companies/Index', [
            'companies' => $companies,
            'filters'   => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('SuperAdmin/Companies/Create', [
            'plans' => Plan::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'slug', 'price_monthly', 'price_yearly']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|max:255',
            'phone'          => 'nullable|string|max:50',
            'address'        => 'nullable|string|max:255',
            'city'           => 'nullable|string|max:100',
            'country'        => 'nullable|string|max:100',
            'timezone'       => 'nullable|string|max:50',
            'plan_id'        => 'required|exists:plans,id',
            'billing_cycle'  => 'required|in:monthly,yearly',
            'payment_method' => 'required|in:stripe,manual,free',
            'trial_days'     => 'nullable|integer|min:0|max:365',
            // Admin user
            'admin_name'     => 'required|string|max:255',
            'admin_email'    => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:8',
        ]);

        DB::transaction(function () use ($data) {
            $company = Company::create([
                'name'     => $data['name'],
                'slug'     => Str::slug($data['name']) . '-' . Str::random(4),
                'email'    => $data['email'],
                'phone'    => $data['phone'] ?? null,
                'address'  => $data['address'] ?? null,
                'city'     => $data['city'] ?? null,
                'country'  => $data['country'] ?? 'Rwanda',
                'timezone' => $data['timezone'] ?? 'Africa/Kigali',
                'is_active' => true,
            ]);

            // Create admin user for the company
            $user = User::create([
                'company_id' => $company->id,
                'name'       => $data['admin_name'],
                'email'      => $data['admin_email'],
                'password'   => Hash::make($data['admin_password']),
                'role'       => 'admin',
                'is_active'  => true,
            ]);
            $user->assignRole('admin');

            // Create subscription
            $trialDays = $data['trial_days'] ?? 0;
            $plan      = Plan::find($data['plan_id']);
            $cycle     = $data['billing_cycle'];

            $starts = now()->toDateString();
            $ends   = $cycle === 'yearly'
                ? now()->addYear()->toDateString()
                : now()->addMonth()->toDateString();

            $status = $trialDays > 0 ? 'trial' : 'active';

            Subscription::create([
                'company_id'     => $company->id,
                'plan_id'        => $plan->id,
                'status'         => $status,
                'billing_cycle'  => $cycle,
                'payment_method' => $data['payment_method'],
                'starts_at'      => $starts,
                'ends_at'        => $ends,
                'trial_ends_at'  => $trialDays > 0 ? now()->addDays($trialDays) : null,
            ]);
        });

        return redirect()->route('superadmin.companies.index')
            ->with('success', "Company \"{$data['name']}\" created with admin account.");
    }

    public function show(Company $company)
    {
        $company->load(['subscriptions.plan', 'users']);

        $usage = [
            'users'      => $company->users()->where('is_super_admin', false)->count(),
            'properties' => $company->properties()->count(),
            'leads'      => $company->leads()->count(),
            'deals'      => $company->deals()->count(),
        ];

        $activeSub = $company->subscriptions->first(fn ($s) => in_array($s->status, ['active', 'trial']));

        return Inertia::render('SuperAdmin/Companies/Show', [
            'company' => [
                'id'         => $company->id,
                'name'       => $company->name,
                'slug'       => $company->slug,
                'email'      => $company->email,
                'phone'      => $company->phone,
                'address'    => $company->address,
                'city'       => $company->city,
                'country'    => $company->country,
                'timezone'   => $company->timezone,
                'is_active'  => $company->is_active,
                'created_at' => $company->created_at->toDateString(),
            ],
            'usage'   => $usage,
            'subscription' => $activeSub ? [
                'id'             => $activeSub->id,
                'status'         => $activeSub->status,
                'billing_cycle'  => $activeSub->billing_cycle,
                'payment_method' => $activeSub->payment_method,
                'starts_at'      => $activeSub->starts_at->toDateString(),
                'ends_at'        => $activeSub->ends_at->toDateString(),
                'trial_ends_at'  => $activeSub->trial_ends_at?->toDateString(),
                'notes'          => $activeSub->notes,
                'plan'           => $activeSub->plan->only('id', 'name', 'badge_color', 'price_monthly', 'price_yearly'),
            ] : null,
            'subscription_history' => $company->subscriptions->map(fn ($s) => [
                'id'            => $s->id,
                'status'        => $s->status,
                'plan'          => $s->plan->name,
                'billing_cycle' => $s->billing_cycle,
                'starts_at'     => $s->starts_at->toDateString(),
                'ends_at'       => $s->ends_at->toDateString(),
                'created_at'    => $s->created_at->toDateString(),
            ]),
            'users' => $company->users()->where('is_super_admin', false)->get()->map(fn ($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'role'       => $u->role,
                'is_active'  => $u->is_active,
                'last_login' => $u->last_login_at?->diffForHumans(),
            ]),
            'plans' => Plan::where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'price_monthly', 'price_yearly']),
        ]);
    }

    public function toggleActive(Company $company)
    {
        $company->update(['is_active' => !$company->is_active]);
        $status = $company->is_active ? 'activated' : 'suspended';

        return back()->with('success', "Company \"{$company->name}\" {$status}.");
    }

    public function updateSubscription(Request $request, Company $company)
    {
        $data = $request->validate([
            'plan_id'        => 'required|exists:plans,id',
            'status'         => 'required|in:trial,active,past_due,cancelled,expired',
            'billing_cycle'  => 'required|in:monthly,yearly',
            'payment_method' => 'required|in:stripe,manual,free',
            'ends_at'        => 'required|date',
            'notes'          => 'nullable|string|max:1000',
        ]);

        $activeSub = $company->subscriptions()
            ->whereIn('status', ['active', 'trial', 'past_due'])
            ->latest()->first();

        if ($activeSub) {
            $activeSub->update($data);
        } else {
            Subscription::create(array_merge($data, [
                'company_id' => $company->id,
                'starts_at'  => now()->toDateString(),
            ]));
        }

        return back()->with('success', 'Subscription updated.');
    }

    private function formatCompany(Company $c): array
    {
        $sub = $c->subscriptions->first();
        return [
            'id'              => $c->id,
            'name'            => $c->name,
            'slug'            => $c->slug,
            'email'           => $c->email,
            'is_active'       => $c->is_active,
            'users_count'     => $c->users_count,
            'properties_count'=> $c->properties_count,
            'leads_count'     => $c->leads_count,
            'created_at'      => $c->created_at->toDateString(),
            'plan'            => $sub?->plan?->only('name', 'badge_color'),
            'sub_status'      => $sub?->status ?? 'none',
            'sub_ends_at'     => $sub?->ends_at?->toDateString(),
        ];
    }
}
