<?php

namespace App\Http\Controllers;

use App\Models\LocalSociety;
use App\Models\District;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class LocalSocietyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = LocalSociety::with('district.annualConference')->withCount('members')->orderBy('name');

        if ($user->isConferenceAdmin()) {
            $query->whereHas('district', function ($q) use ($user) {
                $q->where('annual_conference_id', $user->scope_id);
            });
        } elseif ($user->isDistrictAdmin()) {
            $query->where('district_id', $user->scope_id);
        }

        return Inertia::render('Societies/Index', [
            'societies' => $query->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $user = $request->user();

        if ($user->isNationalAdmin()) {
            $districts = District::with('annualConference')->orderBy('name')->get();
        } elseif ($user->isConferenceAdmin()) {
            $districts = District::where('annual_conference_id', $user->scope_id)->with('annualConference')->orderBy('name')->get();
        } elseif ($user->isDistrictAdmin()) {
            $districts = District::where('id', $user->scope_id)->with('annualConference')->orderBy('name')->get();
        } else {
            abort(403);
        }

        return Inertia::render('Societies/Form', [
            'districts' => $districts,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validDistrictIds = [];
        if ($user->isNationalAdmin()) {
            $validDistrictIds = District::pluck('id')->toArray();
        } elseif ($user->isConferenceAdmin()) {
            $validDistrictIds = District::where('annual_conference_id', $user->scope_id)->pluck('id')->toArray();
        } elseif ($user->isDistrictAdmin()) {
            $validDistrictIds = [$user->scope_id];
        } else {
            abort(403);
        }

        $validated = $request->validate([
            'district_id'    => ['required', 'integer', Rule::in($validDistrictIds)],
            'name'           => 'required|string|max:255',
            'address'        => 'required|string',
            'contact_person' => 'required|string|max:255',
            'contact_phone'  => 'required|string|max:255',
        ]);

        LocalSociety::create($validated);

        return redirect()->route('societies.index')->with('success', 'Local Society created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, LocalSociety $society)
    {
        $user = $request->user();

        // Validate view permission
        if ($user->isConferenceAdmin()) {
            $district = District::findOrFail($society->district_id);
            if ($district->annual_conference_id !== $user->scope_id) abort(403);
        } elseif ($user->isDistrictAdmin()) {
            if ($society->district_id !== $user->scope_id) abort(403);
        } elseif (!$user->isNationalAdmin()) {
            abort(403);
        }

        if ($user->isNationalAdmin()) {
            $districts = District::with('annualConference')->orderBy('name')->get();
        } elseif ($user->isConferenceAdmin()) {
            $districts = District::where('annual_conference_id', $user->scope_id)->with('annualConference')->orderBy('name')->get();
        } else {
            $districts = District::where('id', $user->scope_id)->with('annualConference')->get();
        }

        return Inertia::render('Societies/Form', [
            'society' => $society,
            'districts' => $districts,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LocalSociety $society)
    {
        $user = $request->user();

        // Validate view permission
        if ($user->isConferenceAdmin()) {
            $district = District::findOrFail($society->district_id);
            if ($district->annual_conference_id !== $user->scope_id) abort(403);
        } elseif ($user->isDistrictAdmin()) {
            if ($society->district_id !== $user->scope_id) abort(403);
        } elseif (!$user->isNationalAdmin()) {
            abort(403);
        }

        $validDistrictIds = [];
        if ($user->isNationalAdmin()) {
            $validDistrictIds = District::pluck('id')->toArray();
        } elseif ($user->isConferenceAdmin()) {
            $validDistrictIds = District::where('annual_conference_id', $user->scope_id)->pluck('id')->toArray();
        } elseif ($user->isDistrictAdmin()) {
            $validDistrictIds = [$user->scope_id];
        }

        $validated = $request->validate([
            'district_id'    => ['required', 'integer', Rule::in($validDistrictIds)],
            'name'           => 'required|string|max:255',
            'address'        => 'required|string',
            'contact_person' => 'required|string|max:255',
            'contact_phone'  => 'required|string|max:255',
        ]);

        $society->update($validated);

        return redirect()->route('societies.index')->with('success', 'Local Society updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, LocalSociety $society)
    {
        $user = $request->user();

        // Validate deletion permission
        if ($user->isConferenceAdmin()) {
            $district = District::findOrFail($society->district_id);
            if ($district->annual_conference_id !== $user->scope_id) abort(403);
        } elseif ($user->isDistrictAdmin()) {
            if ($society->district_id !== $user->scope_id) abort(403);
        } elseif (!$user->isNationalAdmin()) {
            abort(403);
        }

        $society->delete();

        return redirect()->route('societies.index')->with('success', 'Local Society deleted successfully.');
    }
}
