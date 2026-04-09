<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\AnnualConference;
use App\Models\District;
use App\Models\LocalSociety;
use App\Models\Member;
use App\Models\Event;
use App\Models\Donation;

class DashboardController extends Controller
{
    /**
     * Display the role-based dashboard.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. National Admin Dashboard
        if ($user->isNationalAdmin()) {
            return Inertia::render('Dashboard/Index', [
                'stats' => [
                    'conferences' => AnnualConference::count(),
                    'districts'   => District::count(),
                    'societies'   => LocalSociety::count(),
                    'members'     => Member::count(),
                    'total_donations' => Donation::sum('amount'),
                ],
                'role' => 'national_admin',
            ]);
        }

        // 2. Conference Admin Dashboard
        if ($user->isConferenceAdmin()) {
            $conference = $user->scope;
            return Inertia::render('Dashboard/Index', [
                'stats' => [
                    'districts' => $conference->districts()->count(),
                    'societies' => $conference->localSocieties()->count(),
                    'members'   => $conference->members()->count(),
                ],
                'role' => 'conference_admin',
                'scopeName' => $conference->name,
            ]);
        }

        // 3. District Admin Dashboard
        if ($user->isDistrictAdmin()) {
            $district = $user->scope;
            return Inertia::render('Dashboard/Index', [
                'stats' => [
                    'societies' => $district->localSocieties()->count(),
                    'members'   => $district->members()->count(),
                ],
                'role' => 'district_admin',
                'scopeName' => $district->name,
            ]);
        }

        // 4. Society Admin Dashboard
        if ($user->isSocietyAdmin()) {
            $society = $user->scope;
            return Inertia::render('Dashboard/Index', [
                'stats' => [
                    'members'       => $society->members()->count(),
                    'ministries'    => $society->ministries()->count(),
                    'upcomingEvents'=> $society->events()->where('event_date', '>=', today())->count(),
                    'donations'     => $society->donations()->sum('amount'),
                ],
                'role' => 'society_admin',
                'scopeName' => $society->name,
            ]);
        }
    }
}
