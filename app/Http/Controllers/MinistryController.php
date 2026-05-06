<?php

namespace App\Http\Controllers;

use App\Models\Ministry;
use App\Models\LocalSociety;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Barryvdh\DomPDF\Facade\Pdf;

class MinistryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $ministries = Ministry::withCount('members')->orderBy('name')->get();

        return Inertia::render('Ministries/Index', [
            'ministries' => $ministries,
            'canManage'  => $user->isNationalAdmin(),
        ]);
    }

    public function show(Ministry $ministry)
    {
        $user = auth()->user();
        $societyIds = $user->getAccessibleSocietyIds();
        
        $ministry->load(['leader']);
        
        $scopedMembers = $ministry->members()
            ->whereIn('members.local_society_id', $societyIds)
            ->with(['localSociety.district.annualConference'])
            ->get()
            ->map(function($member) {
                return [
                    'id'         => $member->id,
                    'first_name' => $member->first_name,
                    'last_name'  => $member->last_name,
                    'email'      => $member->email,
                    'phone'      => $member->phone,
                    'status'     => $member->status,
                    'joined_at'  => $member->pivot->created_at,
                    'location'   => [
                        'society'    => $member->localSociety->name,
                        'district'   => $member->localSociety->district->name,
                        'conference' => $member->localSociety->district->annualConference->name,
                    ],
                ];
            });

        $availableMembers = Member::whereIn('local_society_id', $societyIds)
            ->whereDoesntHave('ministries')
            ->orderBy('last_name')
            ->get();

        return Inertia::render('Ministries/Show', [
            'ministry'         => $ministry,
            'scopedMembers'    => $scopedMembers,
            'availableMembers' => $availableMembers,
            'canManage'        => $user->isNationalAdmin(),
        ]);
    }

    public function addMember(Request $request, Ministry $ministry)
    {
        $user = auth()->user();
        $societyIds = $user->getAccessibleSocietyIds();

        $validated = $request->validate([
            'member_id' => [
                'required',
                Rule::exists('members', 'id')->whereIn('local_society_id', $societyIds),
            ],
        ]);

        $ministry->members()->syncWithoutDetaching([$validated['member_id']]);
        return redirect()->back()->with('success', 'Member added to ministry.');
    }

    public function removeMember(Request $request, Ministry $ministry, Member $member)
    {
        $user = auth()->user();
        if (!in_array($member->local_society_id, $user->getAccessibleSocietyIds())) {
            abort(403);
        }

        $ministry->members()->detach($member->id);
        return redirect()->back()->with('success', 'Member removed from ministry.');
    }

    public function create(Request $request)
    {
        if (!auth()->user()->isNationalAdmin()) abort(403);
        return Inertia::render('Ministries/Form');
    }

    public function store(Request $request)
    {
        if (!auth()->user()->isNationalAdmin()) abort(403);

        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:ministries,name',
            'description' => 'nullable|string',
            'leader_name' => 'nullable|string|max:255',
        ]);

        Ministry::create($validated);
        return redirect()->route('ministries.index')->with('success', 'Global ministry created.');
    }

    public function edit(Ministry $ministry)
    {
        if (!auth()->user()->isNationalAdmin()) abort(403);
        return Inertia::render('Ministries/Form', ['ministry' => $ministry]);
    }

    public function update(Request $request, Ministry $ministry)
    {
        if (!auth()->user()->isNationalAdmin()) abort(403);

        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:ministries,name,' . $ministry->id,
            'description' => 'nullable|string',
            'leader_name' => 'nullable|string|max:255',
        ]);

        $ministry->update($validated);
        return redirect()->route('ministries.index')->with('success', 'Ministry updated.');
    }

    /**
     * Archive (soft delete) the ministry.
     */
    public function destroy(Ministry $ministry)
    {
        if (!auth()->user()->isNationalAdmin()) abort(403);

        $ministry->delete(); // SoftDeletes sets deleted_at
        return redirect()->route('ministries.index')->with('success', 'Ministry archived successfully.');
    }

    /**
     * Export ministries as PDF.
     */
    public function pdf(Request $request)
    {
        $user = $request->user();
        $societyIds = $user->getAccessibleSocietyIds();

        $ministries = Ministry::withCount(['members' => function ($q) use ($societyIds) {
            $q->whereIn('local_society_id', $societyIds);
        }])->orderBy('name')->get();

        $pdf = Pdf::loadView('pdf.ministries', [
            'ministries' => $ministries,
            'user'       => $user,
            'date'       => now()->format('F d, Y'),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('ministries-' . now()->format('Ymd') . '.pdf');
    }
    /**
     * Export ministry member roster as PDF.
     */
    public function showPdf(Request $request, Ministry $ministry)
    {
        $user = $request->user();
        $societyIds = $user->getAccessibleSocietyIds();
        
        $members = $ministry->members()
            ->whereIn('members.local_society_id', $societyIds)
            ->with(['localSociety.district.annualConference'])
            ->orderBy('last_name')
            ->get();

        $pdf = Pdf::loadView('pdf.ministry_members', [
            'ministry' => $ministry,
            'members'  => $members,
            'user'     => $user,
            'date'     => now()->format('F d, Y'),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('ministry-' . $ministry->id . '-members.pdf');
    }
}
