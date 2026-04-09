<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Ministry;
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
        $query = Member::with('localSociety');

        if ($user->isSocietyAdmin()) {
            $query->where('local_society_id', $user->scope_id);
        }

        return Inertia::render('Members/Index', [
            'members' => $query->paginate(10),
            'canManage' => $user->isSocietyAdmin()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $user = $request->user();
        if (!$user->isSocietyAdmin()) {
            abort(403, 'Only Society Admins can add new members.');
        }

        // Fetch ministries strictly within this society 
        $ministries = Ministry::where('local_society_id', $user->scope_id)->get();

        return Inertia::render('Members/Form', [
            'ministries' => $ministries,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user->isSocietyAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:Active,Inactive',
            'ministry_ids' => 'array',
            'ministry_ids.*' => [
                'integer',
                Rule::exists('ministries', 'id')->where('local_society_id', $user->scope_id)
            ]
        ]);

        $member = Member::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'status' => $validated['status'],
            'local_society_id' => $user->scope_id,
        ]);

        if (!empty($validated['ministry_ids'])) {
            $member->ministries()->attach($validated['ministry_ids']);
        }

        return redirect()->route('members.index')->with('success', 'Member created and assigned successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Member $member)
    {
        $user = $request->user();
        if (!$user->isSocietyAdmin() || $member->local_society_id !== $user->scope_id) {
            abort(403);
        }

        $ministries = Ministry::where('local_society_id', $user->scope_id)->get();
        // Load existing ministry attachments
        $member->load('ministries');

        return Inertia::render('Members/Form', [
            'member' => $member,
            'ministries' => $ministries,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Member $member)
    {
        $user = $request->user();
        if (!$user->isSocietyAdmin() || $member->local_society_id !== $user->scope_id) {
            abort(403);
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'status' => 'required|in:Active,Inactive',
            'ministry_ids' => 'array',
            'ministry_ids.*' => [
                'integer',
                Rule::exists('ministries', 'id')->where('local_society_id', $user->scope_id)
            ]
        ]);

        $member->update([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'status' => $validated['status'],
        ]);

        if (isset($validated['ministry_ids'])) {
            $member->ministries()->sync($validated['ministry_ids']);
        }

        return redirect()->route('members.index')->with('success', 'Member updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Member $member)
    {
        $user = $request->user();
        if (!$user->isSocietyAdmin() || $member->local_society_id !== $user->scope_id) {
            abort(403);
        }

        $member->delete();
        return redirect()->route('members.index')->with('success', 'Member removed.');
    }
}
