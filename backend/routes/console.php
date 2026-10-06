<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// --- Scheduled maintenance (runs via the `scheduler` container / `schedule:work`) ---

// Drop expired Sanctum tokens so the personal_access_tokens table stays small.
Schedule::command('sanctum:prune-expired --hours=24')->daily();

// Clear stale password-reset rows.
Schedule::command('auth:clear-resets')->daily();

// Trim old queue batch metadata and failed jobs.
Schedule::command('queue:prune-batches --hours=48')->daily();
Schedule::command('queue:prune-failed --hours=168')->weekly();
