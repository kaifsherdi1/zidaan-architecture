<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agent extends Model
{
    use SoftDeletes, \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'user_id', 'bio', 'specializations', 'years_of_experience',
        'commission_rate', 'license_number', 'license_expiry',
        'facebook_url', 'twitter_url', 'linkedin_url', 'instagram_url',
        'properties_sold', 'properties_rented', 'total_sales_value',
        'average_rating', 'total_reviews', 'is_verified', 'is_available'
    ];

    protected $casts = [
        'specializations' => 'array',
        'years_of_experience' => 'integer',
        'commission_rate' => 'decimal:2',
        'license_expiry' => 'date',
        'properties_sold' => 'integer',
        'properties_rented' => 'integer',
        'total_sales_value' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'total_reviews' => 'integer',
        'is_verified' => 'boolean',
        'is_available' => 'boolean',
    ];

    /**
     * Get the user associated with this agent
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get properties assigned to this agent
     */
    public function properties()
    {
        return $this->hasMany(Property::class , 'agent_id', 'user_id');
    }

    /**
     * Get bookings assigned to this agent
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class , 'agent_id', 'user_id');
    }

    /**
     * Get transactions for this agent
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class , 'agent_id', 'user_id');
    }
}
