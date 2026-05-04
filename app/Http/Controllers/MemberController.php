<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Ministry;
use App\Models\LocalSociety;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class MemberController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Use the centralized scoping logic from the User model
        $societyIds = $user->getAccessibleSocietyIds();
        
        $query = Member::whereIn('local_society_id', $societyIds)
            ->with('localSociety.district.annualConference')
            ->orderBy('last_name')
            ->orderBy('first_name');


        return Inertia::render('Members/Index', [
            'members' => $query->paginate(10),
            'canManage' => $user->isSocietyAdmin() // Only society admins can CRUD members for now
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $user = $request->user();
        $societyIds = $user->getAccessibleSocietyIds();
        $societies = LocalSociety::whereIn('id', $societyIds)->get();

        // Fetch all global ministries for the catalog
        $ministries = Ministry::orderBy('name')->get();

        return Inertia::render('Members/Form', [
            'ministries' => $ministries,
            'societies'  => $societies,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'local_society_id' => 'required|exists:local_societies,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:Active,Inactive',
            'ministry_id' => 'nullable|integer|exists:ministries,id'
        ]);

        $member = Member::create($validated);

        if ($validated['ministry_id']) {
            $member->ministries()->sync([$validated['ministry_id']]);
        }

        return redirect()->route('members.index')->with('success', 'Member created and assigned successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Member $member)
    {
        $user = $request->user();
        $societyIds = $user->getAccessibleSocietyIds();

        if (!in_array($member->local_society_id, $societyIds)) {
            abort(403);
        }

        $ministries = Ministry::orderBy('name')->get();
        $societies = LocalSociety::whereIn('id', $societyIds)->get();
        $member->load('ministries');

        return Inertia::render('Members/Form', [
            'member' => $member,
            'ministries' => $ministries,
            'societies'  => $societies,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Member $member)
    {
        $user = $request->user();
        $societyIds = $user->getAccessibleSocietyIds();

        if (!in_array($member->local_society_id, $societyIds)) {
            abort(403);
        }

        $validated = $request->validate([
            'local_society_id' => 'required|exists:local_societies,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:Active,Inactive',
            'ministry_id' => 'nullable|integer|exists:ministries,id'
        ]);

        $member->update($validated);

        if (array_key_exists('ministry_id', $validated)) {
            $member->ministries()->sync($validated['ministry_id'] ? [$validated['ministry_id']] : []);
        }

        return redirect()->route('members.index')->with('success', 'Member updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Member $member)
    {
        $user = $request->user();
        if (!in_array($member->local_society_id, $user->getAccessibleSocietyIds())) {
            abort(403);
        }

        $member->delete();
        return redirect()->route('members.index')->with('success', 'Member removed.');
    }
}
