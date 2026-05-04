<?php

namespace App\Http\Controllers;
 
use App\Models\Attendance;
use Illuminate\Http\Request;
 
class AttendanceController extends Controller
{
    /**
     * Record attendance for a member at an event.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id'  => 'required|exists:events,id',
            'member_id' => 'required|exists:members,id',
        ]);
 
        Attendance::updateOrCreate(
            ['event_id' => $validated['event_id'], 'member_id' => $validated['member_id']],
            ['recorded_at' => now()]
        );
 
        return redirect()->back()->with('success', 'Attendance recorded successfully.');
    }
 
    /**
     * Remove attendance record by event and member.
     */
    public function remove(Request $request)
    {
        $validated = $request->validate([
            'event_id'  => 'required|exists:events,id',
            'member_id' => 'required|exists:members,id',
        ]);
 
        Attendance::where('event_id', $validated['event_id'])
                  ->where('member_id', $validated['member_id'])
                  ->delete();
 
        return redirect()->back()->with('success', 'Attendance record removed.');
    }
}
