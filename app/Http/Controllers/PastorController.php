<?php

namespace App\Http\Controllers;

use App\Models\Pastor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PastorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if (!config('features.pastors_module')) {
            abort(404);
        }

        $user = $request->user();
        $query = Pastor::with('scope')
            ->where('scope_type', $user->scope_type)
            ->where('scope_id', $user->scope_id)
            ->orderBy('full_name');

        return Inertia::render('Pastors/Index', [
            'pastors' => $query->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        if (!config('features.pastors_module')) {
            abort(404);
        }

        return Inertia::render('Pastors/Form');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!config('features.pastors_module')) {
            abort(404);
        }

        $user = $request->user();

        $validated = $request->validate([
            'full_name'        => 'required|string|max:255',
            'email'           => 'nullable|email|max:255',
            'phone'           => 'nullable|string|max:255',
            'role_or_position' => 'required|string|max:255',
            'status'          => 'required|string|in:Active,Inactive',
            'assigned_at'     => 'required|date',
            'notes'           => 'nullable|string',
        ]);

        $validated['scope_type'] = $user->scope_type;
        $validated['scope_id']   = $user->scope_id;

        Pastor::create($validated);

        return redirect()->route('pastors.index')->with('success', 'Pastor profile created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Pastor $pastor)
    {
        if (!config('features.pastors_module')) {
            abort(404);
        }

        $this->authorizeAccess($request->user(), $pastor);

        $pastor->load('scope');

        return Inertia::render('Pastors/Show', [
            'pastor' => $pastor,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Pastor $pastor)
    {
        if (!config('features.pastors_module')) {
            abort(404);
        }

        $this->authorizeAccess($request->user(), $pastor);

        return Inertia::render('Pastors/Form', [
            'pastor' => $pastor,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pastor $pastor)
    {
        if (!config('features.pastors_module')) {
            abort(404);
        }

        $this->authorizeAccess($request->user(), $pastor);

        $validated = $request->validate([
            'full_name'        => 'required|string|max:255',
            'email'           => 'nullable|email|max:255',
            'phone'           => 'nullable|string|max:255',
            'role_or_position' => 'required|string|max:255',
            'status'          => 'required|string|in:Active,Inactive',
            'assigned_at'     => 'required|date',
            'notes'           => 'nullable|string',
        ]);

        $pastor->update($validated);

        return redirect()->route('pastors.index')->with('success', 'Pastor profile updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Pastor $pastor)
    {
        if (!config('features.pastors_module')) {
            abort(404);
        }

        $this->authorizeAccess($request->user(), $pastor);

        $pastor->delete();

        return redirect()->route('pastors.index')->with('success', 'Pastor profile archived successfully.');
    }

    /**
     * Internal helper to authorize access to a specific pastor record.
     * Pastors are private to the admin scope that created them.
     */
    protected function authorizeAccess($user, $pastor)
    {
        if ($pastor->scope_type !== $user->scope_type || $pastor->scope_id !== $user->scope_id) {
            abort(403);
        }
    }
}
