<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agent_id',
        'title',
        'slug',
        'description',
        'type',
        'status',
        'price',
        'bedrooms',
        'bathrooms',
        'garages',
        'area',
        'address',
        'city',
        'state',
        'country',
        'zip_code',
        'latitude',
        'longitude',
        'features',
        'is_featured',
        'views_count'
    ];

    protected $casts = [
        'features' => 'array',
        'price' => 'decimal:2',
        'area' => 'decimal:2',
        'is_featured' => 'boolean',
    ];

    public function agent()
    {
        return $this->belongsTo(User::class , 'agent_id');
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class)->orderBy('order');
    }

    public function mainImage()
    {
        return $this->hasOne(PropertyImage::class)->where('is_main', true);
    }
}
