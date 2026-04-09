<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    /**
     * Display a listing of events, scoped by hierarchy.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $societyIds = $user->getAccessibleSocietyIds();

        $events = Event::whereIn('local_society_id', $societyIds)
            ->with('localSociety.district.annualConference')
            ->withCount('attendance')
            ->orderBy('event_date', 'desc')
            ->paginate(10);


        return Inertia::render('Events/Index', [
            'events' => $events,
            'canManage' => $user->isSocietyAdmin(),
        ]);
    }
}
