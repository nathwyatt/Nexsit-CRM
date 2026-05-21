<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show()
    {
        return Inertia::render('Profile/Show', [
            'user' => auth()->user()->only('id', 'name', 'email', 'phone', 'role', 'avatar'),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:120',
            'email' => 'required|email|unique:users,email,' . auth()->id(),
            'phone' => 'nullable|string|max:30',
        ]);

        auth()->user()->update($data);

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|min:8|confirmed',
        ]);

        if (! Hash::check($request->current_password, auth()->user()->password)) {
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        auth()->user()->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Password changed.');
    }
}
