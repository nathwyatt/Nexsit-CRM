<?php

namespace App\Http\Middleware;

use App\Models\WhatsappTemplate;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'email'          => $user->email,
                    'role'           => $user->role,
                    'avatar'         => $user->avatar,
                    'company_id'     => $user->company_id,
                    'is_super_admin' => (bool) $user->is_super_admin,
                ] : null,
                'company' => $user?->company_id ? [
                    'id'   => $user->company_id,
                    'name' => $user->company?->name,
                    'logo' => $user->company?->logo,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            'notifications_unread' => fn () => $user?->unreadNotifications()->count() ?? 0,
            'whatsapp_templates'   => fn () => $user
                ? WhatsappTemplate::where('company_id', $user->company_id)
                    ->where('is_active', true)
                    ->orderBy('module')
                    ->orderBy('name')
                    ->get(['id', 'name', 'module', 'body', 'is_active'])
                : [],
        ]);
    }
}
