<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\AnnualConference;
use App\Models\User;
use App\Models\LocalSociety;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class DistrictController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = District::with('annualConference')
            ->withCount('localSocieties')
            ->with(['admins' => function($q) {
                $q->limit(1);
            }])
            ->orderBy('name');

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
            // Admin Credentials
            'admin_name'           => 'required|string|max:255',
            'admin_username'       => 'required|string|max:255|unique:users,username',
            'admin_password'       => 'required|string|min:8',
        ]);

        DB::transaction(function () use ($validated) {
            $district = District::create([
                'annual_conference_id' => $validated['annual_conference_id'],
                'name'                 => $validated['name'],
                'description'          => $validated['description'],
            ]);

            User::create([
                'name'       => $validated['admin_name'],
                'username'   => $validated['admin_username'],
                'password'   => Hash::make($validated['admin_password']),
                'role'       => 'district_admin',
                'scope_id'   => $district->id,
                'scope_type' => District::class,
            ]);
        });

        return redirect()->route('districts.index')->with('success', 'District and Administrator created successfully.');
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

        $district->load('admins');

        return Inertia::render('Districts/Form', [
            'district' => $district,
            'admin' => $district->admins->first(),
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

        $admin = $district->admins->first();

        $conferenceValidation = ['required', 'integer', Rule::exists('annual_conferences', 'id')];
        if ($user->isConferenceAdmin()) {
            $conferenceValidation[] = Rule::in([$user->scope_id]);
        }

        $validated = $request->validate([
            'annual_conference_id' => $conferenceValidation,
            'name'                 => 'required|string|max:255',
            'description'          => 'nullable|string',
            // Admin Credentials
            'admin_name'           => 'required|string|max:255',
            'admin_username'       => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($admin?->id)],
            'admin_password'       => 'nullable|string|min:8',
        ]);

        DB::transaction(function () use ($district, $admin, $validated) {
            $district->update([
                'annual_conference_id' => $validated['annual_conference_id'],
                'name'                 => $validated['name'],
                'description'          => $validated['description'],
            ]);

            if ($admin) {
                $adminData = [
                    'name'     => $validated['admin_name'],
                    'username' => $validated['admin_username'],
                ];
                if (!empty($validated['admin_password'])) {
                    $adminData['password'] = Hash::make($validated['admin_password']);
                }
                $admin->update($adminData);
            } else {
                User::create([
                    'name'       => $validated['admin_name'],
                    'username'   => $validated['admin_username'],
                    'password'   => Hash::make($validated['admin_password'] ?? 'password123'),
                    'role'       => 'district_admin',
                    'scope_id'   => $district->id,
                    'scope_type' => District::class,
                ]);
            }
        });

        return redirect()->route('districts.index')->with('success', 'District and Administrator updated successfully.');
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
