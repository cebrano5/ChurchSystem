<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/** Event - a church activity organized by a local society */
class Event extends Model
{
    use HasFactory;

    protected $fillable = ['local_society_id', 'name', 'event_date', 'location', 'description'];

    protected $casts = ['event_date' => 'date'];

    public function localSociety()
    {
        return $this->belongsTo(LocalSociety::class);
    }

    /** Members who attended this event */
    public function members()
    {
        return $this->belongsToMany(Member::class, 'attendance')
                    ->withPivot('recorded_at')
                    ->withTimestamps();
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }

    /** Count how many attended this event */
    public function getAttendanceCountAttribute(): int
    {
        return $this->attendance()->count();
    }
}
