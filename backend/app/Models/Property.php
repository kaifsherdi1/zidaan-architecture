<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agent_id',
        'title',
        'slug',
        'description',
        'type',
        'category',
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
        'views_count',
    ];

    protected $casts = [
        'features' => 'array',
        'price' => 'decimal:2',
        'area' => 'decimal:2',
        'is_featured' => 'boolean',
    ];

    protected static function booted(): void
    {
        // Any change to a listing invalidates the cached public catalogue pages.
        $flush = fn () => static::flushCatalogueCache();
        static::saved($flush);
        static::deleted($flush);
        static::restored($flush);
    }

    /**
     * The public listing endpoint caches result pages under a version number;
     * bumping it makes every cached page stale at once. Call this after bulk
     * query-builder writes, which don't fire model events.
     */
    public static function flushCatalogueCache(): void
    {
        Cache::forever('properties_cache_version', (int) Cache::get('properties_cache_version', 0) + 1);
    }

    public static function catalogueCacheVersion(): int
    {
        return (int) Cache::get('properties_cache_version', 0);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id')->withTrashed();
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
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
