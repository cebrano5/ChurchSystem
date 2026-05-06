<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Donation Model
 * 
 * Represents a financial contribution made by a member.
 * Includes amount, type, date, and payment method.
 */
class Donation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'member_id', 'local_society_id', 'amount',
        'type', 'category', 'donation_date', 'payment_method', 'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'donation_date' => 'date',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function localSociety()
    {
        return $this->belongsTo(LocalSociety::class);
    }
}
