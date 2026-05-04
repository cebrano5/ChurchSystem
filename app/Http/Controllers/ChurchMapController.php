<?php

namespace App\Http\Controllers;

use App\Models\LocalSociety;
use App\Models\District;
use App\Models\AnnualConference;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChurchMapController extends Controller
{
    /**
     * Display the map with hierarchy.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $national = [];
        $conferences = [];
        $districts = [];
        $societies = [];

        if ($user->isNationalAdmin()) {
            $national = User::where('role', 'national_admin')->get(['id', 'name', 'latitude', 'longitude', 'location_name']);
            $conferences = AnnualConference::orderBy('name')->get();
            $districts = District::with('annualConference')->orderBy('name')->get();
            $societies = LocalSociety::with('district.annualConference')->orderBy('name')->get();
        } elseif ($user->isConferenceAdmin()) {
            $conferences = AnnualConference::where('id', $user->scope_id)->get();
            $districts = District::where('annual_conference_id', $user->scope_id)->with('annualConference')->orderBy('name')->get();
            $societies = LocalSociety::whereHas('district', function ($q) use ($user) {
                $q->where('annual_conference_id', $user->scope_id);
            })->with('district.annualConference')->orderBy('name')->get();
        } elseif ($user->isDistrictAdmin()) {
            $districts = District::where('id', $user->scope_id)->with('annualConference')->get();
            $societies = LocalSociety::where('district_id', $user->scope_id)->with('district.annualConference')->orderBy('name')->get();
        }

        // Calculate default center based on user scope
        $defaultCenter = null;
        if ($user->isDistrictAdmin()) {
            $d = District::find($user->scope_id);
            if ($d && $d->latitude) $defaultCenter = ['lat' => $d->latitude, 'lng' => $d->longitude];
        } elseif ($user->isConferenceAdmin()) {
            $c = AnnualConference::find($user->scope_id);
            if ($c && $c->latitude) $defaultCenter = ['lat' => $c->latitude, 'lng' => $c->longitude];
        }

        // If no headquarter location, find first society with location in scope
        if (!$defaultCenter) {
            $firstSociety = $societies->whereNotNull('latitude')->first();
            if ($firstSociety) {
                $defaultCenter = ['lat' => $firstSociety->latitude, 'lng' => $firstSociety->longitude];
            }
        }

        return Inertia::render('Map/Index', [
            'national' => $national,
            'conferences' => $conferences,
            'districts' => $districts,
            'societies' => $societies,
            'defaultCenter' => $defaultCenter,
        ]);
    }

    /**
     * Update the location coordinates for a specific hierarchy level.
     */
    public function updateLocation(Request $request, $type, $id)
    {
        $user = $request->user();

        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'location_name' => 'nullable|string|max:500',
        ]);

        if ($type === 'national' && $user->isNationalAdmin()) {
            $model = User::where('role', 'national_admin')->findOrFail($id);
        } elseif ($type === 'conference') {
            $model = AnnualConference::findOrFail($id);
            if ($user->isConferenceAdmin() && $model->id != $user->scope_id) abort(403);
            if (!$user->isNationalAdmin() && !$user->isConferenceAdmin()) abort(403);
        } elseif ($type === 'district') {
            $model = District::findOrFail($id);
            if ($user->isConferenceAdmin() && $model->annual_conference_id != $user->scope_id) abort(403);
            if ($user->isDistrictAdmin() && $model->id != $user->scope_id) abort(403);
            if (!$user->isNationalAdmin() && !$user->isConferenceAdmin() && !$user->isDistrictAdmin()) abort(403);
        } elseif ($type === 'society') {
            $model = LocalSociety::findOrFail($id);
            if ($user->isConferenceAdmin()) {
                $district = District::findOrFail($model->district_id);
                if ($district->annual_conference_id != $user->scope_id) abort(403);
            } elseif ($user->isDistrictAdmin()) {
                if ($model->district_id != $user->scope_id) abort(403);
            } elseif (!$user->isNationalAdmin()) {
                abort(403);
            }
        } else {
            abort(403);
        }

        $model->update([
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'location_name' => $validated['location_name'] ?? $model->location_name,
        ]);

        return redirect()->back()->with('success', 'Location updated successfully.');
    }
}
