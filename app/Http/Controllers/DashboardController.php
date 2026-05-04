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
            $upcomingEvents = Event::where('event_date', '>=', now())
                ->orderBy('event_date', 'asc')
                ->get()
                ->unique(function ($item) {
                    return $item->series_id ?? 'standalone_' . $item->id;
                })
                ->values()
                ->take(5);

            return Inertia::render('Dashboard/Index', [
                'stats' => [
                    'conferences' => AnnualConference::count(),
                    'districts'   => District::count(),
                    'societies'   => LocalSociety::count(),
                    'members'     => Member::count(),
                    'total_donations' => Donation::sum('amount'),
                ],
                'role' => 'national_admin',
                'upcomingEvents' => $upcomingEvents,
                'recentMembers' => Member::orderBy('created_at', 'desc')->take(5)->get(),
            ]);
        }

        // 2. Conference Admin Dashboard
        if ($user->isConferenceAdmin()) {
            $conference = $user->scope;
            $societyIds = LocalSociety::whereHas('district', function($q) use ($conference) {
                $q->where('annual_conference_id', $conference->id);
            })->pluck('id')->toArray();
            $districtIds = $conference->districts()->pluck('id')->toArray();

            $upcomingEvents = Event::where(function($q) use ($conference, $districtIds, $societyIds) {
                $q->where('organizer_type', AnnualConference::class)->where('organizer_id', $conference->id)
                  ->orWhere(function($sq) use ($districtIds) {
                      $sq->where('organizer_type', District::class)->whereIn('organizer_id', $districtIds);
                  })
                  ->orWhere(function($sq) use ($societyIds) {
                      $sq->where('organizer_type', LocalSociety::class)->whereIn('organizer_id', $societyIds);
                  });
            })
            ->where('event_date', '>=', now())
            ->orderBy('event_date', 'asc')
            ->get()
            ->unique(function ($item) {
                return $item->series_id ?? 'standalone_' . $item->id;
            })
            ->values()
            ->take(5);

            return Inertia::render('Dashboard/Index', [
                'stats' => [
                    'districts' => $conference->districts()->count(),
                    'societies' => $conference->localSocieties()->count(),
                    'members'   => $conference->members()->count(),
                    'donations' => Donation::whereIn('local_society_id', $societyIds)->sum('amount'),
                ],
                'role' => 'conference_admin',
                'scopeName' => $conference->name,
                'upcomingEvents' => $upcomingEvents,
                'recentMembers' => $conference->members()->orderBy('members.created_at', 'desc')->take(5)->get(),
            ]);
        }

        // 3. District Admin Dashboard
        if ($user->isDistrictAdmin()) {
            $district = $user->scope;
            $societyIds = $district->localSocieties()->pluck('id')->toArray();

            $upcomingEvents = Event::where(function($q) use ($district, $societyIds) {
                $q->where('organizer_type', District::class)->where('organizer_id', $district->id)
                  ->orWhere(function($sq) use ($societyIds) {
                      $sq->where('organizer_type', LocalSociety::class)->whereIn('organizer_id', $societyIds);
                  });
            })
            ->where('event_date', '>=', now())
            ->orderBy('event_date', 'asc')
            ->get()
            ->unique(function ($item) {
                return $item->series_id ?? 'standalone_' . $item->id;
            })
            ->values()
            ->take(5);

            return Inertia::render('Dashboard/Index', [
                'stats' => [
                    'societies' => $district->localSocieties()->count(),
                    'members'   => $district->members()->count(),
                    'donations' => Donation::whereIn('local_society_id', $societyIds)->sum('amount'),
                ],
                'role' => 'district_admin',
                'scopeName' => $district->name,
                'upcomingEvents' => $upcomingEvents,
                'recentMembers' => $district->members()->orderBy('members.created_at', 'desc')->take(5)->get(),
            ]);
        }

        // 4. Society Admin Dashboard
        if ($user->isSocietyAdmin()) {
            $society = $user->scope;
            $upcomingEvents = $society->events()
                ->where('event_date', '>=', now())
                ->orderBy('event_date', 'asc')
                ->get()
                ->unique(function ($item) {
                    return $item->series_id ?? 'standalone_' . $item->id;
                })
                ->values()
                ->take(5);

            return Inertia::render('Dashboard/Index', [
                'stats' => [
                    'members'       => $society->members()->count(),
                    'ministries'    => $society->ministries()->count(),
                    'upcomingEvents'=> $society->events()->where('event_date', '>=', today())->count(),
                    'donations'     => $society->donations()->sum('amount'),
                ],
                'role' => 'society_admin',
                'scopeName' => $society->name,
                'upcomingEventsList' => $upcomingEvents,
                'recentMembers' => $society->members()->orderBy('members.created_at', 'desc')->take(5)->get(),
            ]);
        }
    }
}
