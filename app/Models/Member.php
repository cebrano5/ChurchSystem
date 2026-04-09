<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Member Model
 * 
 * Represents a church member belonging to a local society.
 * Members can attend events and make donations.
 */
class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'local_society_id', 'first_name', 'last_name', 'gender',
        'date_of_birth', 'phone', 'email', 'address',
        'membership_date', 'status',
    ];

    protected $casts = [
        'date_of_birth'   => 'date',
        'membership_date' => 'date',
    ];

    // ─── Accessors ────────────────────────────────────────────────────────────

    /** Full name accessor: "John Doe" */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function localSociety()
    {
        return $this->belongsTo(LocalSociety::class);
    }

    /** Events this member has attended */
    public function events()
    {
        return $this->belongsToMany(Event::class, 'attendance')
                    ->withPivot('recorded_at')
                    ->withTimestamps();
    }

    /** Attendance records for this member */
    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }

    /** Donations made by this member */
    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    /** Ministries this member serves in */
    public function ministries()
    {
        return $this->belongsToMany(Ministry::class)->withTimestamps();
    }

    /** Ministry this member leads (if any) */
    public function leadingMinistries()
    {
        return $this->hasMany(Ministry::class, 'leader_id');
    }
}
