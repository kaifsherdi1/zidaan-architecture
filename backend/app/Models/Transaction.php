<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'agent_id',
        'user_id',
        'client_name',
        'transaction_date',
        'amount',
        'status',
        'notes'
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function property()
    {
        // Financial history must keep resolving after a listing or person is trashed.
        return $this->belongsTo(Property::class)->withTrashed();
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id')->withTrashed();
    }

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }
}
