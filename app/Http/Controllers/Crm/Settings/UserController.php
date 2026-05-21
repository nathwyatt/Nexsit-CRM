<?php

namespace App\Http\Controllers\Crm\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PlanLimitService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::orderByDesc('is_active')
            ->orderBy('name')
            ->get()
            ->map(fn ($u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'email'         => $u->email,
                'phone'         => $u->phone,
                'role'          => $u->role,
                'is_active'     => $u->is_active,
                'last_login_at' => $u->last_login_at?->diffForHumans(),
                'avatar'        => $u->avatar,
                'is_self'       => $u->id === auth()->id(),
            ]);

        return Inertia::render('Settings/Users/Index', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        if ($error = PlanLimitService::check('users', auth()->user()->company_id)) {
            return back()->with('error', $error);
        }

        $data = $request->validate([
            'name'  => 'required|string|max:120',
            'email' => 'required|email|unique:users,email',
            'role'  => 'required|in:admin,manager,agent',
            'phone' => 'nullable|string|max:30',
        ]);

        $tempPassword = Str::random(12);

        User::create([
            'company_id' => auth()->user()->company_id,
            'name'       => $data['name'],
            'email'      => $data['email'],
            'role'       => $data['role'],
            'phone'      => $data['phone'] ?? null,
            'password'   => Hash::make($tempPassword),
            'is_active'  => true,
        ]);

        return back()->with('success', "User invited. Temp password: {$tempPassword}");
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:120',
            'email' => "required|email|unique:users,email,{$user->id}",
            'role'  => 'required|in:admin,manager,agent',
            'phone' => 'nullable|string|max:30',
        ]);

        $user->update($data);

        return back()->with('success', 'User updated.');
    }

    public function toggleActive(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['user' => 'You cannot deactivate your own account.']);
        }

        $user->update(['is_active' => ! $user->is_active]);

        $status = $user->is_active ? 'activated' : 'deactivated';

        return back()->with('success', "User {$status}.");
    }

    public function resetPassword(User $user)
    {
        $tempPassword = Str::random(12);
        $user->update(['password' => Hash::make($tempPassword)]);

        return back()->with('success', "Password reset. New temp password: {$tempPassword}");
    }
}
