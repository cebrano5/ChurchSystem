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
        
        // Start querying Events, loading the polymorphic organizer and counting attendance
        $query = Event::with('organizer')->withCount('attendance')->orderBy('event_date', 'desc');

        // Apply visibility rules if not National Admin (who sees everything)
        if (!$user->isNationalAdmin()) {
            $query->where(function ($q) use ($user) {
                // 1. See own events
                $q->where(function ($sq) use ($user) {
                    $sq->where('organizer_type', $user->scope_type)
                       ->where('organizer_id', $user->scope_id);
                });
                
                // 2. See child events based on role
                if ($user->isConferenceAdmin()) {
                    // Fetch all districts inside this conference
                    $districtIds = \App\Models\District::where('annual_conference_id', $user->scope_id)->pluck('id')->toArray();
                    // Fetch all societies inside those districts
                    $societyIds = \App\Models\LocalSociety::whereIn('district_id', $districtIds)->pluck('id')->toArray();
                    
                    // Include any event organized by these districts or societies
                    $q->orWhere(function ($sq) use ($districtIds) {
                        $sq->where('organizer_type', \App\Models\District::class)
                           ->whereIn('organizer_id', $districtIds);
                    });
                    $q->orWhere(function ($sq) use ($societyIds) {
                        $sq->where('organizer_type', \App\Models\LocalSociety::class)
                           ->whereIn('organizer_id', $societyIds);
                    });
                }

                if ($user->isDistrictAdmin()) {
                    // Fetch all societies inside this district
                    $societyIds = \App\Models\LocalSociety::where('district_id', $user->scope_id)->pluck('id')->toArray();
                    // Include any event organized by these societies
                    $q->orWhere(function ($sq) use ($societyIds) {
                        $sq->where('organizer_type', \App\Models\LocalSociety::class)
                           ->whereIn('organizer_id', $societyIds);
                    });
                }
            });
        }

        $events = $query->paginate(10);

        return Inertia::render('Events/Index', [
            'events' => $events,
            // Everyone can manage (create) events for their own level
            'canManage' => true, 
        ]);
    }

    /**
     * Display the specified event.
     * Including exact attendance and members details.
     */
    public function show(Event $event)
    {
        // Load the organizer and the list of members who attended securely
        $event->load(['organizer', 'members']);

        return Inertia::render('Events/Show', [
            'event' => $event,
        ]);
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request)
    {
        // Validate input data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'event_date' => 'required|date',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $user = $request->user();

        // Assign the event directly to the user's scope (Level)
        // Note: National admin has no scope_type/id, they get nulls creating a distinct 'National' event
        $validated['organizer_type'] = $user->scope_type;
        $validated['organizer_id'] = $user->scope_id;

        // Create the event
        Event::create($validated);

        return redirect()->back()->with('success', 'Event created successfully.');
    }
}
