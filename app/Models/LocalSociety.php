<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * LocalSociety Model
 * 
 * The base unit — an individual church congregation. Members, ministries,
 * events, and donations all ultimately belong to a local society.
 */
class LocalSociety extends Model
{
    use HasFactory;

    protected $fillable = [
        'district_id', 'name', 'address',
        'contact_person', 'contact_phone', 'description',
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

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    /** Convenience: total donations for this society */
    public function getTotalDonationsAttribute(): float
    {
        return $this->donations()->sum('amount');
    }
}
