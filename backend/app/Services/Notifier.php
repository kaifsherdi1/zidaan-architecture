<?php

namespace App\Services;

use App\Mail\StudioNotice;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Sends a notice to a user: always an in-app notification (the bell in both
 * apps), plus a queued email when the user has an address. Failures are logged
 * and swallowed — a notification problem must never roll back the business
 * action that triggered it.
 */
class Notifier
{
    public function send(
        User|int|null $user,
        string $type,
        string $title,
        string $message,
        array $data = [],
        bool $email = true,
        ?string $actionUrl = null,
    ): void {
        $user = $user instanceof User ? $user : ($user ? User::find($user) : null);
        if (! $user) {
            return;
        }

        try {
            Notification::create([
                'user_id' => $user->id,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data,
                'is_read' => false,
            ]);
        } catch (\Throwable $e) {
            Log::warning('In-app notification failed', ['type' => $type, 'user_id' => $user->id, 'error' => $e->getMessage()]);
        }

        if ($email && $user->email && $user->is_active) {
            try {
                Mail::to($user->email)->queue(new StudioNotice($title, [$message], $actionUrl, $actionUrl ? 'Open' : null));
            } catch (\Throwable $e) {
                Log::warning('Notification email failed to queue', ['type' => $type, 'user_id' => $user->id, 'error' => $e->getMessage()]);
            }
        }
    }

    /** Notify every active admin and manager (new enquiries, etc.). */
    public function staff(string $type, string $title, string $message, array $data = [], bool $email = true): void
    {
        User::query()
            ->where('is_active', true)
            ->whereHas('role', fn ($q) => $q->whereIn('slug', ['admin', 'manager']))
            ->get()
            ->each(fn (User $u) => $this->send($u, $type, $title, $message, $data, $email));
    }

    /** Link into the public site, when its URL is configured. */
    public static function siteUrl(string $path = ''): ?string
    {
        $base = config('app.frontend_url');

        return $base ? rtrim($base, '/') . '/' . ltrim($path, '/') : null;
    }

    /** Link into the staff dashboard, when its URL is configured. */
    public static function dashboardUrl(string $path = ''): ?string
    {
        $base = config('app.dashboard_url');

        return $base ? rtrim($base, '/') . '/' . ltrim($path, '/') : null;
    }
}
