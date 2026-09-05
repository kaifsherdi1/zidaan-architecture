<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enquiry extends Model
{
    protected $fillable = [
        'type', 'name', 'email', 'phone', 'subject', 'message', 'details',
        'property_id', 'status', 'assigned_to', 'internal_notes', 'source', 'ip_address',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
