<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Ministry;
use App\Models\LocalSociety;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Barryvdh\DomPDF\Facade\Pdf;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $societyIds = $user->getAccessibleSocietyIds();
        
        $query = Member::whereIn('local_society_id', $societyIds)
            ->with('localSociety.district.annualConference')
            ->orderBy('last_name')
            ->orderBy('first_name');

        return Inertia::render('Members/Index', [
            'members'   => $query->paginate(10),
            'canManage' => $user->isSocietyAdmin(),
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        $societyIds = $user->getAccessibleSocietyIds();
        $societies = LocalSociety::whereIn('id', $societyIds)->get();
        $ministries = Ministry::orderBy('name')->get();

        return Inertia::render('Members/Form', [
            'ministries' => $ministries,
            'societies'  => $societies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'local_society_id' => 'required|exists:local_societies,id',
            'first_name'       => 'required|string|max:255',
            'last_name'        => 'required|string|max:255',
            'email'            => 'nullable|email|max:255',
            'phone'            => 'nullable|string|max:20',
            'status'           => 'required|in:Active,Inactive',
            'ministry_id'      => 'nullable|integer|exists:ministries,id',
        ]);

        $member = Member::create($validated);

        if (!empty($validated['ministry_id'])) {
            $member->ministries()->sync([$validated['ministry_id']]);
        }

        return redirect()->route('members.index')->with('success', 'Member created successfully.');
    }

    public function edit(Request $request, Member $member)
    {
        $user = $request->user();
        $societyIds = $user->getAccessibleSocietyIds();

        if (!in_array($member->local_society_id, $societyIds)) {
            abort(403);
        }

        $ministries = Ministry::orderBy('name')->get();
        $societies  = LocalSociety::whereIn('id', $societyIds)->get();
        $member->load('ministries');

        return Inertia::render('Members/Form', [
            'member'     => $member,
            'ministries' => $ministries,
            'societies'  => $societies,
        ]);
    }

    public function update(Request $request, Member $member)
    {
        $user = $request->user();
        if (!in_array($member->local_society_id, $user->getAccessibleSocietyIds())) {
            abort(403);
        }

        $validated = $request->validate([
            'local_society_id' => 'required|exists:local_societies,id',
            'first_name'       => 'required|string|max:255',
            'last_name'        => 'required|string|max:255',
            'email'            => 'nullable|email|max:255',
            'phone'            => 'nullable|string|max:20',
            'status'           => 'required|in:Active,Inactive',
            'ministry_id'      => 'nullable|integer|exists:ministries,id',
        ]);

        $member->update($validated);

        if (array_key_exists('ministry_id', $validated)) {
            $member->ministries()->sync($validated['ministry_id'] ? [$validated['ministry_id']] : []);
        }

        return redirect()->route('members.index')->with('success', 'Member updated successfully.');
    }

    /**
     * Archive (soft delete) the member.
     */
    public function destroy(Request $request, Member $member)
    {
        $user = $request->user();
        if (!in_array($member->local_society_id, $user->getAccessibleSocietyIds())) {
            abort(403);
        }

        $member->delete(); // SoftDeletes sets deleted_at
        return redirect()->route('members.index')->with('success', 'Member archived successfully.');
    }

    /**
     * Export members as PDF, scoped to the user's hierarchy.
     */
    public function pdf(Request $request)
    {
        $user = $request->user();
        $societyIds = $user->getAccessibleSocietyIds();

        $members = Member::whereIn('local_society_id', $societyIds)
            ->with('localSociety.district.annualConference')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $pdf = Pdf::loadView('pdf.members', [
            'members' => $members,
            'user'    => $user,
            'date'    => now()->format('F d, Y'),
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('members-' . now()->format('Ymd') . '.pdf');
    }
}
