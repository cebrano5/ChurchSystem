<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    /**
     * Display a listing of events, scoped by hierarchy.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Start querying Events, loading the polymorphic organizer and counting attendance
        // We group by series_id (or id if not recurring) to avoid cluttering the list
        $query = Event::with('organizer')
            ->withCount('attendance')
            ->leftJoin(DB::raw('(SELECT series_id as s_id, COUNT(*) as series_instances FROM events WHERE series_id IS NOT NULL GROUP BY series_id) as series_stats'), 'events.series_id', '=', 'series_stats.s_id')
            ->whereIn('events.id', function($sub) {
                $sub->select(DB::raw('MIN(id)'))
                    ->from('events')
                    ->groupBy(DB::raw('COALESCE(series_id, id)'));
            })
            ->select('events.*', 'series_stats.series_instances')
            ->orderBy('event_date', 'desc');

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

        // Add per-event permission flag
        $events->getCollection()->transform(function ($event) use ($user) {
            $event->can_manage = $user->isNationalAdmin() || ($event->organizer_type === $user->scope_type && $event->organizer_id == $user->scope_id);
            return $event;
        });

        return Inertia::render('Events/Index', [
            'events' => $events,
            'canManage' => true, 
        ]);
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'event_date'          => 'required|date',
            'end_date'            => 'nullable|date|after:event_date',
            'location'            => 'nullable|string|max:255',
            'description'         => 'nullable|string',
            'is_recurring'        => 'boolean',
            'recurrence_frequency'=> 'nullable|required_if:is_recurring,true|in:daily,weekly,monthly',
            'recurrence_end_date' => 'nullable|required_if:is_recurring,true|date|after:event_date',
        ]);

        $user = $request->user();
        $validated['organizer_type'] = $user->scope_type;
        $validated['organizer_id']   = $user->scope_id;

        if ($request->boolean('is_recurring')) {
            $startDate = \Carbon\Carbon::parse($validated['event_date']);
            $endDate = \Carbon\Carbon::parse($validated['recurrence_end_date']);
            $frequency = $validated['recurrence_frequency'];
            $seriesId = \Illuminate\Support\Str::uuid();

            // Calculate duration if end_date is provided
            $durationMinutes = null;
            if ($validated['end_date']) {
                $durationMinutes = $startDate->diffInMinutes(\Carbon\Carbon::parse($validated['end_date']));
            }

            // Cap at 52 occurrences to prevent accidental infinite loops or excessive records
            $count = 0;
            $currentDate = $startDate->copy();

            while ($currentDate->lte($endDate) && $count < 52) {
                $instance = $validated;
                $instance['event_date'] = $currentDate->toDateTimeString();
                $instance['series_id'] = $seriesId;
                
                if ($durationMinutes !== null) {
                    $instance['end_date'] = $currentDate->copy()->addMinutes($durationMinutes)->toDateTimeString();
                }
                
                $instance['is_recurring'] = false; // Mark individual instances as non-recurring to avoid confusion
                
                Event::create($instance);

                if ($frequency === 'daily') $currentDate->addDay();
                elseif ($frequency === 'weekly') $currentDate->addWeek();
                elseif ($frequency === 'monthly') $currentDate->addMonth();
                
                $count++;
            }

            return redirect()->back()->with('success', "Recurring event series ($count instances) created successfully.");
        }

        Event::create($validated);

        return redirect()->back()->with('success', 'Event created successfully.');
    }

    /**
     * Display the specified event.
     */
    public function show(Event $event)
    {
        $user = auth()->user();
        $event->load(['organizer', 'members']);

        // Rules: organized by self or is National Admin
        $canManage = $user->isNationalAdmin() || ($event->organizer_type === $user->scope_type && $event->organizer_id == $user->scope_id);

        // Fetch members that could potentially attend this event
        $eligibleMembersQuery = \App\Models\Member::query();

        if ($event->organizer_type === \App\Models\LocalSociety::class) {
            $eligibleMembersQuery->where('local_society_id', $event->organizer_id);
        } elseif ($event->organizer_type === \App\Models\District::class) {
            $societyIds = \App\Models\LocalSociety::where('district_id', $event->organizer_id)->pluck('id')->toArray();
            $eligibleMembersQuery->whereIn('local_society_id', $societyIds);
        } elseif ($event->organizer_type === \App\Models\AnnualConference::class) {
            $districtIds = \App\Models\District::where('annual_conference_id', $event->organizer_id)->pluck('id')->toArray();
            $societyIds = \App\Models\LocalSociety::whereIn('district_id', $districtIds)->pluck('id')->toArray();
            $eligibleMembersQuery->whereIn('local_society_id', $societyIds);
        }

        $eligibleMembers = $eligibleMembersQuery->orderBy('first_name')->get();

        // If it's part of a series, fetch the other occurrences for the timeline
        $seriesEvents = null;
        if ($event->series_id) {
            $seriesEvents = Event::where('series_id', $event->series_id)
                ->orderBy('event_date', 'asc')
                ->get();
        }

        return Inertia::render('Events/Show', [
            'event' => $event,
            'canManage' => $canManage,
            'eligibleMembers' => $eligibleMembers,
            'seriesEvents' => $seriesEvents,
        ]);
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, Event $event)
    {
        $user = $request->user();

        // Security check: Only the organizing level (or National Admin) can update
        if (!$user->isNationalAdmin() && ($event->organizer_type !== $user->scope_type || $event->organizer_id != $user->scope_id)) {
            abort(403);
        }

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'event_date'  => 'required|date',
            'location'    => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $event->update($validated);

        return redirect()->back()->with('success', 'Event updated successfully.');
    }

    /**
     * Remove the specified event.
     */
    public function destroy(Event $event)
    {
        $user = auth()->user();

        if (!$user->isNationalAdmin() && ($event->organizer_type !== $user->scope_type || $event->organizer_id != $user->scope_id)) {
            abort(403);
        }

        if ($event->series_id) {
            Event::where('series_id', $event->series_id)->delete();
            return redirect()->route('events.index')->with('success', 'Entire event series deleted successfully.');
        }

        $event->delete();

        return redirect()->route('events.index')->with('success', 'Event deleted.');
    }

    /**
     * Display all occurrences of a recurring event series.
     */
    public function series($series_id)
    {
        $user = auth()->user();
        
        $events = Event::with('organizer')
            ->withCount('attendance')
            ->where('series_id', $series_id)
            ->orderBy('event_date', 'asc')
            ->get();

        if ($events->isEmpty()) {
            abort(404);
        }

        $firstEvent = $events->first();

        // Security check: Only the organizing level (or National Admin) can manage
        $canManage = $user->isNationalAdmin() || ($firstEvent->organizer_type === $user->scope_type && $firstEvent->organizer_id == $user->scope_id);

        return Inertia::render('Events/Series', [
            'series_id' => $series_id,
            'events'    => $events,
            'canManage' => $canManage,
            'seriesName'=> $firstEvent->name,
            'organizer' => $firstEvent->organizer?->name ?? 'National Admin',
        ]);
    }
}
