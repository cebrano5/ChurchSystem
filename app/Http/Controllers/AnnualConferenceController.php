<?php

namespace App\Http\Controllers;

use App\Models\AnnualConference;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnualConferenceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user->isNationalAdmin()) {
            abort(403);
        }

        $conferences = AnnualConference::withCount('districts')->orderBy('name')->get();

        return Inertia::render('Conferences/Index', [
            'conferences' => $conferences,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $user = $request->user();
        if (!$user->isNationalAdmin()) {
            abort(403);
        }

        return Inertia::render('Conferences/Form');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->isNationalAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'region'         => 'required|string|max:255',
            'description'    => 'nullable|string',
            'established_at' => 'required|date',
        ]);

        AnnualConference::create($validated);

        return redirect()->route('conferences.index')->with('success', 'Annual Conference created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, AnnualConference $conference)
    {
        $user = $request->user();
        if (!$user->isNationalAdmin()) {
            abort(403);
        }

        return Inertia::render('Conferences/Form', [
            'conference' => $conference,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AnnualConference $conference)
    {
        $user = $request->user();
        if (!$user->isNationalAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'region'         => 'required|string|max:255',
            'description'    => 'nullable|string',
            'established_at' => 'required|date',
        ]);

        $conference->update($validated);

        return redirect()->route('conferences.index')->with('success', 'Annual Conference updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, AnnualConference $conference)
    {
        $user = $request->user();
        if (!$user->isNationalAdmin()) {
            abort(403);
        }

        $conference->delete();

        return redirect()->route('conferences.index')->with('success', 'Annual Conference deleted successfully.');
    }
}
