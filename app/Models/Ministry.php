<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/** Ministry - a service group within a local society */
class Ministry extends Model
{
    use HasFactory;

    protected $fillable = ['local_society_id', 'name', 'description', 'leader_id'];

    public function localSociety()
    {
        return $this->belongsTo(LocalSociety::class);
    }

    /** The member who leads this ministry */
    public function leader()
    {
        return $this->belongsTo(Member::class, 'leader_id');
    }
}
