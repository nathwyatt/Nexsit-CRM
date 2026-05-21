<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::withCount('subscriptions')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($p) => [
                'id'              => $p->id,
                'name'            => $p->name,
                'slug'            => $p->slug,
                'description'     => $p->description,
                'price_monthly'   => $p->price_monthly,
                'price_yearly'    => $p->price_yearly,
                'max_users'       => $p->max_users,
                'max_properties'  => $p->max_properties,
                'max_leads'       => $p->max_leads,
                'features'        => $p->features ?? [],
                'badge_color'     => $p->badge_color,
                'is_active'       => $p->is_active,
                'is_featured'     => $p->is_featured,
                'sort_order'      => $p->sort_order,
                'subs_count'      => $p->subscriptions_count,
            ]);

        return Inertia::render('SuperAdmin/Plans/Index', [
            'plans' => $plans,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:100',
            'description'    => 'nullable|string|max:500',
            'price_monthly'  => 'required|numeric|min:0',
            'price_yearly'   => 'required|numeric|min:0',
            'max_users'      => 'nullable|integer|min:1',
            'max_properties' => 'nullable|integer|min:1',
            'max_leads'      => 'nullable|integer|min:1',
            'features'       => 'nullable|array',
            'features.*'     => 'string|max:200',
            'badge_color'    => 'nullable|string|max:50',
            'is_active'      => 'boolean',
            'is_featured'    => 'boolean',
            'sort_order'     => 'nullable|integer|min:0',
        ]);

        $data['slug'] = Str::slug($data['name']) . '-' . Str::random(4);

        Plan::create($data);

        return back()->with('success', "Plan \"{$data['name']}\" created.");
    }

    public function update(Request $request, Plan $plan)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:100',
            'description'    => 'nullable|string|max:500',
            'price_monthly'  => 'required|numeric|min:0',
            'price_yearly'   => 'required|numeric|min:0',
            'max_users'      => 'nullable|integer|min:1',
            'max_properties' => 'nullable|integer|min:1',
            'max_leads'      => 'nullable|integer|min:1',
            'features'       => 'nullable|array',
            'features.*'     => 'string|max:200',
            'badge_color'    => 'nullable|string|max:50',
            'is_active'      => 'boolean',
            'is_featured'    => 'boolean',
            'sort_order'     => 'nullable|integer|min:0',
        ]);

        $plan->update($data);

        return back()->with('success', "Plan \"{$plan->name}\" updated.");
    }

    public function destroy(Plan $plan)
    {
        if ($plan->subscriptions()->whereIn('status', ['active', 'trial'])->exists()) {
            return back()->withErrors(['plan' => 'Cannot delete a plan with active subscriptions.']);
        }

        $plan->delete();

        return back()->with('success', 'Plan deleted.');
    }
}
