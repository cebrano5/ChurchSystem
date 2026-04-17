<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DonationController extends Controller
{
    /**
     * Display a listing of donations, scoped by the user's role and hierarchy level.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get the IDs of societies this user is allowed to see
        $societyIds = $user->getAccessibleSocietyIds();

        // Filter donations by these society IDs and load deep hierarchy (District, Conference)
        // so that higher tier admins can see exactly where the donation came from
        $donations = Donation::whereIn('local_society_id', $societyIds)
            ->with(['member', 'localSociety.district.annualConference'])
            ->orderBy('donation_date', 'desc')
            ->get();

        // Fetch local members if the user can manage donations (is Society Admin)
        $members = $user->isSocietyAdmin() 
            ? \App\Models\Member::where('local_society_id', $user->scope_id)->orderBy('first_name')->get() 
            : [];

        return Inertia::render('Donations/Index', [
            'donations' => $donations,
            // Only Society Admins are authorized to add donations
            'canManage' => $user->isSocietyAdmin(),
            'members' => $members,
        ]);
    }

    /**
     * Store a newly created donation.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Ensure ONLY Society Admins can add Donations
        abort_unless($user->isSocietyAdmin(), 403, 'Only Society Administrators can add donations.');

        // Validate incoming request parameters securely
        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'amount' => 'required|numeric|min:0.01',
            'donation_type' => 'required|string',
            'donation_date' => 'required|date',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        // Auto-assign the donation to the logged-in Society Admin's scope (Society ID)
        $validated['local_society_id'] = $user->scope_id;

        Donation::create($validated);

        return redirect()->back()->with('success', 'Donation added successfully.');
    }
}
