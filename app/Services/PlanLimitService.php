<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PlanLimitService
{
    /**
     * Returns an error message if the company has hit its plan limit for the
     * given resource, or null if the action is allowed.
     *
     * Null plan limits mean unlimited (Enterprise).
     * Companies with no active subscription are not blocked (super admin can
     * enforce subscription status separately).
     */
    public static function check(string $resource, int $companyId): ?string
    {
        $plan = DB::table('subscriptions')
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->where('subscriptions.company_id', $companyId)
            ->whereIn('subscriptions.status', ['active', 'trial'])
            ->where(fn ($q) => $q->whereNull('subscriptions.ends_at')
                                 ->orWhere('subscriptions.ends_at', '>=', now()))
            ->select('plans.name', 'plans.max_users', 'plans.max_properties', 'plans.max_leads')
            ->first();

        if (!$plan) {
            return null; // No active subscription — enforcement deferred to super admin
        }

        [$limit, $count, $label] = match ($resource) {
            'users' => [
                $plan->max_users,
                User::withoutGlobalScopes()
                    ->where('company_id', $companyId)
                    ->where('is_super_admin', false)
                    ->count(),
                'team members',
            ],
            'properties' => [
                $plan->max_properties,
                Property::withoutGlobalScopes()
                    ->where('company_id', $companyId)
                    ->count(),
                'properties',
            ],
            'leads' => [
                $plan->max_leads,
                Lead::withoutGlobalScopes()
                    ->where('company_id', $companyId)
                    ->count(),
                'leads',
            ],
            default => [null, 0, $resource],
        };

        if ($limit === null) {
            return null; // Unlimited on this plan
        }

        if ($count >= $limit) {
            return "Your {$plan->name} plan allows a maximum of {$limit} {$label}. "
                 . 'Please contact your administrator to upgrade your subscription.';
        }

        return null;
    }
}
