<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/** Attendance - records which member attended which event */
class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';

    protected $fillable = ['event_id', 'member_id', 'recorded_at'];

    protected $casts = ['recorded_at' => 'datetime'];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }
}
