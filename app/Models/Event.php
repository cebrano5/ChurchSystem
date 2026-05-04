<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Event - a church activity organized by any tier (Society, District, Conference, National)
 */
class Event extends Model
{
    use HasFactory;

    // Fillable fields now include organizer (polymorphic relationship fields)
    protected $fillable = [
        'organizer_id', 'organizer_type', 'series_id', 'name', 'event_date', 'end_date', 'location', 'description',
        'is_recurring', 'recurrence_frequency', 'recurrence_end_date'
    ];
 
    protected $casts = [
        'event_date' => 'datetime',
        'end_date' => 'datetime',
        'recurrence_end_date' => 'date',
        'is_recurring' => 'boolean'
    ];

    protected $appends = ['attendance_count'];

    /**
     * Get the organizer of the event.
     * This represents the level of hierarchy that created the event.
     */
    public function organizer()
    {
        return $this->morphTo();
    }

    /** 
     * Members who attended this event 
     * Handles retrieving attendance records for deep querying
     */
    public function members()
    {
        return $this->belongsToMany(Member::class, 'attendance')
                    ->withPivot('recorded_at')
                    ->withTimestamps();
    }

    /**
     * Relationships with attendance exactly
     */
    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }

    /** 
     * Count how many attended this event 
     * A helper to easily fetch attendance size for lists
     */
    public function getAttendanceCountAttribute(): int
    {
        return $this->attendance()->count();
    }
}
