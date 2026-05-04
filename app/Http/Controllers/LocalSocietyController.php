<?php

namespace App\Http\Controllers;

use App\Models\LocalSociety;
use App\Models\District;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class LocalSocietyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = LocalSociety::with('district.annualConference')
            ->withCount('members')
            ->with(['admins' => function($q) {
                $q->limit(1);
            }])
            ->orderBy('name');

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
     * Display the specified local society's detail view.
     */
    public function show(Request $request, LocalSociety $society)
    {
        $user = $request->user();

        // Scope checks
        if ($user->isConferenceAdmin()) {
            $district = District::findOrFail($society->district_id);
            if ($district->annual_conference_id != $user->scope_id) abort(403);
        } elseif ($user->isDistrictAdmin()) {
            if ($society->district_id != $user->scope_id) abort(403);
        } elseif (!$user->isNationalAdmin()) {
            abort(403);
        }

        $society->load([
            'district.annualConference',
            'admins',
        ]);

        return Inertia::render('Societies/Show', [
            'society'       => $society,
            'admin'         => $society->admins->first(),
            'memberCount'   => $society->members()->count(),
            'ministryCount' => $society->ministries()->count(),
            'totalDonations'=> $society->donations()->sum('amount'),
            'upcomingEvents'=> $society->events()
                                ->where('event_date', '>=', now())
                                ->orderBy('event_date')
                                ->get()
                                ->unique(function ($item) {
                                    return $item->series_id ?? 'standalone_' . $item->id;
                                })
                                ->values()
                                ->take(5),
            'recentMembers' => $society->members()
                                ->orderBy('created_at', 'desc')
                                ->get(),
            'recentDonations'=> $society->donations()
                                ->orderBy('created_at', 'desc')
                                ->take(5)
                                ->get(),
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
            'address'        => 'nullable|string',
            'contact_person' => 'required|string|max:255',
            'contact_phone'  => 'required|string|max:255',
            'latitude'       => 'nullable|numeric|between:-90,90',
            'longitude'      => 'nullable|numeric|between:-180,180',
            'location_name'  => 'nullable|string|max:500',
            // Admin Credentials
            'admin_name'     => 'required|string|max:255',
            'admin_username' => 'required|string|max:255|unique:users,username',
            'admin_password' => 'required|string|min:8',
        ]);

        DB::transaction(function () use ($validated) {
            $society = LocalSociety::create([
                'district_id'    => $validated['district_id'],
                'name'           => $validated['name'],
                'address'        => $validated['address'] ?? null,
                'contact_person' => $validated['contact_person'],
                'contact_phone'  => $validated['contact_phone'],
                'latitude'       => $validated['latitude'] ?? null,
                'longitude'      => $validated['longitude'] ?? null,
                'location_name'  => $validated['location_name'] ?? null,
            ]);

            User::create([
                'name'       => $validated['admin_name'],
                'username'   => $validated['admin_username'],
                'password'   => Hash::make($validated['admin_password']),
                'role'       => 'society_admin',
                'scope_id'   => $society->id,
                'scope_type' => LocalSociety::class,
            ]);
        });

        return redirect()->route('societies.index')->with('success', 'Local Society and Administrator created successfully.');
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
            if ($district->annual_conference_id != $user->scope_id) abort(403);
        } elseif ($user->isDistrictAdmin()) {
            if ($society->district_id != $user->scope_id) abort(403);
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

        $society->load('admins');

        return Inertia::render('Societies/Form', [
            'society' => $society,
            'admin' => $society->admins->first(),
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
            if ($district->annual_conference_id != $user->scope_id) abort(403);
        } elseif ($user->isDistrictAdmin()) {
            if ($society->district_id != $user->scope_id) abort(403);
        } elseif (!$user->isNationalAdmin()) {
            abort(403);
        }

        $admin = $society->admins->first();

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
            'address'        => 'nullable|string',
            'contact_person' => 'required|string|max:255',
            'contact_phone'  => 'required|string|max:255',
            'latitude'       => 'nullable|numeric|between:-90,90',
            'longitude'      => 'nullable|numeric|between:-180,180',
            'location_name'  => 'nullable|string|max:500',
            // Admin Credentials
            'admin_name'     => 'required|string|max:255',
            'admin_username' => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($admin?->id)],
            'admin_password' => 'nullable|string|min:8',
        ]);

        DB::transaction(function () use ($society, $admin, $validated) {
            $society->update([
                'district_id'    => $validated['district_id'],
                'name'           => $validated['name'],
                'address'        => $validated['address'] ?? null,
                'contact_person' => $validated['contact_person'],
                'contact_phone'  => $validated['contact_phone'],
                'latitude'       => $validated['latitude'] ?? null,
                'longitude'      => $validated['longitude'] ?? null,
                'location_name'  => $validated['location_name'] ?? null,
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
                    'role'       => 'society_admin',
                    'scope_id'   => $society->id,
                    'scope_type' => LocalSociety::class,
                ]);
            }
        });

        return redirect()->route('societies.index')->with('success', 'Local Society and Administrator updated successfully.');
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
            if ($district->annual_conference_id != $user->scope_id) abort(403);
        } elseif ($user->isDistrictAdmin()) {
            if ($society->district_id != $user->scope_id) abort(403);
        } elseif (!$user->isNationalAdmin()) {
            abort(403);
        }

        $society->delete();

        return redirect()->route('societies.index')->with('success', 'Local Society deleted successfully.');
    }
}
