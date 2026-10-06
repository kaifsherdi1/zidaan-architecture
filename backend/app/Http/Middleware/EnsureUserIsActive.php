<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Deactivated accounts lose access immediately, not when their token expires.
 */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->is_active === false) {
            $user->currentAccessToken()?->delete();

            return response()->json([
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        return $next($request);
    }
}
