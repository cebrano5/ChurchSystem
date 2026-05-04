<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AnnualConference;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;


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

        $conferences = AnnualConference::withCount('districts')
            ->with(['admins' => function($q) {
                $q->limit(1); // Usually one primary admin
            }])
            ->orderBy('name')
            ->get();

        return Inertia::render('Conferences/Index', [
            'conferences' => $conferences,
        ]);
    }

    /**
     * Display the specified conference's detail view.
     */
    public function show(Request $request, AnnualConference $conference)
    {
        $user = $request->user();
        if (!$user->isNationalAdmin()) abort(403);

        $conference->load(['admins']);
        $societyIds = $conference->localSocieties()->pluck('local_societies.id')->toArray();

        return Inertia::render('Conferences/Show', [
            'conference'     => $conference,
            'admin'          => $conference->admins->first(),
            'districtCount'  => $conference->districts()->count(),
            'societyCount'   => count($societyIds),
            'memberCount'    => $conference->members()->count(),
            'totalDonations' => \App\Models\Donation::whereIn('local_society_id', $societyIds)->sum('amount'),
            'districts'      => $conference->districts()->withCount('localSocieties')->orderBy('name')->get(),
            'recentMembers'  => $conference->members()->orderBy('members.created_at', 'desc')->take(6)->get(),
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
            'latitude'       => 'nullable|numeric|between:-90,90',
            'longitude'      => 'nullable|numeric|between:-180,180',
            'location_name'  => 'nullable|string|max:500',
            // Admin Credentials
            'admin_name'     => 'required|string|max:255',
            'admin_username' => 'required|string|max:255|unique:users,username',
            'admin_password' => 'required|string|min:8',
        ]);

        DB::transaction(function () use ($validated) {
            $conference = AnnualConference::create([
                'name'           => $validated['name'],
                'region'         => $validated['region'],
                'description'    => $validated['description'],
                'established_at' => $validated['established_at'],
                'latitude'       => $validated['latitude'] ?? null,
                'longitude'      => $validated['longitude'] ?? null,
                'location_name'  => $validated['location_name'] ?? null,
            ]);

            User::create([
                'name'       => $validated['admin_name'],
                'username'   => $validated['admin_username'],
                'password'   => Hash::make($validated['admin_password']),
                'role'       => 'conference_admin',
                'scope_id'   => $conference->id,
                'scope_type' => AnnualConference::class,
            ]);
        });

        return redirect()->route('conferences.index')->with('success', 'Annual Conference and Administrator created successfully.');
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

        $conference->load('admins');

        return Inertia::render('Conferences/Form', [
            'conference' => $conference,
            'admin' => $conference->admins->first(),
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

        $admin = $conference->admins->first();

        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'region'         => 'required|string|max:255',
            'description'    => 'nullable|string',
            'established_at' => 'required|date',
            'latitude'       => 'nullable|numeric|between:-90,90',
            'longitude'      => 'nullable|numeric|between:-180,180',
            'location_name'  => 'nullable|string|max:500',
            // Admin Credentials
            'admin_name'     => 'required|string|max:255',
            'admin_username' => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($admin?->id)],
            'admin_password' => 'nullable|string|min:8',
        ]);

        DB::transaction(function () use ($conference, $admin, $validated) {
            $conference->update([
                'name'           => $validated['name'],
                'region'         => $validated['region'],
                'description'    => $validated['description'],
                'established_at' => $validated['established_at'],
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
                // Create one if it mysteriously doesn't exist
                User::create([
                    'name'       => $validated['admin_name'],
                    'username'   => $validated['admin_username'],
                    'password'   => Hash::make($validated['admin_password'] ?? 'password123'),
                    'role'       => 'conference_admin',
                    'scope_id'   => $conference->id,
                    'scope_type' => AnnualConference::class,
                ]);
            }
        });

        return redirect()->route('conferences.index')->with('success', 'Annual Conference and Administrator updated successfully.');
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
