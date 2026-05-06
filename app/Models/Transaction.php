<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Transaction Model
 * 
 * Represents a cash flow entry (inflow or outflow) for a local society.
 */
class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'category',
        'amount',
        'description',
        'transaction_date',
        'payment_method',
        'local_society_id',
        'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    public function localSociety()
    {
        return $this->belongsTo(LocalSociety::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
