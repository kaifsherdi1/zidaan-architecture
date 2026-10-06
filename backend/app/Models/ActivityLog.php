<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

/**
 * Append-only audit trail of staff actions (role changes, deletions, booking
 * decisions, money). Read by admins at GET /api/admin/activity.
 */
class ActivityLog extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'user_id', 'action', 'subject_type', 'subject_id', 'description', 'properties', 'ip_address',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    public static function record(string $action, ?Model $subject, string $description, array $properties = []): void
    {
        try {
            static::create([
                'user_id' => auth()->id(),
                'action' => $action,
                'subject_type' => $subject ? class_basename($subject) : null,
                'subject_id' => $subject?->getKey(),
                'description' => mb_substr($description, 0, 500),
                'properties' => $properties ?: null,
                'ip_address' => request()?->ip(),
            ]);
        } catch (\Throwable $e) {
            // Auditing must never break the action being audited.
            Log::warning('Activity log write failed', ['action' => $action, 'error' => $e->getMessage()]);
        }
    }
}
