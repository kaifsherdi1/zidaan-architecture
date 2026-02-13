<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use SoftDeletes, \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'property_id', 'user_id', 'agent_id', 'visit_date', 'visit_time',
        'status', 'user_message', 'agent_notes', 'rejection_reason',
        'approved_at', 'approved_by', 'original_visit_date', 'reschedule_count'
    ];

    protected $casts = [
        'visit_date' => 'datetime',
        'visit_time' => 'datetime',
        'approved_at' => 'datetime',
        'original_visit_date' => 'datetime',
        'reschedule_count' => 'integer',
    ];

    /**
     * Get the property for this booking
     */
    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * Get the user who made this booking
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the agent assigned to this booking
     */
    public function agent()
    {
        return $this->belongsTo(User::class , 'agent_id');
    }

    /**
     * Get the user who approved this booking
     */
    public function approver()
    {
        return $this->belongsTo(User::class , 'approved_by');
    }
}
