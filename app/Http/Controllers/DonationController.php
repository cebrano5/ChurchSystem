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

        // Filter donations by these society IDs and load member information
        $donations = Donation::whereIn('local_society_id', $societyIds)
            ->with(['member', 'localSociety'])
            ->orderBy('donation_date', 'desc')
            ->get();

        return Inertia::render('Donations/Index', [
            'donations' => $donations,
        ]);
    }

    /**
     * Store a newly created donation.
     * (Functionality can be expanded here as needed)
     */
    public function store(Request $request)
    {
        // ... store logic here if needed by the frontend
    }
}
