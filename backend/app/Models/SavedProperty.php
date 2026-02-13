<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedProperty extends Model
{
    protected $fillable = [
        'user_id', 'property_id', 'notes'
    ];

    /**
     * Get the user who saved the property
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the saved property
     */
    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
