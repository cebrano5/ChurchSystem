<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\AnnualConference;
use App\Models\District;
use App\Models\LocalSociety;
use App\Models\Pastor;
use App\Models\Member;
use App\Models\Ministry;
use App\Models\Event;

class ArchiveController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $archives = [];

        // National Admins see everything
        if ($user->isNationalAdmin()) {
            $archives['users'] = User::onlyTrashed()->get();
            $archives['conferences'] = AnnualConference::onlyTrashed()->get();
        }

        // Conference Admins see their Districts, and Users within those Districts/Societies
        if ($user->isNationalAdmin() || $user->isConferenceAdmin()) {
            $districtsQuery = District::onlyTrashed();
            if ($user->isConferenceAdmin()) {
                $districtsQuery->where('annual_conference_id', $user->scope_id);
                
                $districtIds = District::where('annual_conference_id', $user->scope_id)->pluck('id');
                $societyIds = LocalSociety::whereIn('district_id', $districtIds)->pluck('id');
                
                $archives['users'] = User::onlyTrashed()->where(function($q) use ($districtIds, $societyIds) {
                    $q->where('scope_type', District::class)->whereIn('scope_id', $districtIds)
                      ->orWhere('scope_type', LocalSociety::class)->whereIn('scope_id', $societyIds);
                })->get();
            }
            $archives['districts'] = $districtsQuery->get();
        }

        // District Admins see their Societies, and Users within those Societies
        if ($user->isNationalAdmin() || $user->isConferenceAdmin() || $user->isDistrictAdmin()) {
            $societiesQuery = LocalSociety::onlyTrashed();
            if ($user->isConferenceAdmin()) {
                $districtIds = District::where('annual_conference_id', $user->scope_id)->pluck('id');
                $societiesQuery->whereIn('district_id', $districtIds);
            } elseif ($user->isDistrictAdmin()) {
                $societiesQuery->where('district_id', $user->scope_id);
                $societyIds = LocalSociety::where('district_id', $user->scope_id)->pluck('id');
                $archives['users'] = User::onlyTrashed()->where('scope_type', LocalSociety::class)->whereIn('scope_id', $societyIds)->get();
            }
            $archives['societies'] = $societiesQuery->get();
        }

        // All Admins (including Society Admins) see core entities within their accessible societies
        $accessibleSocietyIds = $user->getAccessibleSocietyIds();
        
        // Pastors use polymorphic scoping (scope_type and scope_id)
        $pastorsQuery = Pastor::onlyTrashed();
        if ($user->isNationalAdmin()) {
            // National admin sees all pastors
        } elseif ($user->isConferenceAdmin()) {
            $districtIds = District::where('annual_conference_id', $user->scope_id)->pluck('id');
            $pastorsQuery->where(function($q) use ($user, $districtIds, $accessibleSocietyIds) {
                $q->where('scope_type', AnnualConference::class)->where('scope_id', $user->scope_id)
                  ->orWhere('scope_type', District::class)->whereIn('scope_id', $districtIds)
                  ->orWhere('scope_type', LocalSociety::class)->whereIn('scope_id', $accessibleSocietyIds);
            });
        } elseif ($user->isDistrictAdmin()) {
            $pastorsQuery->where(function($q) use ($user, $accessibleSocietyIds) {
                $q->where('scope_type', District::class)->where('scope_id', $user->scope_id)
                  ->orWhere('scope_type', LocalSociety::class)->whereIn('scope_id', $accessibleSocietyIds);
            });
        } else {
            // Society Admin
            $pastorsQuery->where('scope_type', LocalSociety::class)->whereIn('scope_id', $accessibleSocietyIds);
        }
        $archives['pastors'] = $pastorsQuery->get();

        $archives['members'] = Member::onlyTrashed()->whereIn('local_society_id', $accessibleSocietyIds)->get();
        $archives['ministries'] = Ministry::onlyTrashed()->whereIn('local_society_id', $accessibleSocietyIds)->get();
        
        // Events use polymorphic scoping (organizer_type and organizer_id)
        $eventsQuery = Event::onlyTrashed();
        if ($user->isNationalAdmin()) {
            // National admin sees all events
        } elseif ($user->isConferenceAdmin()) {
            $districtIds = District::where('annual_conference_id', $user->scope_id)->pluck('id');
            $eventsQuery->where(function($q) use ($user, $districtIds, $accessibleSocietyIds) {
                $q->where('organizer_type', AnnualConference::class)->where('organizer_id', $user->scope_id)
                  ->orWhere('organizer_type', District::class)->whereIn('organizer_id', $districtIds)
                  ->orWhere('organizer_type', LocalSociety::class)->whereIn('organizer_id', $accessibleSocietyIds);
            });
        } elseif ($user->isDistrictAdmin()) {
            $eventsQuery->where(function($q) use ($user, $accessibleSocietyIds) {
                $q->where('organizer_type', District::class)->where('organizer_id', $user->scope_id)
                  ->orWhere('organizer_type', LocalSociety::class)->whereIn('organizer_id', $accessibleSocietyIds);
            });
        } else {
            // Society Admin
            $eventsQuery->where('organizer_type', LocalSociety::class)->whereIn('organizer_id', $accessibleSocietyIds);
        }
        $archives['events'] = $eventsQuery->get();

        return Inertia::render('Settings/Archive', [
            'archives' => $archives,
            'canManage' => true,
        ]);
    }

    public function restore(Request $request, $type, $id)
    {
        $modelMap = [
            'users' => User::class,
            'conferences' => AnnualConference::class,
            'districts' => District::class,
            'societies' => LocalSociety::class,
            'pastors' => Pastor::class,
            'members' => Member::class,
            'ministries' => Ministry::class,
            'events' => Event::class,
        ];

        if (!array_key_exists($type, $modelMap)) {
            abort(404);
        }

        $modelClass = $modelMap[$type];
        $record = $modelClass::onlyTrashed()->findOrFail($id);
        $record->restore();

        return back()->with('success', 'Record restored successfully.');
    }
}
