<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * AnnualConference Model
 * 
 * The second level of the church hierarchy.
 * One conference has many districts.
 * One conference has many users (conference admins) via polymorphic scope.
 */
class AnnualConference extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'region', 'description', 'established_at',
        'latitude', 'longitude', 'location_name',
    ];

    protected $casts = [
        'established_at' => 'date',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    /** A conference has many districts under it */
    public function districts()
    {
        return $this->hasMany(District::class);
    }

    /** A conference has many local societies (through districts) */
    public function localSocieties()
    {
        return $this->hasManyThrough(LocalSociety::class, District::class);
    }

    /** A conference has many members (deep: through districts → societies) */
    public function members()
    {
        // We join through 3 levels: conference → districts → societies → members
        return Member::whereIn(
            'local_society_id',
            $this->localSocieties()->pluck('local_societies.id')
        );
    }

    /** Count all members across this conference (used on dashboards) */
    public function getMemberCountAttribute(): int
    {
        return $this->localSocieties()
            ->withCount('members')
            ->get()
            ->sum('members_count');
    }

    /** The administrator(s) assigned to this conference */
    public function admins()
    {
        return $this->morphMany(User::class, 'scope');
    }

    /** Events organized by this conference */
    public function events()
    {
        return $this->morphMany(Event::class, 'organizer');
    }
}

