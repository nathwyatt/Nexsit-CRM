<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    // These named routes are always accessible regardless of subscription status
    protected array $except = ['logout', 'subscription.expired'];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->routeIs(...$this->except)) {
            return $next($request);
        }

        $user = auth()->user();

        // Super admins and users without a company bypass subscription checks
        if ($user->is_super_admin || !$user->company_id) {
            return $next($request);
        }

        $active = DB::table('subscriptions')
            ->where('company_id', $user->company_id)
            ->where(function ($q) {
                // Active subscription with a valid end date (or open-ended)
                $q->where(function ($q) {
                    $q->where('status', 'active')
                      ->where(fn ($q) => $q->whereNull('ends_at')
                                           ->orWhere('ends_at', '>=', now()));
                })
                // Trial that has not yet expired
                ->orWhere(function ($q) {
                    $q->where('status', 'trial')
                      ->where(fn ($q) => $q->whereNull('trial_ends_at')
                                           ->orWhere('trial_ends_at', '>=', now()));
                });
            })
            ->exists();

        if (!$active) {
            return redirect()->route('subscription.expired');
        }

        return $next($request);
    }
}
