<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Show the settings form.
     */
    public function edit(Request $request)
    {
        return Inertia::render('Settings', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the admin's own credentials.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'username'         => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'current_password' => 'nullable|string',
            'password'         => 'nullable|string|min:8|confirmed',
        ]);

        // If the user is trying to change their password, verify current one first
        if (!empty($validated['password'])) {
            if (empty($validated['current_password']) || !Hash::check($validated['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => 'The current password is incorrect.',
                ]);
            }
        }

        $user->name     = $validated['name'];
        $user->username = $validated['username'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('success', 'Your settings have been updated successfully.');
    }
}
