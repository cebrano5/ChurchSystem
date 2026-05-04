<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\LocalSociety;
use App\Models\District;


/**
 * User Model
 * 
 * Represents a system administrator at any level of the church hierarchy.
 * 
 * Key design decisions:
 * - 'username' is used for login instead of 'email' (custom auth)
 * - 'role' determines what the user can see and do in the system
 * - 'scope_id' + 'scope_type' link the user to their organizational unit
 *   (polymorphic, so it can point to any model: AnnualConference, District, LocalSociety)
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     * We specify exactly what can be bulk-assigned for security.
     */
    protected $fillable = [
        'name',
        'username',
        'password',
        'role',
        'scope_type',
        'scope_id',
        'latitude', 
        'longitude',
        'location_name',
    ];

    /**
     * Hidden from JSON serialization (API responses, etc.)
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Cast 'password' to hashed automatically when set.
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // ─── Role Helper Methods ────────────────────────────────────────────────

    /** Check if the user is the top-level national administrator */
    public function isNationalAdmin(): bool
    {
        return $this->role === 'national_admin';
    }

    /** Check if user is a conference-level administrator */
    public function isConferenceAdmin(): bool
    {
        return $this->role === 'conference_admin';
    }

    /** Check if user is a district-level administrator */
    public function isDistrictAdmin(): bool
    {
        return $this->role === 'district_admin';
    }

    /** Check if user is a local society administrator */
    public function isSocietyAdmin(): bool
    {
        return $this->role === 'society_admin';
    }

    /**
     * Get a human-readable label for the user's role.
     * Used in UI badges and headers.
     */
    public function getRoleLabelAttribute(): string
    {
        return match($this->role) {
            'national_admin'   => 'National Administrator',
            'conference_admin' => 'Conference Administrator',
            'district_admin'   => 'District Administrator',
            'society_admin'    => 'Society Administrator',
            default            => 'Unknown Role',
        };
    }

    // ─── Scoping Helpers ─────────────────────────────────────────────────────

    /**
     * Get an array of LocalSociety IDs that this user is authorized to view/manage.
     * This centralizes the hierarchy logic for reporting and filtering.
     */
    public function getAccessibleSocietyIds(): array
    {
        if ($this->isNationalAdmin()) {
            return LocalSociety::pluck('id')->toArray();
        }

        if ($this->isConferenceAdmin()) {
            // All societies within districts belonging to this conference
            return LocalSociety::whereHas('district', function ($q) {
                $q->where('annual_conference_id', $this->scope_id);
            })->pluck('id')->toArray();
        }

        if ($this->isDistrictAdmin()) {
            // All societies within this district
            return LocalSociety::where('district_id', $this->scope_id)->pluck('id')->toArray();
        }

        if ($this->isSocietyAdmin()) {
            // Just this specific society
            return [$this->scope_id];
        }

        return [];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    /**
     * Polymorphic scope relationship.
     * Returns the organizational unit this user manages.
     * For national_admin, this will be null.
     */
    public function scope()
    {
        return $this->morphTo('scope');
    }
}
