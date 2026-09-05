<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // General API limiter (per token, falling back to IP).
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(90)
            ->by($request->user()?->id ?: $request->ip()));

        $identity = fn (Request $r) => mb_strtolower((string) (
            $r->input('login') ?: $r->input('email') ?: $r->input('phone') ?: ''
        ));

        // Login / register — blunts brute force and credential stuffing.
        RateLimiter::for('auth', fn (Request $request) => [
            Limit::perMinute(5)->by($request->ip() . '|' . $identity($request)),
            Limit::perMinute(20)->by($request->ip()),
        ]);

        // Password-reset request / verify — slower, so OTP guessing is infeasible.
        RateLimiter::for('otp', fn (Request $request) => [
            Limit::perMinute(3)->by($request->ip() . '|' . $identity($request)),
            Limit::perMinutes(60, 10)->by($request->ip() . '|' . $identity($request)),
        ]);
    }
}
