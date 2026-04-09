<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AnnualConference;
use App\Models\District;
use App\Models\LocalSociety;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * Map what lower roles a given role can manage.
     */
    protected $manageableRoles = [
        'national_admin'   => ['conference_admin', 'district_admin', 'society_admin'],
        'conference_admin' => ['district_admin', 'society_admin'],
        'district_admin'   => ['society_admin'],
        'society_admin'    => [],
    ];

    /**
     * Display a listing of the sub-admins.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $allowedRoles = $this->manageableRoles[$user->role] ?? [];

        if (empty($allowedRoles)) {
            abort(403, 'You do not have permission to manage users.');
        }

        $query = User::whereIn('role', $allowedRoles);

        // Filter users strictly within the administrator's scope
        if ($user->isConferenceAdmin()) {
            $conferenceId = $user->scope_id;
            $conferenceDistrictIds = District::where('annual_conference_id', $conferenceId)->pluck('id');
            $conferenceSocietyIds = LocalSociety::whereIn('district_id', $conferenceDistrictIds)->pluck('id');

            $query->where(function ($q) use ($conferenceId, $conferenceDistrictIds, $conferenceSocietyIds) {
                $q->where(function ($q2) use ($conferenceId) {
                    $q2->where('role', 'conference_admin')->where('scope_id', $conferenceId);
                })->orWhere(function ($q2) use ($conferenceDistrictIds) {
                    $q2->where('role', 'district_admin')->whereIn('scope_id', $conferenceDistrictIds);
                })->orWhere(function ($q2) use ($conferenceSocietyIds) {
                    $q2->where('role', 'society_admin')->whereIn('scope_id', $conferenceSocietyIds);
                });
            });
        } elseif ($user->isDistrictAdmin()) {
            $districtId = $user->scope_id;
            $districtSocietyIds = LocalSociety::where('district_id', $districtId)->pluck('id');

            $query->where(function ($q) use ($districtId, $districtSocietyIds) {
                $q->where(function ($q2) use ($districtId) {
                    $q2->where('role', 'district_admin')->where('scope_id', $districtId);
                })->orWhere(function ($q2) use ($districtSocietyIds) {
                    $q2->where('role', 'society_admin')->whereIn('scope_id', $districtSocietyIds);
                });
            });
        }

        $users = $query->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'email' => $u->email,
                'role' => $u->role,
                'scope_id' => $u->scope_id,
            ];
        });

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Provide necessary scope data to the frontend for the creation form.
     */
    public function create(Request $request)
    {
        $user = $request->user();
        $allowedRoles = $this->manageableRoles[$user->role] ?? [];

        if (empty($allowedRoles)) {
            abort(403);
        }

        $scopes = $this->getAvailableScopes($user);

        return Inertia::render('Users/Form', [
            'allowedRoles' => $allowedRoles,
            'scopes' => $scopes,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $allowedRoles = $this->manageableRoles[$user->role] ?? [];

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role'     => ['required', Rule::in($allowedRoles)],
            'scope_id' => 'required|integer', // Frontend determines the ID based on role
        ]);

        // Security check: Validate the scope_id actually belongs to the user's purview
        if (!$this->isScopeValid($user, $validated['role'], $validated['scope_id'])) {
            abort(403, 'You do not have permission to assign to this scope.');
        }

        $scopeTypeMap = [
            'conference_admin' => 'App\Models\AnnualConference',
            'district_admin'   => 'App\Models\District',
            'society_admin'    => 'App\Models\LocalSociety',
        ];

        User::create([
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'username'   => $validated['username'],
            'password'   => Hash::make($validated['password']),
            'role'       => $validated['role'],
            'scope_id'   => $validated['scope_id'],
            'scope_type' => $scopeTypeMap[$validated['role']],

        ]);

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    /**
     * Edit form.
     */
    public function edit(Request $request, User $user)
    {
        $currentUser = $request->user();
        $allowedRoles = $this->manageableRoles[$currentUser->role] ?? [];

        if (!in_array($user->role, $allowedRoles) || !$this->isScopeValid($currentUser, $user->role, $user->scope_id)) {
            abort(403);
        }

        return Inertia::render('Users/Form', [
            'allowedRoles' => $allowedRoles,
            'scopes' => $this->getAvailableScopes($currentUser),
            'adminUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'scope_id' => $user->scope_id,
            ],
        ]);
    }

    /**
     * Update user.
     */
    public function update(Request $request, User $user)
    {
        $currentUser = $request->user();
        $allowedRoles = $this->manageableRoles[$currentUser->role] ?? [];

        if (!in_array($user->role, $allowedRoles) || !$this->isScopeValid($currentUser, $user->role, $user->scope_id)) {
            abort(403);
        }

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role'     => ['required', Rule::in($allowedRoles)],
            'scope_id' => 'required|integer',
            'password' => 'nullable|string|min:8', // Only update if provided
        ]);

        if (!$this->isScopeValid($currentUser, $validated['role'], $validated['scope_id'])) {
            abort(403, 'You do not have permission to assign to this scope.');
        }

        $scopeTypeMap = [
            'conference_admin' => 'App\Models\AnnualConference',
            'district_admin'   => 'App\Models\District',
            'society_admin'    => 'App\Models\LocalSociety',
        ];

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->username = $validated['username'];
        $user->role = $validated['role'];
        $user->scope_id = $validated['scope_id'];
        $user->scope_type = $scopeTypeMap[$validated['role']];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Delete user.
     */
    public function destroy(Request $request, User $user)
    {
        $currentUser = $request->user();
        $allowedRoles = $this->manageableRoles[$currentUser->role] ?? [];

        if (!in_array($user->role, $allowedRoles) || !$this->isScopeValid($currentUser, $user->role, $user->scope_id)) {
            abort(403);
        }

        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    /**
     * Helper: Fetch all conferences, districts, and societies the current user is allowed to assign.
     */
    private function getAvailableScopes(User $user)
    {
        if ($user->isNationalAdmin()) {
            return [
                'conference_admin' => AnnualConference::all(),
                'district_admin'   => District::with('annualConference')->get(),
                'society_admin'    => LocalSociety::with('district')->get(),
            ];
        }

        if ($user->isConferenceAdmin()) {
            $conferenceId = $user->scope_id;
            return [
                'district_admin' => District::where('annual_conference_id', $conferenceId)->get(),
                'society_admin'  => LocalSociety::whereHas('district', function ($q) use ($conferenceId) {
                    $q->where('annual_conference_id', $conferenceId);
                })->with('district')->get(),
            ];
        }

        if ($user->isDistrictAdmin()) {
            $districtId = $user->scope_id;
            return [
                'society_admin' => LocalSociety::where('district_id', $districtId)->get(),
            ];
        }

        return [];
    }

    /**
     * Helper: Validate if a user can actually assign an admin to a specific scope ID.
     */
    private function isScopeValid(User $user, $role, $scope_id)
    {
        $scopes = $this->getAvailableScopes($user);
        
        if (!isset($scopes[$role])) {
            return false;
        }

        return $scopes[$role]->contains('id', $scope_id);
    }
}
