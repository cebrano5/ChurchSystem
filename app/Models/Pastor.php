<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pastor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'scope_type',
        'scope_id',
        'full_name',
        'email',
        'phone',
        'role_or_position',
        'status',
        'assigned_at',
        'notes',
    ];

    protected $casts = [
        'assigned_at' => 'date',
    ];

    /**
     * Relationship: Pastor belongs to an organizational scope (Conference, District, or Society)
     */
    public function scope()
    {
        return $this->morphTo();
    }
}
