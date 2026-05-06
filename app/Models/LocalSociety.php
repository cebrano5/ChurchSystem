<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Trackable;

/**
 * LocalSociety Model
 * 
 * The base unit — an individual church congregation. Members, ministries,
 * events, and donations all ultimately belong to a local society.
 */
class LocalSociety extends Model
{
    use HasFactory, SoftDeletes, Trackable;

    protected $fillable = [
        'district_id', 'name', 'address',
        'contact_person', 'contact_phone', 'description',
        'latitude', 'longitude', 'location_name',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function members()
    {
        return $this->hasMany(Member::class);
    }

    public function ministries()
    {
        return $this->hasMany(Ministry::class);
    }

    /** Events organized by this local society */
    public function events()
    {
        return $this->morphMany(Event::class, 'organizer');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    /** The administrator(s) assigned to this local society */
    public function admins()
    {
        return $this->morphMany(User::class, 'scope');
    }

    /** The pastor(s) assigned to this local society */
    public function pastors()
    {
        return $this->morphMany(Pastor::class, 'scope');
    }

    /** Convenience: total donations for this society */
    public function getTotalDonationsAttribute(): float
    {
        return $this->donations()->selectRaw("SUM(CASE WHEN type = 'inflow' THEN amount ELSE -amount END) as net")->value('net') ?? 0;
    }
}
