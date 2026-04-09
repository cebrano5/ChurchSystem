<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\AnnualConference;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class DistrictController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = District::with('annualConference')->withCount('localSocieties')->orderBy('name');

        if ($user->isConferenceAdmin()) {
            $query->where('annual_conference_id', $user->scope_id);
        }

        return Inertia::render('Districts/Index', [
            'districts' => $query->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $user = $request->user();

        if ($user->isNationalAdmin()) {
            $conferences = AnnualConference::orderBy('name')->get();
        } elseif ($user->isConferenceAdmin()) {
            $conferences = AnnualConference::where('id', $user->scope_id)->get();
        } else {
            abort(403);
        }

        return Inertia::render('Districts/Form', [
            'conferences' => $conferences,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $conferenceValidation = ['required', 'integer', Rule::exists('annual_conferences', 'id')];
        if ($user->isConferenceAdmin()) {
            $conferenceValidation[] = Rule::in([$user->scope_id]);
        } elseif (!$user->isNationalAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'annual_conference_id' => $conferenceValidation,
            'name'                 => 'required|string|max:255',
            'description'          => 'nullable|string',
        ]);

        District::create($validated);

        return redirect()->route('districts.index')->with('success', 'District created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, District $district)
    {
        $user = $request->user();

        if ($user->isConferenceAdmin() && $district->annual_conference_id !== $user->scope_id) {
            abort(403);
        } elseif (!$user->isNationalAdmin() && !$user->isConferenceAdmin()) {
            abort(403);
        }

        if ($user->isNationalAdmin()) {
            $conferences = AnnualConference::orderBy('name')->get();
        } else {
            $conferences = AnnualConference::where('id', $user->scope_id)->get();
        }

        return Inertia::render('Districts/Form', [
            'district' => $district,
            'conferences' => $conferences,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, District $district)
    {
        $user = $request->user();

        if ($user->isConferenceAdmin() && $district->annual_conference_id !== $user->scope_id) {
            abort(403);
        } elseif (!$user->isNationalAdmin() && !$user->isConferenceAdmin()) {
            abort(403);
        }

        $conferenceValidation = ['required', 'integer', Rule::exists('annual_conferences', 'id')];
        if ($user->isConferenceAdmin()) {
            $conferenceValidation[] = Rule::in([$user->scope_id]);
        }

        $validated = $request->validate([
            'annual_conference_id' => $conferenceValidation,
            'name'                 => 'required|string|max:255',
            'description'          => 'nullable|string',
        ]);

        $district->update($validated);

        return redirect()->route('districts.index')->with('success', 'District updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, District $district)
    {
        $user = $request->user();

        if ($user->isConferenceAdmin() && $district->annual_conference_id !== $user->scope_id) {
            abort(403);
        } elseif (!$user->isNationalAdmin() && !$user->isConferenceAdmin()) {
            abort(403);
        }

        $district->delete();

        return redirect()->route('districts.index')->with('success', 'District deleted successfully.');
    }
}
