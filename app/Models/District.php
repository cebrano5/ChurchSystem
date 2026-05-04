<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * District Model
 * 
 * Third level of the hierarchy. Belongs to a conference, has many local societies.
 */
class District extends Model
{
    use HasFactory;

    protected $fillable = [
        'annual_conference_id',
        'name',
        'description',
        'latitude',
        'longitude',
        'location_name',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    /** District belongs to one conference */
    public function annualConference()
    {
        return $this->belongsTo(AnnualConference::class);
    }

    /** District has many local societies */
    public function localSocieties()
    {
        return $this->hasMany(LocalSociety::class);
    }

    /** All members in this district (through societies) */
    public function members()
    {
        return Member::whereIn(
            'local_society_id',
            $this->localSocieties()->pluck('id')
        );
    }

    /** The administrator(s) assigned to this district */
    public function admins()
    {
        return $this->morphMany(User::class, 'scope');
    }

    /** Events organized by this district */
    public function events()
    {
        return $this->morphMany(Event::class, 'organizer');
    }
}

